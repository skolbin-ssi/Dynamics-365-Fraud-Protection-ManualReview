package com.griddynamics.msd365fp.manualreview.queues.config;

import com.griddynamics.msd365fp.manualreview.model.ItemLock;
import com.griddynamics.msd365fp.manualreview.model.ItemNote;
import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemLockEvent;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.ItemDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

@Configuration
public class ModelMapperConfig {
    @Bean
    @Primary
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setSkipNullEnabled(true)
                .setCollectionsMergeEnabled(false)
                .setMatchingStrategy(MatchingStrategies.STRICT);
        addItemToItemDTOConverter(modelMapper);
        addItemToItemLockEventConverter(modelMapper);
        return modelMapper;
    }

    private void addItemToItemLockEventConverter(ModelMapper modelMapper) {
        TypeMap<Item, ItemLockEvent> typeMap = modelMapper.createTypeMap(Item.class, ItemLockEvent.class);
        Converter<ItemLock, String> queueIdConverter = ctx -> ctx.getSource().getQueueId();
        Converter<ItemLock, String> analystIdConverter = ctx -> ctx.getSource().getOwnerId();
        Converter<ItemLock, OffsetDateTime> lockedConverter = ctx -> ctx.getSource().getLocked();
        typeMap.addMappings(mapper -> mapper.using(queueIdConverter).map(Item::getLock, ItemLockEvent::setQueueId));
        typeMap.addMappings(mapper -> mapper.using(analystIdConverter).map(Item::getLock, ItemLockEvent::setOwnerId));
        typeMap.addMappings(mapper -> mapper.using(lockedConverter).map(Item::getLock, ItemLockEvent::setLocked));
    }

    private void addItemToItemDTOConverter(ModelMapper modelMapper) {
        TypeMap<Item, ItemDTO> typeMap = modelMapper.createTypeMap(Item.class, ItemDTO.class);
        Converter<Set<ItemNote>, SortedSet<ItemNote>> itemNotesConverter = ctx -> {
            TreeSet<ItemNote> itemNotes = new TreeSet<>(Comparator.comparing(ItemNote::getCreated).reversed());
            itemNotes.addAll(ctx.getSource());
            return itemNotes;
        };
        typeMap.addMappings(mapper -> mapper.using(itemNotesConverter).map(Item::getNotes, ItemDTO::setNotes));
    }
}
