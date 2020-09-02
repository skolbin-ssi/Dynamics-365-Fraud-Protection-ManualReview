package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Resolution;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import org.springframework.lang.NonNull;

import java.time.OffsetDateTime;

public interface ResolutionRepositoryCustomMethods {
    PageableCollection<String> getResolutionIdsForRetry(
            @NonNull final OffsetDateTime beforeTime,
            @NonNull final Integer maxRetries,
            final String continuationToken,
            int size);

    PageableCollection<Resolution> getResolutionsByLastUpdateDuration(
            @NonNull final OffsetDateTime startDateTime,
            @NonNull final OffsetDateTime endDateTime,
            final String continuationToken,
            int size);
}
