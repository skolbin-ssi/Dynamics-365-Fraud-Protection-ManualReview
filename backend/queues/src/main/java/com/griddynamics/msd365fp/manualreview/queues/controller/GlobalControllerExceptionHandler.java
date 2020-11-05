// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.controller;

import com.griddynamics.msd365fp.manualreview.model.api.ErrorDTO;
import com.griddynamics.msd365fp.manualreview.model.exception.*;
import com.nimbusds.jwt.proc.BadJWTException;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.servlet.ServletException;
import java.time.OffsetDateTime;

/**
 * The main error mapper.
 * <p>
 * {@code @ResponseStatus} annotations are used for swagger generation
 * and are placed for any handler even if it uses the ResponseEntity inside
 */
@Slf4j
@ControllerAdvice
public class GlobalControllerExceptionHandler extends ResponseEntityExceptionHandler {

    @ApiResponse(responseCode = "204")
    @ResponseStatus(value = HttpStatus.NO_CONTENT, reason = "Requested source is empty")
    @ExceptionHandler(EmptySourceException.class)
    public void handleNoContent() {
        // Nothing to do, the method is only for the status mapping
    }

    @ApiResponse(responseCode = "404", content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(implementation = ErrorDTO.class)))
    @ExceptionHandler(NotFoundException.class)
    @NonNull
    public ResponseEntity<Object> handleNotFound(final Exception exception) {
        return generateClientError("Requested element isn't found", exception, HttpStatus.NOT_FOUND);
    }

    @ApiResponse(responseCode = "401", content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(oneOf = {ErrorDTO.class, Object.class})))
    @ExceptionHandler({BadJWTException.class, AuthenticationException.class, ServletException.class})
    @NonNull
    public ResponseEntity<Object> handleAuthException(final Exception exception) {
        return generateClientError("Auth token is invalid or expired", exception, HttpStatus.UNAUTHORIZED);
    }

    @ApiResponse(responseCode = "403", content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(oneOf = {ErrorDTO.class, Object.class})))
    @ExceptionHandler(AccessDeniedException.class)
    @NonNull
    public ResponseEntity<Object> handleAccessDeniedException(final AccessDeniedException exception) {
        return generateClientError("Not enough permissions to access this resource", exception, HttpStatus.FORBIDDEN);
    }

    @ApiResponse(responseCode = "422", content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(implementation = ErrorDTO.class)))
    @ResponseStatus(value = HttpStatus.UNPROCESSABLE_ENTITY)
    @ExceptionHandler(IncorrectConfigurationException.class)
    @NonNull
    public ResponseEntity<Object> handleUnprocessableEntity(final Exception exception) {
        return generateClientError("Incorrect request parameters", exception, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ApiResponse(responseCode = "409", content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(implementation = ErrorDTO.class)))
    @ResponseStatus(value = HttpStatus.CONFLICT)
    @ExceptionHandler(IncorrectConditionException.class)
    @NonNull
    public ResponseEntity<Object> handleConflict(final Exception exception) {
        return generateClientError("Conditions aren't met", exception, HttpStatus.CONFLICT);
    }

    @ApiResponse(responseCode = "429", content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(implementation = ErrorDTO.class)))
    @ExceptionHandler({BusyException.class})
    @NonNull
    public ResponseEntity<Object> handleBusyException(final BusyException exception) {
        return generateClientError("System is busy", exception, HttpStatus.TOO_MANY_REQUESTS);
    }

    @ApiResponse(responseCode = "400", content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(oneOf = {ErrorDTO.class, Object.class})))
    @ApiResponse(responseCode = "500", content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(oneOf = {ErrorDTO.class, Object.class})))
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    @NonNull
    public ResponseEntity<Object> handleInternalServerError(final Exception exception) {
        return generateInternalError(exception);
    }


    @NonNull
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(@NonNull final MethodArgumentNotValidException ex,
                                                                  @NonNull final HttpHeaders headers,
                                                                  @NonNull final HttpStatus status,
                                                                  @NonNull final WebRequest request) {
        return generateClientError("Validation error", ex, status);
    }


    @Override
    @NonNull
    protected ResponseEntity<Object> handleHttpMessageNotReadable(@NonNull final HttpMessageNotReadableException ex,
                                                                  @NonNull final HttpHeaders headers,
                                                                  @NonNull final HttpStatus status,
                                                                  @NonNull final WebRequest request) {
        return generateClientError("Parsing error", ex, status);
    }

    @NonNull
    protected ResponseEntity<Object> generateClientError(final String description,
                                                         final Exception ex,
                                                         final HttpStatus status) {
        log.warn("Client error occurred. {}.", description, ex);
        ErrorDTO error = ErrorDTO.builder()
                .time(OffsetDateTime.now())
                .description(description)
                .details(ex.getMessage())
                .build();
        return new ResponseEntity<>(error, status);
    }

    @NonNull
    protected ResponseEntity<Object> generateInternalError(final Exception ex) {
        log.error("Internal error occurred.", ex);
        ErrorDTO error = ErrorDTO.builder()
                .time(OffsetDateTime.now())
                .description("Internal error")
                .details(ex.getClass().getSimpleName())
                .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
