// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.task.TaskSchedulerCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class ScheduledJobsConfig {

    public static final String ALERT_TEMPLATE_RECONCILIATION_TASK_NAME = "alert-template-reconciliation-task";
    public static final String RESOLUTION_RETRY_TASK_NAME = "resolution-send-task";
    public static final String COLLECT_ANALYST_INFO_TASK_NAME = "collect-analyst-info-task";
    public static final String SEND_ALERTS_TASK_NAME = "send-alerts-task";
    public static final String PRIM_HEALTH_ANALYSIS_TASK_NAME = "prim-health-analysis-task";
    public static final String SEC_HEALTH_ANALYSIS_TASK_NAME = "sec-health-analysis-task";

    public static final long TASK_RUNNER_RATE_MS = 30000L;

    @Bean
    public TaskSchedulerCustomizer taskSchedulerCustomizer() {
        return taskScheduler -> {
            taskScheduler.setErrorHandler(t -> {
                if (t instanceof Error) {
                    throw (Error) t;
                } else {
                    log.error("Exception occurred in @Scheduled task. ", t);
                }
            });
            taskScheduler.setWaitForTasksToCompleteOnShutdown(true);
        };
    }

}
