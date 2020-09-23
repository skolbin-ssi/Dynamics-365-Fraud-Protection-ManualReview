// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.util;

import com.griddynamics.msd365fp.manualreview.model.Label;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectUsageException;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueView;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewSettings;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewType;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import lombok.experimental.UtilityClass;
import org.springframework.lang.NonNull;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

@UtilityClass
public class QueueViewUtility {

    public QueueView extractQueueView(
            @NonNull final Queue queue,
            @NonNull final QueueViewType viewType) {
        QueueViewSettings settings;
        if (viewType.isAbstract()) {
            settings = generateQueueViewSettings(queue, viewType);
        } else {
            settings = queue.getViews().stream()
                    .filter(qvs -> qvs.getViewType().equals(viewType))
                    .findFirst()
                    .orElseThrow();
        }
        return mapQueueToQueueView(queue, settings);
    }

    private QueueView mapQueueToQueueView(
            @NonNull final Queue queue,
            @NonNull final QueueViewSettings viewSettings) {
        return QueueView.builder()
                .viewId(viewSettings.getViewId())
                .viewType(viewSettings.getViewType())
                .queue(queue)
                .build();
    }

    public Stream<QueueView> getAllQueueViews(
            @NonNull final Queue queue,
            final boolean includeAbstractViews) {
        return Arrays.stream(QueueViewType.values())
                .filter(qvt -> (includeAbstractViews && qvt.isAbstract()) ||
                        queue.getViews().stream().anyMatch(qvs -> qvt.equals(qvs.getViewType())))
                .map(qvt -> QueueViewUtility.extractQueueView(queue, qvt));
    }

    public void addViewToQueue(
            @NonNull final Queue queue,
            @NonNull QueueViewType type) {
        if (type.isAbstract()) throw new IncorrectUsageException("An abstract view can't be added to queue");
        HashSet<QueueViewSettings> newViews = new HashSet<>(queue.getViews());
        newViews.add(QueueViewUtility.generateQueueViewSettings(queue, type));
        queue.setViews(newViews);
    }

    private QueueViewSettings generateQueueViewSettings(
            @NonNull final Queue queue,
            @NonNull QueueViewType type) {
        return QueueViewSettings.builder()
                .viewType(type)
                .viewId(type.isAbstract() ? queue.getId() : queue.getId() + "-" + type.name())
                .build();
    }
}
