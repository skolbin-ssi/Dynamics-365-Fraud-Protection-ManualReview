package com.griddynamics.msd365fp.manualreview.analytics.model;

import com.griddynamics.msd365fp.manualreview.model.Label;
import lombok.Builder;
import lombok.Data;

import java.time.Duration;

/**
 * Aggregating entity for storing information on how much time
 * was spent on the item to be labeled and how many times it was
 * released from the lock.
 */
@Builder
@Data
public class LabelingTimeBucket {
    private Label label;
    /**
     * The sum of periods that items were in locked state before labeling.
     */
    private Duration totalDuration;
    /**
     * Shows how many items were released with particular label.
     */
    private int cnt;
}
