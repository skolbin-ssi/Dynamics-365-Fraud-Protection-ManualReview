// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.config;

import com.griddynamics.msd365fp.manualreview.analytics.model.dto.PurchaseStatusDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.ItemLockActivityEntity;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.QueueSizeCalculationActivityEntity;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Resolution;
import com.griddynamics.msd365fp.manualreview.model.ItemLabel;
import com.griddynamics.msd365fp.manualreview.model.Label;
import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemLockEvent;
import com.griddynamics.msd365fp.manualreview.model.event.internal.OverallSizeUpdateEvent;
import com.griddynamics.msd365fp.manualreview.model.event.internal.QueueSizeUpdateEvent;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.modelmapper.TypeMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.OVERALL_SIZE_ID;

@Configuration
public class ModelMapperConfig {

    @Bean
    @Primary
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setSkipNullEnabled(true);
        addResolutionToPurchaseStatusConverter(modelMapper);
        addItemLockEventToLockActivityEntryConverter(modelMapper);
        addQueueSizeUpdateEventToQueueSizeCalculationActivityEntityConverter(modelMapper);
        addOverallSizeUpdateEventToQueueSizeCalculationActivityEntityConverter(modelMapper);
        return modelMapper;
    }

    private void addOverallSizeUpdateEventToQueueSizeCalculationActivityEntityConverter(ModelMapper modelMapper) {
        TypeMap<OverallSizeUpdateEvent, QueueSizeCalculationActivityEntity> typeMap =
                modelMapper.createTypeMap(OverallSizeUpdateEvent.class, QueueSizeCalculationActivityEntity.class);
        typeMap.addMappings(mapper -> mapper.map(OverallSizeUpdateEvent::getUpdated,
                QueueSizeCalculationActivityEntity::setCalculated));
        typeMap.addMappings(new PropertyMap<OverallSizeUpdateEvent, QueueSizeCalculationActivityEntity>() {
            @Override
            protected void configure() {
                using(ctx -> mapQueueSizeUpdateEventId((OverallSizeUpdateEvent) ctx.getSource()))
                        .map(source, destination.getId());
                using(ctx -> OVERALL_SIZE_ID).map(source, destination.getQueueId());
            }
        });
    }

    private void addQueueSizeUpdateEventToQueueSizeCalculationActivityEntityConverter(ModelMapper modelMapper) {
        TypeMap<QueueSizeUpdateEvent, QueueSizeCalculationActivityEntity> typeMap =
                modelMapper.createTypeMap(QueueSizeUpdateEvent.class, QueueSizeCalculationActivityEntity.class);
        typeMap.addMappings(mapper -> mapper.map(QueueSizeUpdateEvent::getUpdated,
                QueueSizeCalculationActivityEntity::setCalculated));
        typeMap.addMappings(new PropertyMap<QueueSizeUpdateEvent, QueueSizeCalculationActivityEntity>() {
            @Override
            protected void configure() {
                using(ctx -> mapQueueSizeUpdateEventId((QueueSizeUpdateEvent) ctx.getSource()))
                        .map(source, destination.getId());
            }
        });
    }

    private void addItemLockEventToLockActivityEntryConverter(ModelMapper modelMapper) {
        TypeMap<ItemLockEvent, ItemLockActivityEntity> typeMap =
                modelMapper.createTypeMap(ItemLockEvent.class, ItemLockActivityEntity.class);
        typeMap.addMappings(new PropertyMap<ItemLockEvent, ItemLockActivityEntity>() {
            @Override
            protected void configure() {
                using(ctx -> mapLockActivityEntryId((ItemLockEvent) ctx.getSource()))
                        .map(source, destination.getId());
            }
        });
    }

    private void addResolutionToPurchaseStatusConverter(ModelMapper modelMapper) {
        TypeMap<Resolution, PurchaseStatusDTO> typeMap = modelMapper.createTypeMap(Resolution.class, PurchaseStatusDTO.class);
        Converter<ItemLabel, String> reasonConverter = ctx -> mapReason(ctx.getSource());
        Converter<ItemLabel, String> statusTypeConverter = ctx -> mapStatusType(ctx.getSource().getValue());
        typeMap.addMappings(mapper -> {
            mapper.using(reasonConverter).map(Resolution::getLabel, PurchaseStatusDTO::setReason);
            mapper.using(statusTypeConverter).map(Resolution::getLabel, PurchaseStatusDTO::setStatusType);
        });
        typeMap.addMappings(mapper -> mapper.map(Resolution::getId, PurchaseStatusDTO::setPurchaseId));
        typeMap.addMappings(mapper -> mapper.map(r -> r.getLabel().getLabeled(), PurchaseStatusDTO::setStatusDate));
    }

    private String mapQueueSizeUpdateEventId(OverallSizeUpdateEvent event) {
        return event.getUpdated() == null ? OVERALL_SIZE_ID : OVERALL_SIZE_ID + "-" + event.getUpdated().toString();
    }

    private String mapQueueSizeUpdateEventId(QueueSizeUpdateEvent event) {
        return event.getUpdated() == null ? event.getId() : event.getId() + "-" + event.getUpdated().toString();
    }

    private String mapLockActivityEntryId(ItemLockEvent event) {
        if (event.getReleased() == null) {
            return event.getLocked() == null ? event.getId() : event.getId() + "-" + event.getLocked().toString();
        } else {
            return event.getId() + "-" + event.getReleased().toString();
        }
    }

    private String mapReason(ItemLabel value) {
        switch (value.getValue()) {
            case GOOD:
                return "OfflineManualReview_General";
            case BAD:
                return "OfflineManualReview_Fraud";
            case WATCH_NA:
                return "ManualReview_WatchNA";
            case WATCH_INCONCLUSIVE:
                return "ManualReview_Inclusive";
            default:
                return null;
        }
    }

    private String mapStatusType(Label value) {
        switch (value) {
            case GOOD:
            case WATCH_NA:
            case WATCH_INCONCLUSIVE:
                return "Approved";
            case BAD:
                return "Rejected";
            default:
                return null;
        }
    }

}
