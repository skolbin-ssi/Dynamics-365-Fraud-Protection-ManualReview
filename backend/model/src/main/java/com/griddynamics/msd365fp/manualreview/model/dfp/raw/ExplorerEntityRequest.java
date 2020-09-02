package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ExplorerEntityRequest {
    private String nodeType;
    private String attribute;
    private String value;
}
