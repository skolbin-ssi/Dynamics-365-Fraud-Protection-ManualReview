package com.griddynamics.msd365fp.manualreview.analytics.controller;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Task;
import com.griddynamics.msd365fp.manualreview.analytics.service.TaskService;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConfigurationException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.ADMIN_MANAGER_ROLE;
import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.SECURITY_SCHEMA_IMPLICIT;

@RestController
@RequestMapping("/api/task")
@Tag(name = "task", description = "The Task API")
@Slf4j
@RequiredArgsConstructor
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Secured({ADMIN_MANAGER_ROLE})
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Get current tasks")
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public List<Task> getTasks() {
        return taskService.getAllTasks();
    }

    @Operation(summary = "Set all tasks' status to READY")
    @PostMapping(value = "/status/ready")
    @Secured({ADMIN_MANAGER_ROLE})
    public void setAllTasksReady() {
        taskService.setAllTasksReady();
    }

    @Operation(summary = "Force task execution")
    @PostMapping(value = "/{name}/execution")
    @Secured({ADMIN_MANAGER_ROLE})
    public Boolean forceTasksExecution(
            @Parameter(description = "Name of a task")
            @PathVariable
                    String name) throws IncorrectConfigurationException {
        return taskService.forceTaskRunByName(name);
    }
}
