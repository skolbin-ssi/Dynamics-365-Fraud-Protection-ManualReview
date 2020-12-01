package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.DisposabilityCheckServiceResponse;
import com.griddynamics.msd365fp.manualreview.queues.model.OpenKickboxResponse;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.OffsetDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class KickboxEmailDomainCheckProvider implements EmailDomainCheckProvider {

    @Setter(onMethod = @__({@Autowired, @Qualifier("nonAuthorizingWebClient")}))
    private WebClient nonAuthorizingWebClient;
    @Value("${mr.disposable-email-checker.open-kickbox.url}")
    private String openKickboxUrl;

    @Override
    public DisposabilityCheckServiceResponse check(String emailDomain) {
        OpenKickboxResponse openKickboxResponse = null;
        try {
            openKickboxResponse = nonAuthorizingWebClient
                    .get()
                    .uri(openKickboxUrl + emailDomain)
                    .retrieve()
                    .bodyToMono(OpenKickboxResponse.class)
                    .block();
        } catch (RuntimeException e) {
            log.error("Exception during retrieving disposibility information from KickBox.", e);
        }

        Boolean disposable = openKickboxResponse != null ? openKickboxResponse.isDisposable() : null;

        return DisposabilityCheckServiceResponse.builder()
                .disposable(disposable)
                .resource(openKickboxUrl)
                .checked(OffsetDateTime.now())
                .rawResponse(String.valueOf(disposable))
                .build();
    }
}
