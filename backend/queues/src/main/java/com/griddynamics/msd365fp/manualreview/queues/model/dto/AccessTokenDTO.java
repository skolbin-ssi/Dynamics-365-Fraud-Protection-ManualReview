package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.time.Duration;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AccessTokenDTO {
    @NotNull
    @JsonProperty("access_token")
    private String token;
    @JsonProperty("expires_in")
    private Duration expiresIn;
    @JsonProperty("token_type")
    private String tokenType;
}

