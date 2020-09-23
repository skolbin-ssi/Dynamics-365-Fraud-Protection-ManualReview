// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.io.BufferedWriter;
import java.io.FileWriter;

/**
 * Generation of Swagger API at compile time.
 * In accordance with
 * <a href="https://github.com/springfox/springfox/issues/1959">springfox issue</a>
 */
@SpringBootTest
public class SwaggerGenerator {

    @Autowired
    WebApplicationContext context;

    @Test
    @SuppressWarnings("java:S2699")
    public void generateSwagger() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        mockMvc.perform(MockMvcRequestBuilders.get("/v3/api-docs").accept(MediaType.APPLICATION_JSON))
                .andDo((result) -> {
                    BufferedWriter writer = new BufferedWriter(new FileWriter("api-docs.json", false));
                    ObjectMapper mapper = new ObjectMapper();
                    Object json = mapper.readValue(result.getResponse().getContentAsString(), Object.class);
                    writer.append(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json));
                    writer.close();
                });
    }
}
