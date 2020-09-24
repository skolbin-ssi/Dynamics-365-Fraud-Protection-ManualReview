// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service;

import com.azure.core.http.policy.ExponentialBackoff;
import com.griddynamics.msd365fp.manualreview.analytics.model.DFPResolutionSendResult;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.MetadataDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.PurchaseStatusDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.PurchaseStatusResponseDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.ResolutionDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Resolution;
import com.griddynamics.msd365fp.manualreview.analytics.repository.ResolutionRepository;
import com.griddynamics.msd365fp.manualreview.cosmos.utilities.PageProcessingUtility;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.DEFAULT_PAGE_REQUEST_SIZE;

@RequiredArgsConstructor
@Slf4j
@Service
public class ResolutionService {

    @Setter(onMethod = @__({@Autowired, @Qualifier("azureDFPAPIWebClient")}))
    private WebClient dfpClient;
    private final ResolutionRepository resolutionRepository;
    private final ModelMapper modelMapper;

    @Setter(onMethod = @__({@Autowired}))
    private ResolutionService thisService;

    @Value("${azure.cosmosdb.default-ttl}")
    private Duration defaultTtl;
    @Value("${azure.dfp.purchase-status-event-url}")
    private String purchaseStatusUrl;
    @Value("${mr.tasks.resolution-send-task.max-retries}")
    private Integer maxRetries;
    @Value("${mr.tasks.resolution-send-task.initial-retry-delay}")
    private Duration initialDelay;
    @Value("${mr.tasks.resolution-send-task.max-retry-delay}")
    private Duration maxDelay;


    private ExponentialBackoff resolutionExponentialBackOff;

    @PostConstruct
    private void initBackoff() {
        this.resolutionExponentialBackOff = new ExponentialBackoff(
                maxRetries,
                initialDelay,
                maxDelay);
    }

    public boolean sendResolutionsToDFP(final OffsetDateTime beforeTime) throws BusyException {
        log.info("Start sending resolutions ready for retry.");
        PageProcessingUtility.executeForAllPages(
                continuationToken -> resolutionRepository.getResolutionIdsForRetry(
                        beforeTime, maxRetries, continuationToken, DEFAULT_PAGE_REQUEST_SIZE),
                sentResolutions -> sentResolutions.getValues().forEach(id -> {
                    try {
                        thisService.sendAndUpdateResolution(id, false);
                    } catch (Exception e) {
                        log.warn("Attempt to send [{}] resolution ended with exception: {}", id, e.getMessage());
                    }
                }));
        log.info("Finish sending resolutions ready for retry.");
        return true;
    }

    @Retry(name = "cosmosOptimisticUpdate")
    public Resolution sendAndUpdateResolution(final String id, boolean force) throws NotFoundException {
        Resolution resolution = resolutionRepository.findById(id).orElseThrow(NotFoundException::new);
        if (force || readyToSend(resolution)) {
            DFPResolutionSendResult result;
            try {
                result = sendResolution(resolution);
            } catch (Exception e) {
                result = new DFPResolutionSendResult();
                result.setException(e.getMessage());
                log.warn("Error occurred while trying to send resolution [{}] to DFP.", resolution.getId(), e);
            }

            boolean success = result != null &&
                    result.getResponse() != null &&
                    result.getResponse().getResultDetails() != null &&
                    result.getResponse().getResultDetails().isSucceeded();
            resolution.setLastSendResult(result);
            resolution.setSentSuccessful(success);
            if (success) {
                resolution.setNextRetry(null);
                resolution.setSent(OffsetDateTime.now());
                resolution.setTtl(defaultTtl.toSeconds());
            } else {
                int retryCount = resolution.getRetryCount();
                OffsetDateTime lastRetry = resolution.getNextRetry();
                Duration retryDelay = resolutionExponentialBackOff.calculateRetryDelay(retryCount + 1);
                resolution.setNextRetry(lastRetry.plus(retryDelay));
                resolution.setRetryCount(retryCount + 1);
            }
            log.info("Save result of the resolution [{}] sending.", resolution.getId());
            resolution = resolutionRepository.save(resolution);
        }
        return resolution;
    }

    private boolean readyToSend(final Resolution resolution) {
        return (resolution.getSentSuccessful() == null || !resolution.getSentSuccessful()) &&
                resolution.getRetryCount() <= maxRetries &&
                (resolution.getNextRetry() == null || resolution.getNextRetry().isBefore(OffsetDateTime.now()));
    }

    public ResolutionDTO getResolution(final String id) throws NotFoundException {
        Resolution resolution = resolutionRepository.findById(id).orElseThrow(NotFoundException::new);
        return modelMapper.map(resolution, ResolutionDTO.class);
    }

    public PageableCollection<ResolutionDTO> getResolutions(@NonNull final OffsetDateTime startDateTime,
                                                            @NonNull final OffsetDateTime endDateTime,
                                                            final String continuationToken,
                                                            int maxPageSize) throws BusyException {
        PageableCollection<Resolution> items =
                PageProcessingUtility.getNotEmptyPage(
                        continuationToken,
                        continuation -> resolutionRepository.getResolutionsByLastUpdateDuration(
                                startDateTime,
                                endDateTime,
                                continuation,
                                maxPageSize));
        List<ResolutionDTO> resolutionDtos = items.getValues().stream()
                .map(item -> modelMapper.map(item, ResolutionDTO.class))
                .collect(Collectors.toUnmodifiableList());
        return new PageableCollection<>(resolutionDtos, items.getContinuationToken());
    }

    public ResolutionDTO resendResolution(final String id) throws NotFoundException {
        Resolution resolution = thisService.sendAndUpdateResolution(id, true);
        return modelMapper.map(resolution, ResolutionDTO.class);
    }

    private DFPResolutionSendResult sendResolution(final Resolution resolution) {
        PurchaseStatusDTO purchaseStatus = modelMapper.getTypeMap(Resolution.class, PurchaseStatusDTO.class).map(resolution);
        purchaseStatus.setMetadata(new MetadataDTO());
        log.info("Sending resolution [{}] to the DFP.", resolution.getId());
        return dfpClient.post()
                .uri(purchaseStatusUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(purchaseStatus)
                .exchange()
                .flatMap(clientResponse -> clientResponse.bodyToMono(PurchaseStatusResponseDTO.class)
                        .map(body -> new DFPResolutionSendResult(
                                body,
                                clientResponse.statusCode(),
                                null)))
                .block();
    }
}
