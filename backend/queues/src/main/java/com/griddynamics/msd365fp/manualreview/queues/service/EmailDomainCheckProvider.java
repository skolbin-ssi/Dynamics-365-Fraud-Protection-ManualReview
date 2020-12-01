package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.DisposabilityCheckServiceResponse;

public interface EmailDomainCheckProvider {
    DisposabilityCheckServiceResponse check(String emailDomain);
}
