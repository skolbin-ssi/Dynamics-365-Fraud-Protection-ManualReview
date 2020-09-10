package com.griddynamics.msd365fp.manualreview.queues.config;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
@SuppressWarnings("java:S2386")
public class Constants {

    public static final int TOP_ELEMENT_IN_CONTAINER_PAGE_SIZE = 1;
    public static final String TOP_ELEMENT_IN_CONTAINER_CONTINUATION = null;

    public static final String DEFAULT_QUEUE_PAGE_SIZE_STR = "20";
    public static final int DEFAULT_QUEUE_PAGE_SIZE = 20;
    public static final String DEFAULT_QUEUE_VIEW_PARAMETER_STR = "REGULAR";
    public static final String DEFAULT_ITEM_PAGE_SIZE_STR = "20";
    public static final int DEFAULT_ITEM_PAGE_SIZE = 20;

    public static final String ITEMS_CONTAINER_NAME = "Items";
    public static final String QUEUES_CONTAINER_NAME = "Queues";
    public static final String TASK_CONTAINER_NAME = "Tasks";
    public static final String DICTIONARIES_CONTAINER_NAME = "Dictionaries";
    public static final String SETTINGS_CONTAINER_NAME = "ConfigurableAppSettings";

    public static final int DEFAULT_CACHE_CONTROL_SECONDS = 1800;

    public static final String ADMIN_MANAGER_ROLE
            = "ADMIN_MANAGER";
    public static final String SENIOR_ANALYST_ROLE
            = "SENIOR_ANALYST";
    public static final String ANALYST_ROLE
            = "ANALYST";
    public static final String[] USER_ROLES_ALLOWED_FOR_QUEUE_PROCESSING
            = new String[]{ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE};
    public static final String[] ROLES_ALLOWED_FOR_ACCESS
            = new String[]{ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE};

    public static final long EVENT_HUB_SENDING_TIMEOUT_MS = 10000L;
    public static final long TASK_RUNNER_RATE_MS = 30000L;

    public static final int DIGITS_MAX_VALID_INTEGER = 17;
    public static final int DIGITS_MAX_VALID_FRACTION = 16;

    public static final String MESSAGE_QUEUE_NOT_FOUND = "Queue not found";
    public static final String MESSAGE_ITEM_NOT_FOUND = "Item not found";
    public static final String MESSAGE_INCORRECT_USER = "Incorrect user";
    public static final String MESSAGE_NO_SUPERVISORS = "No one supervisor is found";
    public static final String MESSAGE_INCORRECT_QUEUE_ASSIGNMENT = "The same person can't be a reviewer and a supervisor";
    public static final String MESSAGE_ITEM_LOCKING_IN_ABSTRACT_QUEUE = "Item can't be locked under an abstract queue";

    public static final String RESIDUAL_QUEUE_TASK_NAME = "residual-queue-reconciliation-task";
    public static final String QUEUE_SIZE_TASK_NAME = "queue-size-calculation-task";
    public static final String OVERALL_SIZE_TASK_NAME = "overall-size-calculation-task";
    public static final String ITEM_ASSIGNMENT_TASK_NAME = "item-assignment-reconciliation-task";
    public static final String ITEM_UNLOCK_TASK_NAME = "item-unlock-task";
    public static final String DICTIONARY_TASK_NAME = "dictionary-reconciliation-task";
    public static final String ENRICHMENT_TASK_NAME = "item-enrichment-task";
    public static final String QUEUE_ASSIGNMENT_TASK_NAME = "queue-assignment-reconciliation-task";

    public static final String DATETIME_PATTERN_DFP = "MM/dd/yyyy HH:mm:ss xxxxx";

    public static final String SECURITY_SCHEMA_IMPLICIT = "mr_user_auth";
    public static final String CLIENT_REGISTRATION_AZURE_DFP_API = "azure-dfp-api";

    public static final String RESIDUAL_QUEUE_NAME = "# Residual Queue";
}
