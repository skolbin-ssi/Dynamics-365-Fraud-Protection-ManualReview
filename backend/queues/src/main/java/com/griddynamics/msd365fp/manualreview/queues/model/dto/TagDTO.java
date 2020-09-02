package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.Set;

@Data
public class TagDTO {
    @NotNull
    private Set<String> tags;
}
