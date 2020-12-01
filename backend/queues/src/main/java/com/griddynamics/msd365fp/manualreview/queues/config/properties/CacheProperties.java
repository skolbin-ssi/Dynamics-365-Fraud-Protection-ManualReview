// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.config.properties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import java.util.HashMap;

@ConstructorBinding
@ConfigurationProperties("mr.cache")
@Getter
@AllArgsConstructor
public class CacheProperties extends HashMap<String, CachePropertyEntry> {
}
