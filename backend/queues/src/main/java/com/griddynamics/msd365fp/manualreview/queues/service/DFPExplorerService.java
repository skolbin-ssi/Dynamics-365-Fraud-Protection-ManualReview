package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.dfp.raw.ExplorerEntity;
import com.griddynamics.msd365fp.manualreview.model.dfp.raw.ExplorerEntityRequest;
import com.griddynamics.msd365fp.manualreview.model.dfp.raw.Node;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
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

    public ExplorerEntity explorePurchase(final String id) {
        ExplorerEntityRequest request = ExplorerEntityRequest.builder()
                .attribute("PurchaseId")
                .nodeType("Purchase")
                .value(id)
                .build();
        return explore(request);
    }

    public ExplorerEntity explorePaymentInstrument(final String id) {
        ExplorerEntityRequest request = ExplorerEntityRequest.builder()
                .attribute("PaymentInstrumentId")
                .nodeType("PaymentInstrument")
                .value(id)
                .build();
        return explore(request);
    }

    public ExplorerEntity exploreUser(final String id) {
        ExplorerEntityRequest request = ExplorerEntityRequest.builder()
                .attribute("UserId")
                .nodeType("User")
                .value(id)
                .build();
        return explore(request);
    }

    private ExplorerEntity explore(final ExplorerEntityRequest request) {
        return dfpClient
                .post()
                .uri(dfpExplorerUrl)
                .body(Mono.just(request), ExplorerEntityRequest.class)
                .retrieve()
                .bodyToMono(ExplorerEntity.class)
                .block();
    }
}
