// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.DisposabilityCheck;
import com.griddynamics.msd365fp.manualreview.model.DisposabilityCheckServiceResponse;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.EmailDomain;
import com.griddynamics.msd365fp.manualreview.queues.repository.EmailDomainRepository;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailDomainService {
    private final KickboxEmailDomainCheckProvider kickboxEmailDomainCheckProvider;
    private final NameApiEmailDomainCheckProvider nameApiEmailDomainCheckProvider;

    private final EmailDomainRepository emailDomainRepository;

    @Setter(onMethod = @__({@Autowired}))
    private EmailDomainService thisService;

    @Value("${mr.email-domain.ttl}")
    private Duration emailDomainTtl;

    @Retry(name = "cosmosOptimisticUpdate")
    public void saveEmailDomain(String emailDomainName, DisposabilityCheck disposabilityCheck) {
        EmailDomain emailDomain = EmailDomain.builder()
                .emailDomainName(emailDomainName)
                .disposabilityCheck(disposabilityCheck)
                .ttl(emailDomainTtl.toSeconds())
                .build();
        emailDomainRepository.save(emailDomain);
    }

    public DisposabilityCheck checkDisposability(String emailDomain) {
        //try to get information from cache
        Optional<DisposabilityCheck> disposableDomain = getDisposabilityCheck(emailDomain);
        if (disposableDomain.isPresent()) {
            return disposableDomain.get();
        }

        DisposabilityCheckServiceResponse responseFromKickbox = kickboxEmailDomainCheckProvider.check(emailDomain);
        DisposabilityCheckServiceResponse responseFromNameApi = nameApiEmailDomainCheckProvider.check(emailDomain);
        DisposabilityCheck result = mergeDisposabilityChecks(responseFromKickbox, responseFromNameApi);

        //cache result
        if (result.getDisposable() != null) {
            thisService.saveEmailDomain(emailDomain, result);
        }

        return result;
    }

    private Optional<DisposabilityCheck> getDisposabilityCheck(final String emailDomainName) {
        return emailDomainRepository.findById(emailDomainName)
                .map(EmailDomain::getDisposabilityCheck);
    }

    private DisposabilityCheck mergeDisposabilityChecks(
            DisposabilityCheckServiceResponse... disposabilityCheckServiceResponses
    ) {
        DisposabilityCheck result = new DisposabilityCheck();

        List<DisposabilityCheckServiceResponse> nonEmptyResponses = Arrays.stream(disposabilityCheckServiceResponses)
                .filter(Objects::nonNull)
                .filter(disposabilityResponse -> disposabilityResponse.getDisposable() != null)
                .collect(Collectors.toList());
        result.setDisposabilityResponses(nonEmptyResponses);

        if (nonEmptyResponses.isEmpty()) {
            result.setDisposable(null);
        } else {
            Boolean resultDisposable = nonEmptyResponses.stream()
                    .map(DisposabilityCheckServiceResponse::getDisposable)
                    .reduce((aBoolean, aBoolean2) -> aBoolean || aBoolean2)
                    .orElse(null);
            result.setDisposable(resultDisposable);
        }

        return result;
    }
}
