package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.cosmos.utilities.PageProcessingUtility;
import com.griddynamics.msd365fp.manualreview.dfpauth.util.UserPrincipalUtility;
import com.griddynamics.msd365fp.manualreview.model.*;
import com.griddynamics.msd365fp.manualreview.model.event.type.LockActionType;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.EmptySourceException;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConditionException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueView;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.ItemDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.LabelDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.NoteDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.TagDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.SetUtils;
import org.apache.commons.lang3.SerializationUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicItemService {

    private final StreamService streamService;
    private final PublicItemClient publicItemClient;
    private final PublicQueueClient publicQueueClient;
    private final ModelMapper modelMapper;

    @Setter(onMethod = @__({@Value("${azure.cosmosdb.default-ttl}")}))
    private Duration defaultTtl;


    public ItemDTO getItem(@NonNull final String itemId, @Nullable final String queueId) throws NotFoundException {
        QueueView queueView = null;
        if (queueId != null) {
            queueView = publicQueueClient.getActiveQueueView(queueId);
        }
        Item item = publicItemClient.getActiveItem(itemId, queueView);
        return modelMapper.map(item, ItemDTO.class);
    }

    public PageableCollection<ItemDTO> getQueueItemList(
            @NonNull final String queueId,
            final int pageSize,
            @Nullable final String continuationToken) throws NotFoundException, BusyException {
        QueueView queueView = publicQueueClient.getActiveQueueView(queueId);
        PageableCollection<Item> queriedItems =
                publicItemClient.getActiveItemPageableList(queueView, pageSize, continuationToken);
        return new PageableCollection<>(
                queriedItems.getValues()
                        .stream()
                        .map(item -> modelMapper.map(item, ItemDTO.class))
                        .collect(Collectors.toList()),
                queriedItems.getContinuationToken());
    }

    @Retry(name = "cosmosOptimisticCapture")
    public ItemDTO lockFirstFreeQueueItem(final String queueId)
            throws EmptySourceException, NotFoundException, BusyException, IncorrectConditionException {
        // Get the queue and check queue-related conditions
        QueueView queueView = publicQueueClient.getActiveQueueView(queueId);
        String actor = UserPrincipalUtility.getUserId();
        log.info("User [{}] is trying to lock first free item in queue [{}].", actor, queueId);
        if (queueView.getViewType().isAbstract()) {
            throw new IncorrectConditionException(MESSAGE_ITEM_LOCKING_IN_ABSTRACT_QUEUE);
        }

        // Get the item
        PageableCollection<Item> lockedItem = publicItemClient.getLockedItemPageableList(
                actor,
                queueView,
                TOP_ELEMENT_IN_CONTAINER_PAGE_SIZE,
                TOP_ELEMENT_IN_CONTAINER_CONTINUATION);
        if (lockedItem.isEmpty()) {
            Item item = publicItemClient.getFirstFreeActiveItem(queueView);
            publicItemClient.lockItem(queueView, item);
            ItemDTO itemDTO = modelMapper.map(item, ItemDTO.class);
            // Send event "item was locked"
            streamService.sendItemLockEvent(item, null, LockActionType.SETUP);
            return itemDTO;
        } else {
            return modelMapper.map(lockedItem.iterator().next(), ItemDTO.class);
        }
    }

    @Retry(name = "cosmosOptimisticUpdate")
    public ItemDTO lockQueueItem(final String queueId, final String itemId) throws IncorrectConditionException, NotFoundException, BusyException {
        // Get user data
        List<String> roles = UserPrincipalUtility.getUserRoles();
        String actor = UserPrincipalUtility.getUserId();
        log.info("User [{}] is trying to lock item [{}] in queue [{}].", actor, itemId, queueId);

        // Get the queue and check queue-related conditions
        QueueView queueView = publicQueueClient.getActiveQueueView(queueId);
        if (queueView.getViewType().isAbstract()) {
            throw new IncorrectConditionException(MESSAGE_ITEM_LOCKING_IN_ABSTRACT_QUEUE);
        }

        // Get the item and check item-related conditions
        Item item = publicItemClient.getActiveItem(itemId, queueView);
        if (item.getLock() != null &&
                item.getLock().getOwnerId() != null &&
                !actor.equals(item.getLock().getOwnerId())) {
            String message = String.format("User [%s] tried to lock item [%s], " +
                            "but it is locked by user [%s].",
                    actor, itemId, item.getLock().getOwnerId());
            throw new IncorrectConditionException(message);
        } else if (item.getLock() == null || item.getLock().getOwnerId() == null) {
            PageableCollection<Item> lockedItem = publicItemClient.getLockedItemPageableList(
                    actor,
                    queueView,
                    TOP_ELEMENT_IN_CONTAINER_PAGE_SIZE,
                    TOP_ELEMENT_IN_CONTAINER_CONTINUATION);
            if (!lockedItem.isEmpty()) {
                String message = String.format("User [%s] tried to lock item [%s], " +
                                "but he has already locked item [%s] in this queueView.",
                        actor, itemId, lockedItem.iterator().next().getId());
                throw new IncorrectConditionException(message);
            }
        }
        if (item.getHold() != null &&
                item.getHold().getOwnerId() != null &&
                !actor.equals(item.getHold().getOwnerId())) {
            String message = String.format("User [%s] tried to lock item [%s], " +
                            "but it is held by user [%s].",
                    actor, itemId, item.getLock().getOwnerId());
            throw new IncorrectConditionException(message);
        }

        // Check common conditions
        if (queueView.getSorting().isLocked() &&
                !roles.contains(ADMIN_MANAGER_ROLE) &&
                !(item.getHold() != null && actor.equals(item.getHold().getOwnerId()))) {
            String message = String.format("User [%s] tried to lock random item in [%s] queue, " +
                    "but the user is neither manager nor the hold owner.", actor, queueId);
            throw new IncorrectConditionException(message);
        }
        if (item.getLock() == null || item.getLock().getOwnerId() == null) {
            publicItemClient.lockItem(queueView, item);
            // Send event "item was locked"
            streamService.sendItemLockEvent(item, null, LockActionType.SETUP);
        }
        return modelMapper.map(item, ItemDTO.class);
    }

    @Retry(name = "cosmosOptimisticUpdate")
    public ItemDTO unlockItem(final String itemId) throws NotFoundException, IncorrectConditionException {
        log.info("Trying to unlock item [{}].", itemId);
        Item item = publicItemClient.getActiveItem(itemId, null);
        if (item.getLock() == null || item.getLock().getOwnerId() == null) {
            throw new IncorrectConditionException("Item isn't locked");
        }
        Item oldItem = SerializationUtils.clone(item);
        item.unlock();
        publicItemClient.updateItem(item, oldItem);
        streamService.sendItemLockEvent(item, oldItem.getLock(), LockActionType.MANUAL_RELEASE);
        return modelMapper.map(item, ItemDTO.class);
    }

    @Retry(name = "cosmosOptimisticUpdate")
    public void labelItem(final String id, final LabelDTO labelAssignment)
            throws IncorrectConditionException, NotFoundException {
        // Get the actor
        String actor = UserPrincipalUtility.getUserId();
        log.info("User [{}] is trying to label item [{}] with label [{}].", actor, id, labelAssignment);

        // Get the item
        Item item = publicItemClient.getActiveItem(id, null);
        Item oldItem = SerializationUtils.clone(item);

        // Get queue and check queue-related conditions
        QueueView queueView = publicQueueClient.getActiveQueueView(item.getLock().getQueueViewId());
        if (!queueView.getAllowedLabels().contains(labelAssignment.getLabel())) {
            log.warn("User [{}] attempted to label an item [{}] with the disabled label [{}].",

                    actor, id, labelAssignment.getLabel());
            throw new IncorrectConditionException(
                    String.format("User [%s] attempted to label an item [%s] with the disabled label [%s].",
                            actor, id, labelAssignment.getLabel()));
        }

        // Apply the label
        if (item.getLabel() == null) {
            item.setLabel(new ItemLabel());
        }
        item.getLabel().label(labelAssignment.getLabel(), actor, queueView.getQueueId(), queueView.getViewId());
        item.getNotes().add(ItemNote.builder()
                .created(OffsetDateTime.now())
                .note(String.format("# Applied [%s] label", labelAssignment.getLabel()))
                .userId(UserPrincipalUtility.getUserId())
                .build());
        switch (labelAssignment.getLabel()) {
            case ACCEPT:
            case REJECT:
            case WATCH_NA:
            case WATCH_INCONCLUSIVE:
                labelResolution(item, oldItem);
                break;
            case ESCALATE:
                labelEscalate(item, oldItem, queueView, actor);
                break;
            case HOLD:
                labelHold(item, oldItem, queueView, actor);
                break;
            default:
                throw new IncorrectConditionException(
                        String.format("User [%s] attempted to label an item [%s] with unsupported label [%s].",
                                actor, id, labelAssignment.getLabel()));
        }
        // Send event "item was unlocked"
        streamService.sendItemLockEvent(item, oldItem.getLock(), LockActionType.LABEL_APPLIED_RELEASE);
        // Send labeling event
        streamService.sendItemLabelEvent(item, oldItem);
    }

    @Retry(name = "cosmosOptimisticUpdate")
    public void commentItem(final String id, final NoteDTO noteAssignment) throws NotFoundException {
        // Get the item
        Item item = publicItemClient.getActiveItem(id, null);
        Item oldItem = SerializationUtils.clone(item);

        // Add the comment
        item.getNotes().add(ItemNote.builder()
                .created(OffsetDateTime.now())
                .note(noteAssignment.getNote())
                .userId(UserPrincipalUtility.getUserId())
                .build());
        publicItemClient.updateItem(item, oldItem);
    }

    @Retry(name = "cosmosOptimisticUpdate")
    public void tagItem(final String id, final TagDTO tagAssignment) throws NotFoundException {
        // Get the item
        Item item = publicItemClient.getActiveItem(id, null);
        Item oldItem = SerializationUtils.clone(item);

        // Change tags
        modelMapper.map(tagAssignment, item);
        StringBuilder actionStringBuilder = new StringBuilder();
        Set<String> deletedTags = SetUtils.difference(oldItem.getTags(), item.getTags());
        Set<String> addedTags = SetUtils.difference(item.getTags(), oldItem.getTags());
        if (!deletedTags.isEmpty()) {
            actionStringBuilder.append(String.format("# Deleted tag(s) %s", deletedTags));
        }
        if (!addedTags.isEmpty()) {
            if (actionStringBuilder.length() > 0) {
                actionStringBuilder.append("\n");
            }
            actionStringBuilder.append(String.format("# Added tag(s) %s", addedTags));
        }
        item.getNotes().add(ItemNote.builder()
                .created(OffsetDateTime.now())
                .note(actionStringBuilder.toString())
                .userId(UserPrincipalUtility.getUserId())
                .build());
        publicItemClient.updateItem(item, oldItem);
    }

    /**
     * Get locked items.
     * Returns items that are locked by current user and
     * filters them by active queues (locks from deleted queues
     * shouldn't be shown)
     *
     * @return list of locked items
     * @throws BusyException when it's impossible to collect all required data
     *                       from database
     */
    public Collection<ItemDTO> getLockedItemsForCurrentUser() throws BusyException {
        String userId = UserPrincipalUtility.getUserId();
        Collection<String> queues = publicQueueClient.getActiveQueueList(null).stream()
                .map(Queue::getId)
                .collect(Collectors.toSet());
        Collection<Item> lockedItems = PageProcessingUtility.getAllPages(
                continuation -> publicItemClient.getLockedItemPageableList(
                        userId,
                        null,
                        DEFAULT_ITEM_PAGE_SIZE,
                        continuation));
        return lockedItems.stream()
                .filter(item -> queues.contains(item.getLock().getQueueId()))
                .map(item -> modelMapper.map(item, ItemDTO.class))
                .collect(Collectors.toList());
    }

    private void labelResolution(Item item, Item oldItem) {
        item.unlock();
        item.deactivate(defaultTtl.toSeconds());
        item.setQueueIds(Set.of());
        publicItemClient.updateItem(item, oldItem);

        streamService.sendItemAssignmentEvent(item, oldItem.getQueueIds());
        streamService.sendItemResolvedEvent(item);
        streamService.sendItemLockEvent(item, oldItem.getLock(), LockActionType.LABEL_APPLIED_RELEASE);
        streamService.sendItemLabelEvent(item, oldItem);
    }

    private void labelEscalate(Item item, Item oldItem, QueueView queueView, String actor) {
        item.unlock();
        item.setEscalation(ItemEscalation.builder()
                .escalated(OffsetDateTime.now())
                .queueId(queueView.getQueueId())
                .reviewerId(actor)
                .build());
        item.setQueueIds(Collections.singleton(queueView.getQueueId()));
        publicItemClient.updateItem(item, oldItem);

        streamService.sendItemAssignmentEvent(item, oldItem.getQueueIds());
        streamService.sendItemLockEvent(item, oldItem.getLock(), LockActionType.LABEL_APPLIED_RELEASE);
        streamService.sendItemLabelEvent(item, oldItem);
    }

    private void labelHold(Item item, Item oldItem, QueueView queueView, String actor) {
        item.unlock();
        item.setHold(ItemHold.builder()
                .held(OffsetDateTime.now())
                .queueId(queueView.getQueueId())
                .queueViewId(queueView.getViewId())
                .ownerId(actor)
                .build());
        publicItemClient.updateItem(item, oldItem);

        streamService.sendItemLockEvent(item, oldItem.getLock(), LockActionType.LABEL_APPLIED_RELEASE);
        streamService.sendItemLabelEvent(item, oldItem);
    }
}
