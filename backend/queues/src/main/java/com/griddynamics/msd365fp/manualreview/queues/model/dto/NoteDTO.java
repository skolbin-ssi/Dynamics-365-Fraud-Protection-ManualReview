package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class NoteDTO {
    @NotBlank(message = "note shouldn't be missed or blank")
    private String note;
}
