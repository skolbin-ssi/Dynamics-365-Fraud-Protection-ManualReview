// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.dfpauth.util.UserPrincipalUtility;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.dfp.Address;
import com.griddynamics.msd365fp.manualreview.model.dfp.DeviceContext;
import com.griddynamics.msd365fp.manualreview.model.dfp.PaymentInstrument;
import com.griddynamics.msd365fp.manualreview.model.dfp.User;
import com.griddynamics.msd365fp.manualreview.model.dfp.raw.*;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.EmptySourceException;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConditionException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.LinkAnalysisField;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueView;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.*;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.LinkAnalysis;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.model.Constants.DFP_DATE_TIME_PATTERN;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.MESSAGE_ITEM_IS_EMPTY;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicLinkAnalysisService {
    public static final int LA_ITEM_DB_REQUEST_SIZE = 200;
    public static final int LA_ITEM_DFP_REQUEST_SIZE = 25;
    private final PublicItemClient publicItemClient;
    private final PublicQueueClient publicQueueClient;
    private final ModelMapper modelMapper;
    private final PublicLinkAnalysisClient publicLinkAnalysisClient;
    private final DataSecurityService dataSecurityService;
    private final DFPExplorerService dfpExplorerService;

    @Setter(onMethod = @__({@Autowired, @Qualifier("azureDFPLAAPIWebClient")}))
    private WebClient dfpClient;

    @Value("${azure.dfp.link-analysis-full-url}")
    private String dfpLinkAnalysisFullUrl;
    @Value("${azure.dfp.link-analysis-count-url}")
    private String dfpLinkAnalysisCountUrl;
    @Value("${azure.dfp.link-analysis-details-url}")
    private String dfpLinkAnalysisDetailsUrl;
    @Value("${mr.link-analysis.ttl}")
    private Duration ttl;
    @Value("${mr.link-analysis.check-user-restriction}")
    private boolean checkUserRestriction;


    public LinkAnalysisDTO createLinkAnalysisEntry(final LinkAnalysisCreationDTO request) throws NotFoundException, IncorrectConditionException, EmptySourceException, BusyException {
        QueueView queueView = null;
        if (request.getQueueId() != null) {
            queueView = publicQueueClient.getActiveQueueView(request.getQueueId());
        }
        Item item = publicItemClient.getItem(request.getItemId(), queueView, null);

        if (item.getPurchase() == null) {
            throw new IncorrectConditionException(MESSAGE_ITEM_IS_EMPTY);
        }
        Set<String> intersectionIds = new HashSet<>();
        LinkAnalysis linkAnalysis = LinkAnalysis.builder()
                .id(UUID.randomUUID().toString())
                .ownerId(UserPrincipalUtility.getUserId())
                .analysisFields(request.getFields())
                .fields(new HashSet<>())
                .ttl(ttl.toSeconds())
                .build();

        // prepare request to DFP
        PaymentInstrument pi = item.getPurchase().getPaymentInstrumentList().stream()
                .max(Comparator.comparing(PaymentInstrument::getMerchantLocalDate))
                .orElse(null);
        DeviceContext dc = item.getPurchase().getDeviceContext();
        User user = item.getPurchase().getUser();
        Address ba = item.getPurchase().getAddressList().stream()
                .filter(a -> "BILLING".equalsIgnoreCase(a.getType()))
                .max(Comparator.comparing(Address::getAddressId))
                .orElse(null);
        LinkAnalysisRequest dfpRequest = new LinkAnalysisRequest();
        if (user != null) {
            dfpRequest.put(LinkAnalysisField.CREATION_DATE.getRelatedLAName(),
                    user.getCreationDate().format(DateTimeFormatter.ofPattern(DFP_DATE_TIME_PATTERN)));
            dfpRequest.put(LinkAnalysisField.EMAIL.getRelatedLAName(), user.getEmail());
        }
        if (dc != null) {
            dfpRequest.put(LinkAnalysisField.DISCOVERED_IP_ADDRESS.getRelatedLAName(), dc.getDiscoveredIPAddress());
            dfpRequest.put(LinkAnalysisField.MERCHANT_FUZZY_DEVICE_ID.getRelatedLAName(), dc.getMerchantFuzzyDeviceId());
        }
        if (pi != null) {
            dfpRequest.put(LinkAnalysisField.MERCHANT_PAYMENT_INSTRUMENT_ID.getRelatedLAName(), pi.getMerchantPaymentInstrumentId());
            dfpRequest.put(LinkAnalysisField.HOLDER_NAME.getRelatedLAName(), pi.getHolderName());
            dfpRequest.put(LinkAnalysisField.BIN.getRelatedLAName(), pi.getBin());
        }
        if (ba != null) {
            dfpRequest.put(LinkAnalysisField.ZIPCODE.getRelatedLAName(), ba.getZipCode());
        }

        // request data from DFP
        LinkAnalysisCountResponse dfpCountResults = dfpClient
                .post()
                .uri(dfpLinkAnalysisCountUrl)
                .body(Mono.just(dfpRequest), LinkAnalysisRequest.class)
                .retrieve()
                .bodyToMono(LinkAnalysisCountResponse.class)
                .block();
        if (dfpCountResults == null) throw new EmptySourceException();
        LinkAnalysisRequest dfpFullRequest = new LinkAnalysisRequest();
        dfpFullRequest.putAll(dfpRequest);
        for (LinkAnalysisField field : LinkAnalysisField.values()) {
            if (!request.getFields().contains(field)) {
                dfpFullRequest.remove(field.getRelatedLAName());
            }
        }

        // request purchase Ids
        LinkAnalysisFullResponse dfpFullResults;
        if (!request.getFields().isEmpty()) {
            dfpFullResults = dfpClient
                    .post()
                    .uri(dfpLinkAnalysisFullUrl)
                    .body(Mono.just(dfpFullRequest), LinkAnalysisRequest.class)
                    .retrieve()
                    .bodyToMono(LinkAnalysisFullResponse.class)
                    .block();
            if (dfpFullResults == null) throw new EmptySourceException();
        } else {
            dfpFullResults = new LinkAnalysisFullResponse();
        }

        // map data to response
        dfpFullResults.entrySet().stream()
                .min(Comparator.comparing(e -> e.getValue().getPurchaseCounts()))
                .ifPresent(e -> intersectionIds.addAll(dfpFullResults.get(e.getKey()).getPurchaseIds()));
        for (LinkAnalysisField field : LinkAnalysisField.values()) {
            LinkAnalysis.FieldLinks fieldLinks = LinkAnalysis.FieldLinks.builder()
                    .id(field)
                    .value(dfpRequest.get(field.getRelatedLAName()))
                    .build();
            if (dfpFullResults.containsKey(field.getRelatedLAName())) {
                fieldLinks.setPurchaseCounts(dfpFullResults.get(field.getRelatedLAName()).getPurchaseCounts());
                fieldLinks.setPurchaseIds(dfpFullResults.get(field.getRelatedLAName()).getPurchaseIds());
                intersectionIds.retainAll(dfpFullResults.get(field.getRelatedLAName()).getPurchaseIds());
            } else if (dfpCountResults.containsKey(field.getRelatedLAName())) {
                fieldLinks.setPurchaseCounts(dfpCountResults.get(field.getRelatedLAName()));
            }
            linkAnalysis.getFields().add(fieldLinks);
        }
        linkAnalysis.setFound(intersectionIds.size());


        if (!request.getFields().isEmpty()) {
            Collection<Queue> queues = publicQueueClient.getActiveQueueList(null);

            for (int i = 0; i < intersectionIds.size(); i += LA_ITEM_DB_REQUEST_SIZE) {
                Set<String> idsForRequest = intersectionIds.stream().skip(i).limit(LA_ITEM_DB_REQUEST_SIZE).collect(Collectors.toSet());
                linkAnalysis.getMrPurchaseIds().addAll(publicItemClient.getItemInfoByIds(idsForRequest, queues).stream()
                        .map(itemInfo -> modelMapper.map(itemInfo, LinkAnalysis.MRItemInfo.class))
                        .collect(Collectors.toSet()));
            }
            intersectionIds.removeAll(linkAnalysis.getMrPurchaseIds().stream()
                    .map(LinkAnalysis.MRItemInfo::getId).collect(Collectors.toSet()));
            linkAnalysis.getDfpPurchaseIds().addAll(intersectionIds);
            linkAnalysis.setFoundInMR(linkAnalysis.getMrPurchaseIds().size());
        }

        publicLinkAnalysisClient.saveLinkAnalysisEntry(linkAnalysis);

        return modelMapper.map(linkAnalysis, LinkAnalysisDTO.class);
    }

    public PageableCollection<LAItemDTO> getMRItems(
            final String id,
            final Integer size,
            final String continuation
    ) throws NotFoundException, BusyException {
        LinkAnalysis linkAnalysis = publicLinkAnalysisClient.getLinkAnalysisEntry(id);
        int start = continuation == null ? 0 : Integer.parseInt(continuation);
        Set<String> idsForRequest = linkAnalysis.getMrPurchaseIds().stream()
                .skip(start)
                .limit(size)
                .map(LinkAnalysis.MRItemInfo::getId)
                .collect(Collectors.toSet());
        int end = start + idsForRequest.size();
        TreeSet<LAItemDTO> result = new TreeSet<>(Comparator
                .comparing((LAItemDTO dto) -> dto.getItem().getImported())
                .thenComparing((LAItemDTO dto) -> dto.getItem().getId()));

        Collection<Queue> queues = publicQueueClient.getActiveQueueList(null);

        for (int i = 0; i < idsForRequest.size(); i += LA_ITEM_DB_REQUEST_SIZE) {
            Set<String> idsForLocalRequest = idsForRequest.stream().skip(i).limit(LA_ITEM_DB_REQUEST_SIZE).collect(Collectors.toSet());
            result.addAll(publicItemClient.getItemListByIds(idsForLocalRequest, queues).stream()
                    .map(item -> LAItemDTO.builder()
                            .item(modelMapper.map(item, ItemDTO.class))
                            .availableForLabeling(dataSecurityService.checkPermissionForItemUpdateWithoutLock(
                                    UserPrincipalUtility.getAuth(), item, queues))
                            .build())
                    .collect(Collectors.toList()));
        }

        if (checkUserRestriction) {
            result.forEach(item -> {
                if (item.getItem() != null &&
                        item.getItem().getPurchase() != null &&
                        item.getItem().getPurchase().getUser() != null &&
                        item.getItem().getPurchase().getUser().getEmail() != null) {
                    UserEmailListEntity userEmailLists = dfpExplorerService.exploreUserEmailList(item.getItem().getPurchase().getUser().getEmail());
                    item.setUserRestricted(userEmailLists.getCommonRestriction());
                }
            });
        }

        return new PageableCollection<>(result,
                end < linkAnalysis.getMrPurchaseIds().size() ? String.valueOf(end) : null);
    }

    public PageableCollection<DFPItemDTO> getDFPItems(
            final String id,
            final Integer size,
            final String continuation
    ) throws NotFoundException {
        LinkAnalysis linkAnalysis = publicLinkAnalysisClient.getLinkAnalysisEntry(id);

        int start = continuation == null ? 0 : Integer.parseInt(continuation);
        Set<String> idsForRequest = linkAnalysis.getDfpPurchaseIds().stream()
                .skip(start)
                .limit(size)
                .collect(Collectors.toSet());
        int end = start + idsForRequest.size();

        TreeSet<DFPItemDTO> result = new TreeSet<>(Comparator.comparing(DFPItemDTO::getPurchaseId));
        for (int i = 0; i < idsForRequest.size(); i += LA_ITEM_DFP_REQUEST_SIZE) {
            Set<String> idsForLocalRequest = idsForRequest.stream().skip(i).limit(LA_ITEM_DFP_REQUEST_SIZE).collect(Collectors.toSet());
            LinkAnalysisDetailsResponse dfpDetailsResults = dfpClient
                    .post()
                    .uri(dfpLinkAnalysisDetailsUrl)
                    .body(Mono.just(new LinkAnalysisDetailsRequest(idsForLocalRequest)), LinkAnalysisDetailsRequest.class)
                    .retrieve()
                    .bodyToMono(LinkAnalysisDetailsResponse.class)
                    .block();
            if (dfpDetailsResults != null && dfpDetailsResults.getPurchaseDetails() != null) {
                result.addAll(dfpDetailsResults.getPurchaseDetails().stream()
                        .map(details -> modelMapper.map(details, DFPItemDTO.class))
                        .collect(Collectors.toSet()));
            }
        }

        if (checkUserRestriction) {
            result.forEach(details -> {
                if (details.getUser() != null &&
                        details.getUser().getEmail() != null) {
                    UserEmailListEntity userEmailLists = dfpExplorerService.exploreUserEmailList(details.getUser().getEmail());
                    details.setUserRestricted(userEmailLists.getCommonRestriction());
                }
            });
        }

        return new PageableCollection<>(result,
                end < linkAnalysis.getMrPurchaseIds().size() ? String.valueOf(end) : null);
    }

    public LinkAnalysisDTO getLinkAnalysisEntry(final String id) throws NotFoundException {
        return modelMapper.map(publicLinkAnalysisClient.getLinkAnalysisEntry(id), LinkAnalysisDTO.class);
    }
}
