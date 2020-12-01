// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.config;


import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;


@NoArgsConstructor(access = AccessLevel.PRIVATE)
@SuppressWarnings("java:S2386")
public class Constants {

    public static final OffsetDateTime ELDEST_APPLICATION_DATE =
            OffsetDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneId.systemDefault());

    public static final String DEFAULT_PAGE_REQUEST_SIZE_STR = "1000";
    public static final int DEFAULT_PAGE_REQUEST_SIZE = 1000;

    public static final String RESOLUTION_CONTAINER_NAME = "Resolutions";
    public static final String ITEM_LABEL_ACTIVITY_CONTAINER_NAME = "ItemLabelActivities";
    public static final String ITEM_LOCK_ACTIVITY_CONTAINER_NAME = "ItemLockActivities";
    public static final String COLLECTED_QUEUE_INFO_CONTAINER_NAME = "CollectedQueueInfo";
    public static final String COLLECTED_ANALYST_INFO_CONTAINER_NAME = "CollectedAnalystInfo";
    public static final String ITEM_PLACEMENT_ACTIVITY_CONTAINER_NAME = "ItemPlacementActivities";
    public static final String QUEUE_SIZE_CALCULATION_ACTIVITY_CONTAINER_NAME = "QueueSizeCalculationActivities";
    public static final String TASK_CONTAINER_NAME = "Tasks";
    public static final String ALERT_CONTAINER_NAME = "Alerts";
    public static final String APP_SETTINGS_CONTAINER_NAME = "ConfigurableAppSettings";
    public static final String HEALTH_CHECK_CONTAINER_NAME = "HealthChecks";

    public static final String REGISTRATION_NAME = "azure-dfp-api";

    public static final String OVERALL_SIZE_ID = "overall";
    public static final String OVERALL_PLACEMENT_ID = "overall";

    public static final String SECURITY_SCHEMA_IMPLICIT = "mr_user_auth";
    public static final String SECURITY_SCHEMA_CLIENTCRED = "mr_app_auth";
    public static final String RESOLUTION_VIEWER_APPROLE
            = "ROLE_RESOLUTION_VIEWER";
    public static final String ADMIN_MANAGER_ROLE
            = "ADMIN_MANAGER";
    public static final String SENIOR_ANALYST_ROLE
            = "SENIOR_ANALYST";
    public static final String ANALYST_ROLE
            = "ANALYST";
    public static final String[] ROLES_ALLOWED_FOR_ACCESS
            = new String[]{ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE, RESOLUTION_VIEWER_APPROLE};

    public static final String ANALYSTS_PARAM_DESCRIPTION = "fill this param to get statistic by specified analysts (keep empty to query all)";
    public static final String QUEUES_PARAM_DESCRIPTION = "fill this param to get statistic by specified queues (keep empty to query all)";
    public static final String FROM_PARAM_EXAMPLE = "2020-07-10T00:00:00+00:00";
    public static final String FROM_PARAM_DESCRIPTION = "start of the date range";
    public static final String TO_PARAM_EXAMPLE = "2020-09-20T00:00:00+00:00";
    public static final String TO_PARAM_DESCRIPTION = "end of the date range";
    public static final String AGGREGATION_PARAM_DESCRIPTION = "aggregation period in days";

    public static final String MAIL_TAG_ALERT_NAME = "\\[alertName]";
    public static final String MAIL_TAG_METRIC = "\\[metric]";
    public static final String MAIL_TAG_OPERATOR = "\\[operator]";
    public static final String MAIL_TAG_VALUE = "\\[value]";
    public static final String MAIL_TAG_CALC_VALUE = "\\[calcvalue]";
    public static final String MAIL_TAG_PERIOD = "\\[period]";

    public static final int INCORRECT_CONFIG_STATUS = 1;


}
