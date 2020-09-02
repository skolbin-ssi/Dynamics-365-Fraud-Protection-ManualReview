package com.griddynamics.msd365fp.manualreview.analytics.config;

import com.griddynamics.msd365fp.manualreview.analytics.model.dto.LabelEventDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.PurchaseStatusDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.ItemLabelActivityEntity;
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
        addResolutionToLabelEventConverter(modelMapper);
        addResolutionToPurchaseStatusConverter(modelMapper);
        addItemLabelToItemLabelActivityEntityConverter(modelMapper);
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

    private void addItemLabelToItemLabelActivityEntityConverter(ModelMapper modelMapper) {
        TypeMap<ItemLabel, ItemLabelActivityEntity> typeMap = modelMapper.addMappings(new PropertyMap<ItemLabel, ItemLabelActivityEntity>() {
            @Override
            protected void configure() {
                skip(destination.getId());
            }
        });
        Converter<Label, String> merchantRuleDecisionConverter = ctx -> mapStatusType(ctx.getSource());
        typeMap.addMappings(mapper -> mapper.map(ItemLabel::getAuthorId, ItemLabelActivityEntity::setAnalystId));
        typeMap.addMappings(mapper -> mapper.map(ItemLabel::getValue, ItemLabelActivityEntity::setLabel));
        typeMap.addMappings(mapper -> mapper.using(merchantRuleDecisionConverter).map(ItemLabel::getValue, ItemLabelActivityEntity::setMerchantRuleDecision));
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

    private void addResolutionToLabelEventConverter(ModelMapper modelMapper) {
        TypeMap<Resolution, LabelEventDTO> typeMap = modelMapper.createTypeMap(Resolution.class, LabelEventDTO.class);
        typeMap.addMappings(mapper -> mapper.map(Resolution::getId, LabelEventDTO::setLabelObjectId));
        Converter<ItemLabel, String> labelStateConverter = ctx -> mapLabelState(ctx.getSource());
        typeMap.addMappings(mapper -> mapper.using(labelStateConverter).map(Resolution::getLabel, LabelEventDTO::setLabelState));
        typeMap.addMappings(mapper -> mapper.map(Resolution::getImported, LabelEventDTO::setEffectiveStartDate));
        typeMap.addMappings(mapper -> mapper.map(r -> r.getLabel().getLabeled(), LabelEventDTO::setEffectiveEndDate));
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
            case ACCEPT:
                return "OfflineManualReview_General";
            case REJECT:
                return "OfflineManualReview_Fraud";
            case WATCH_NA:
            case WATCH_INCONCLUSIVE:
                return "OfflineManualReview_Watchlist";
            default:
                return null;
        }
    }

    private String mapStatusType(Label value) {
        switch (value) {
            case ACCEPT:
            case WATCH_NA:
            case WATCH_INCONCLUSIVE:
                return "Approved";
            case REJECT:
                return "Rejected";
            default:
                return null;
        }
    }

    private String mapLabelState(ItemLabel value) {
        switch (value.getValue()) {
            case ACCEPT:
            case WATCH_NA:
            case WATCH_INCONCLUSIVE:
                return "Accepted";
            case REJECT:
                return "Fraud";
            default:
                return null;
        }
    }
}
