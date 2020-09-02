package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.cosmos.utilities.PageProcessingUtility;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueView;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewSettings;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewType;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import com.griddynamics.msd365fp.manualreview.queues.repository.QueueRepository;
import com.griddynamics.msd365fp.manualreview.queues.util.QueueViewUtility;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DEFAULT_QUEUE_PAGE_SIZE;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.MESSAGE_QUEUE_NOT_FOUND;

@Service
@Slf4j
@RequiredArgsConstructor
public class PublicQueueClient {
    private final QueueRepository queueRepository;

    @PostFilter("@dataSecurityService.checkPermissionForQueueViewReading(authentication,filterObject)")
    public Collection<QueueView> getActiveQueueViewList(
            @Nullable Boolean residual,
            @NonNull QueueViewType viewType) throws BusyException {
        Collection<Queue> queues = PageProcessingUtility.getAllPages(
                continuation -> queueRepository.getQueueList(
                        true,
                        residual,
                        DEFAULT_QUEUE_PAGE_SIZE,
                        continuation));
        return queues.stream()
                .filter(q -> viewType.isAbstract()
                        || q.getViews().stream().anyMatch(qvs -> viewType.equals(qvs.getViewType())))
                .map(q -> QueueViewUtility.extractQueueView(q, viewType))
                .collect(Collectors.toList());
    }

    @PostFilter("@dataSecurityService.checkPermissionForQueueReading(authentication,filterObject)")
    public Collection<Queue> getActiveQueueList(
            @Nullable Boolean residual) throws BusyException {
        return PageProcessingUtility.getAllPages(
                continuation -> queueRepository.getQueueList(
                        true,
                        residual,
                        DEFAULT_QUEUE_PAGE_SIZE,
                        continuation));
    }

    @PostAuthorize("@dataSecurityService.checkPermissionForQueueViewReading(authentication,returnObject)")
    public QueueView getActiveQueueView(@NonNull String id) throws NotFoundException {
        Queue queue = queueRepository.getActiveQueueByIdOrViewId(id)
                .orElseThrow(() -> new NotFoundException(MESSAGE_QUEUE_NOT_FOUND));
        if (queue.getId().equals(id)) {
            return QueueViewUtility.extractQueueView(queue, QueueViewType.DIRECT);
        } else {
            QueueViewType viewType = queue.getViews().stream()
                    .filter(qvs -> qvs.getViewId().equals(id))
                    .map(QueueViewSettings::getViewType)
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException(MESSAGE_QUEUE_NOT_FOUND));
            return QueueViewUtility.extractQueueView(queue, viewType);
        }
    }

    @PreAuthorize("@dataSecurityService.checkPermissionForQueueCreation(authentication)")
    public void createQueue(@NonNull Queue queue) {
        queueRepository.save(queue);
        log.info("The queue [{}] with ID [{}] has been created.", queue.getName(), queue.getId());
    }

    @PreAuthorize("@dataSecurityService.checkPermissionForQueueUpdate(authentication, #newVersion, #oldVersion)")
    public void updateQueue(@NonNull Queue newVersion, @NonNull Queue oldVersion) {
        queueRepository.save(newVersion);
        if (!newVersion.isActive()) {
            log.info("The queue [{}] with ID [{}] has been deleted.", newVersion.getName(), newVersion.getId());
        } else {
            log.info("The queue [{}] with ID [{}] has been modified.", newVersion.getName(), newVersion.getId());
        }
    }

}
