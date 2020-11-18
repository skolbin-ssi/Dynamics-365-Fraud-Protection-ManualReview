// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.config;

import lombok.extern.slf4j.Slf4j;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

import static com.griddynamics.msd365fp.manualreview.model.Constants.DFP_DATE_TIME_PATTERN;


@Configuration
@Slf4j
public class DFPModelMapperConfig {

    @Bean
    public ModelMapper dfpModelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setSkipNullEnabled(true)
                .setCollectionsMergeEnabled(false)
                .setMatchingStrategy(MatchingStrategies.STRICT);
        addStringToDateConverter(modelMapper);
        return modelMapper;
    }


    @Deprecated
    private void addStringToDateConverter(ModelMapper modelMapper) {
        TypeMap<String, OffsetDateTime> typeMap = modelMapper.createTypeMap(String.class, OffsetDateTime.class);
        Converter<String, OffsetDateTime> dateConverter = ctx ->{
            log.error("Incorrect mapper usage, parsing of datetime in mapper is deprecated in favor of Jackson conversion: {}", ctx.getSource());
            return ctx.getSource() == null ?
                    null :
                    OffsetDateTime.parse(ctx.getSource(), DateTimeFormatter.ofPattern(DFP_DATE_TIME_PATTERN));
        };
        typeMap.setConverter(dateConverter);
    }
}
