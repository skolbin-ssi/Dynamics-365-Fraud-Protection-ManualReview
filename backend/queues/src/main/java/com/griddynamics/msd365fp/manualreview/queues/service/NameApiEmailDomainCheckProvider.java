package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.DisposabilityCheckServiceResponse;
import com.griddynamics.msd365fp.manualreview.queues.model.NameApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import javax.annotation.Nullable;
import java.time.OffsetDateTime;

import static com.griddynamics.msd365fp.manualreview.queues.model.NameApiResponse.DisposabilityStatus.YES;

@Service
@Slf4j
@RequiredArgsConstructor
public class NameApiEmailDomainCheckProvider implements EmailDomainCheckProvider {
    @Setter(onMethod = @__({@Autowired, @Qualifier("nonAuthorizingWebClient")}))
    private WebClient nonAuthorizingWebClient;
    @Value("${mr.disposable-email-checker.name-api.url}")
    private String nameApiUrl;
    @Value("${mr.disposable-email-checker.name-api.api-key}")
    private String nameApiKey;

    @Override
    public @Nullable DisposabilityCheckServiceResponse check(String emailDomain) {
        if (StringUtils.isEmpty(nameApiKey)) {
            log.info("NameApi service Api Key not provided. Skipping this service");
            return null;
        }

        NameApiResponse nameApiResponse = null;
        try {
            nameApiResponse = nonAuthorizingWebClient
                    .get()
                    .uri(String.format(nameApiUrl, nameApiKey, emailDomain))
                    .retrieve()
                    .bodyToMono(NameApiResponse.class)
                    .block();
        } catch (RuntimeException e) {
            log.error("Exception during retrieving disposibility information from NameApi.", e);
        }

        return DisposabilityCheckServiceResponse.builder()
                .disposable(nameApiResponse != null ? YES.equals(nameApiResponse.getDisposable()) : null)
                .resource("NameApi")
                .checked(OffsetDateTime.now())
                .rawResponse(nameApiResponse != null ? nameApiResponse.getDisposable().name() : null)
                .build();
    }
}
