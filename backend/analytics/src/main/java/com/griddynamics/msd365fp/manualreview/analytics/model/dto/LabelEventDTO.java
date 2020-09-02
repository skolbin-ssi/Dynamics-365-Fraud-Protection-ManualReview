package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.griddynamics.msd365fp.manualreview.model.Label;
import lombok.Builder;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.OffsetDateTime;

/**
 * Risk metadata label to send to DFP as a final resolution.
 */
@Data
public class LabelEventDTO {

    /**
     * EntityName to which this label entity applies. If set to Email, the User id is looked-up from an email
     * LabelObjectId.
     */
    private String labelObjectType = "Purchase";

    /**
     * The Id value within the LabelObjectType to which this label entity applies.
     */
    private String labelObjectId;

    /**
     * The authority issuing this label's LabelReasonCodes or LabelState.
     */
    private String labelSource = "ManualReview";

    private String labelReasonCodes;

    /**
     * If the LabelSource has state-transitions, the current state of this label. Ex. "Accepted" to mean a prior
     * fraud suspicion has been cleared. Possible values ''Accepted' | 'Fraud'
     */
    private String labelState;

    /**
     * The specific LabelSource institution issuing the LabelReasonCodes.
     */
    private String processor;

    /**
     * The event's ultimate creation as reported from LabelSource/Processor. Format is ISO8601.
     */
    private String eventTimeStamp;

    /**
     * The beginning of when this Label applies in Merchant time-zone (if different from MerchantLocalDate).
     * Format is ISO8601.
     */
    private String effectiveStartDate;

    /**
     * The end of when this Label applies in Merchant time-zone or null for not-applicable/indeterminate. Format is ISO8601.
     */
    private String effectiveEndDate;

    @NotNull
    @JsonProperty(value = "_metadata")
    private MetadataDTO metadata;
}
