// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.dfp.raw.*;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Service has methods for enriching all types of {@link ExplorerEntity}s.
 * It uses DFP client which call DFP Explorer API to retrieve purchases,
 * payment instruments, users by {@link Node#getId()}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DFPExplorerService {

    @Setter(onMethod = @__({@Autowired, @Qualifier("azureDFPAPIWebClient")}))
    private WebClient dfpClient;
    @Value("${azure.dfp.graph-explorer-url}")
    private String dfpExplorerUrl;
    @Value("${azure.dfp.user-email-list-url}")
    private String userEmailListUrl;

    @Cacheable(value = "user-email-list")
    public UserEmailListEntity exploreUserEmailList(final String email) {
        UserEmailListEntityRequest request = new UserEmailListEntityRequest(email);
        log.info("Start User.Email list retrieving for [{}].", email);
        UserEmailListEntity result = dfpClient
                .post()
                .uri(userEmailListUrl)
                .body(Mono.just(request), UserEmailListEntityRequest.class)
                .retrieve()
                .bodyToMono(UserEmailListEntity.class)
                .block();
        log.info("User.Email list for [{}] has been retrieved successfully: [{}].", email,
                result != null ? result.getCommon() : "null");
        return result;
    }

    @Cacheable(value = "traversal-purchase", unless = "#result.isEmpty()")
    public ExplorerEntity explorePurchase(final String id) {
        ExplorerEntityRequest request = ExplorerEntityRequest.builder()
                .attribute("PurchaseId")
                .nodeType("Purchase")
                .value(id)
                .build();
        return explore(request);
    }

    @Cacheable(value = "traversal-pi", unless = "#result.isEmpty()")
    public ExplorerEntity explorePaymentInstrument(final String id) {
        ExplorerEntityRequest request = ExplorerEntityRequest.builder()
                .attribute("PaymentInstrumentId")
                .nodeType("PaymentInstrument")
                .value(id)
                .build();
        return explore(request);
    }

    @Cacheable(value = "traversal-user", unless = "#result.isEmpty()")
    public ExplorerEntity exploreUser(final String id) {
        ExplorerEntityRequest request = ExplorerEntityRequest.builder()
                .attribute("UserId")
                .nodeType("User")
                .value(id)
                .build();
        return explore(request);
    }

    private ExplorerEntity explore(final ExplorerEntityRequest request) {
        log.info("Start exploration of [{}] [{}]", request.getAttribute(), request.getValue());
        ExplorerEntity result = dfpClient
                .post()
                .uri(dfpExplorerUrl)
                .body(Mono.just(request), ExplorerEntityRequest.class)
                .retrieve()
                .bodyToMono(ExplorerEntity.class)
                .block();
        log.info("Exploration of [{}] [{}] has finished successfully", request.getAttribute(), request.getValue());
        result.setRequestAttributeName(request.getAttribute());
        result.setRequestAttributeValue(request.getValue());
        return result;
    }
}
