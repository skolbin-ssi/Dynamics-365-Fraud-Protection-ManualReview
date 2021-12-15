// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.griddynamics.msd365fp.manualreview.analytics.config.Constants;
import com.griddynamics.msd365fp.manualreview.analytics.model.AlertCheck;
import com.griddynamics.msd365fp.manualreview.analytics.model.AlertNotification;
import com.griddynamics.msd365fp.manualreview.analytics.model.AppSettingsType;
import com.griddynamics.msd365fp.manualreview.analytics.model.MetricType;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.*;
import com.griddynamics.msd365fp.manualreview.analytics.model.exception.TemplateNotFoundException;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Alert;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.ConfigurableAppSetting;
import com.griddynamics.msd365fp.manualreview.analytics.repository.AlertRepository;
import com.griddynamics.msd365fp.manualreview.analytics.repository.ConfigurableAppSettingRepository;
import com.griddynamics.msd365fp.manualreview.analytics.service.dashboard.PublicItemLabelingMetricService;
import com.griddynamics.msd365fp.manualreview.azuregraph.client.AnalystClient;
import com.griddynamics.msd365fp.manualreview.dfpauth.util.UserPrincipalUtility;
import com.griddynamics.msd365fp.manualreview.model.Analyst;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConfigurationException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.commons.lang3.StringUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.*;

/**
 * Service to wrap {@link AlertRepository} operations to ease CRUD operations
 * with {@link Alert} entities. Provides sending emails for users of the system
 * based on alert triggers. For more info look at the {@link AlertService#sendAlerts()}
 * method.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final PublicItemLabelingMetricService metricService;
    private final AnalystClient analystClient;
    private final AlertRepository alertRepository;
    private final ConfigurableAppSettingRepository appSettingRepository;
    private final ModelMapper modelMapper;
    private final MailService mailService;
    @Qualifier("cosmosdbObjectMapper")
    private final ObjectMapper jsonMapper;

    @Setter(onMethod = @__({@Autowired, @Value("classpath:alert_email_template.json")}))
    private Resource defaultAlertTemplate;


    public List<AlertDTO> getAllByCurrentUser() {
        // TODO add analyst/queues valid
        return alertRepository.findByOwnerId(UserPrincipalUtility.getUserId()).stream()
                .map(alert -> modelMapper.map(alert, AlertDTO.class))
                .collect(Collectors.toList());
    }

    public AlertDTO getById(final String id) throws NotFoundException {
        Alert alert = getAlert(id);
        return modelMapper.map(alert, AlertDTO.class);
    }

    private Alert getAlert(final String id) throws NotFoundException {
        String userId = UserPrincipalUtility.getUserId();
        List<Alert> alerts = alertRepository.findByOwnerIdAndId(userId, id);
        // TODO add analyst/queues valid
        if (alerts.isEmpty()) {
            throw new NotFoundException(String.format("Alert [%s] for user [%s] was not found.", id, userId));
        }
        Alert alert = alerts.get(0);
        if (!userId.equals(alert.getOwnerId())) {
            throw new NotFoundException(String.format("Alert [%s] for user [%s] was not found.", id, userId));
        }
        return alert;
    }

    public AlertDTO create(final AlertCreationDTO alertDTO) throws NotFoundException {
        String userId = UserPrincipalUtility.getUserId();
        log.info("Creating alert for user: [{}], DTO: [{}]", userId, alertDTO);
        Alert alert = modelMapper.map(alertDTO, Alert.class);
        alert.setOwnerId(userId);
        alert.setId(UUID.randomUUID().toString());
        alert.setActive(true);
        alert.setCustom(true);
        alert.setLastCheck(AlertCheck.builder()
                .result(false)
                .message("Just created")
                .build());
        alert.setLastNotification(AlertNotification.builder()
                .email("none")
                .build());
        Alert saved = alertRepository.save(alert);
        return modelMapper.map(saved, AlertDTO.class);
    }

    public AlertDTO update(String id, final AlertUpdateDTO alertDTO) throws NotFoundException {
        String userId = UserPrincipalUtility.getUserId();
        log.info("Updating alert: [{}] for user: [{}]", id, userId);
        Alert alertToUpdate = getAlert(id);
        modelMapper.map(alertDTO, alertToUpdate);
        Alert saved = alertRepository.save(alertToUpdate);
        return modelMapper.map(saved, AlertDTO.class);
    }

    //TODO: rework to deletion by ttl
    public AlertDTO delete(final String id) throws NotFoundException {
        String userId = UserPrincipalUtility.getUserId();
        Alert alertToDelete = getAlert(id);
        log.info("Deleting alert: [{}] for user: [{}]", id, userId);
        alertRepository.deleteByOwnerIdAndId(userId, id);
        return modelMapper.map(alertToDelete, AlertDTO.class);
    }

    /**
     * Template reconciliations.
     * The method checks if all required templates exist in DB and create them
     * from default templates if something is missed.
     */
    public boolean reconcileAlertTemplates() throws IOException, IncorrectConfigurationException {
        List<ConfigurableAppSetting> emailTemplateList = appSettingRepository.findByType(AppSettingsType.MAIL_TEMPLATES);
        if (emailTemplateList.isEmpty()) {
            ConfigurableAppSetting template = jsonMapper.readValue(defaultAlertTemplate.getInputStream(), ConfigurableAppSetting.class);
            if (AppSettingsType.MAIL_TEMPLATES.equals(template.getType())) {
                appSettingRepository.save(template);
            } else {
                throw new IncorrectConfigurationException("Default alert template is incorrect.");
            }
        }
        return true;
    }

    /**
     * Send mail for all {@link Alert}s met their condition once per day.
     * If {@link Alert} has been sent today, then no mails for this {@link Alert}
     * would be sent. Data for queues and analysts is retrieved by
     * {@link PublicItemLabelingMetricService}.
     * <p>
     * Mail metadata are taken from {@link ConfigurableAppSetting} container in
     * CosmosDB. The type of parameter is {@link AppSettingsType#MAIL_TEMPLATES}.
     * The example of data you can see in parameters/alert_email_template.json
     * file. If no mail metadata parameter is present, then no alert would be sent.
     */
    public boolean sendAlerts() {
        List<Alert> alerts = alertRepository.findByActiveTrue();
        Optional<Boolean> result = alerts.stream()
                .map(this::sendAlert)
                .reduce(Boolean::logicalAnd);
        return result.orElse(false);
    }

    private boolean sendAlert(Alert alert) {
        if (!alert.isActive()) return false;
        List<ConfigurableAppSetting> mailMetadataParam = appSettingRepository.findByType(AppSettingsType.MAIL_TEMPLATES);
        if (checkMetadataParamEmpty(mailMetadataParam)) return false;
        Map<String, String> templates = mailMetadataParam.get(0).getValue();
        if (checkTemplates(templates)) return false;

        Duration period = alert.getPeriod();
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime since = now.minus(period);

        boolean alertSent = false;

        try {
            Analyst analyst = analystClient.getAnalystById(alert.getOwnerId());
            UserPrincipalUtility.setEmulatedAuth(analyst);
            ItemLabelingMetricDTO totalMetrics = metricService
                    .getItemLabelingTotalMetrics(since, now, alert.getAnalysts(), alert.getQueues());
            UserPrincipalUtility.clearEmulatedAuth();

            double metricValue = getValueByMetric(totalMetrics, alert.getMetricType());
            boolean alertInvoke = evaluateValue(metricValue, alert);
            alert.getLastCheck().setChecked(now);
            alert.getLastCheck().setValue(metricValue);
            alert.getLastCheck().setResult(alertInvoke);
            if (alertInvoke) {
                alert.getLastCheck().setMessage(getAlertMessage(alert, templates));
            } else {
                alert.getLastCheck().setMessage(null);
            }

            if (alertInvoke && !isNotificationSentToday(alert, now)) {
                String email = analyst.getMail();
                if (StringUtils.isNotBlank(email)) {
                    alertSent = sendEmail(email, getAlertSubject(alert, templates), alert.getLastCheck().getMessage());
                    if (alertSent) {
                        alert.getLastNotification().setSent(now);
                        alert.getLastNotification().setEmail(email);
                    }
                } else {
                    log.info("Alert [{}] should be sent to user [{}] but can't due to email missing",
                            alert.getId(), alert.getOwnerId());
                }
            }
        } catch (NotFoundException e) {
            alert.setActive(false);
            alert.getLastCheck().setChecked(now);
            alert.getLastCheck().setResult(false);
            alert.getLastCheck().setMessage("Alert has been disabled due to author inactivity.");
        } catch (AccessDeniedException e){
            alert.setActive(false);
            alert.getLastCheck().setChecked(now);
            alert.getLastCheck().setResult(false);
            alert.getLastCheck().setMessage("Alert has been disabled due to security reasons.");
            log.warn("Alert [{}] has been disabled due to security reasons", alert.getId());
        }

        alertRepository.save(alert);
        return alertSent;
    }

    private boolean isNotificationSentToday(Alert alert, OffsetDateTime now) {
        return alert.getLastNotification().getSent() != null
                && now.toLocalDate().equals(alert.getLastNotification().getSent().toLocalDate());
    }

    private boolean checkMetadataParamEmpty(List<ConfigurableAppSetting> mailMetadataParam) {
        if (mailMetadataParam.isEmpty()) {
            log.error("Parameter [{}] was not found in DB.", AppSettingsType.MAIL_TEMPLATES);
            return true;
        }
        log.debug("Mail metadata parameters: [{}]", mailMetadataParam);
        return false;
    }

    private boolean checkTemplates(Map<String, String> templates) {
        if (templates == null || templates.isEmpty()) {
            log.error("Templates are not found. " +
                            "Please check if they are present in [{}] container in CosmosDB [{}] parameter",
                    Constants.APP_SETTINGS_CONTAINER_NAME,
                    AppSettingsType.MAIL_TEMPLATES);
            return true;
        }
        log.debug("Mail templates are: [{}]", templates.values());
        return false;
    }

    private double getValueByMetric(final ItemLabelingMetricDTO queueTotal, final MetricType metricType) {
        int goodActions = queueTotal.getGood() + queueTotal.getWatched();
        int totalOverturned = queueTotal.getGoodOverturned() + queueTotal.getBadOverturned();
        int total = queueTotal.getReviewed();
        switch (metricType) {
            case AVERAGE_OVERTURN_RATE:
                return total > 0 ? (double) totalOverturned * 100 / total : 0;
            case GOOD_DECISION_RATE:
                return total > 0 ? (double) goodActions * 100 / total : 0;
            case BAD_DECISION_RATE:
                return total > 0 ? (double) queueTotal.getBad() * 100 / total : 0;
            default:
                throw new NotImplementedException(String.format("Metric [%s] not implemented yet.", metricType));
        }
    }

    private boolean evaluateValue(final double queueValue,
                                  final Alert alert) {
        switch (alert.getThresholdOperator()) {
            case LESS_THAN:
                return queueValue < alert.getThresholdValue();
            case GREATER_THAN:
                return queueValue > alert.getThresholdValue();
            default:
                throw new NotImplementedException(String.format("Operator [%s] not implemented yet.", alert.getThresholdValue()));
        }
    }

    private String getAlertMessage(Alert alert, Map<String, String> templates) {
        return getTemplate(templates, "template")
                .replaceAll(MAIL_TAG_ALERT_NAME, alert.getName())
                .replaceAll(MAIL_TAG_METRIC, alert.getMetricType().toString())
                .replaceAll(MAIL_TAG_OPERATOR, alert.getThresholdOperator().toString())
                .replaceAll(MAIL_TAG_VALUE, String.valueOf(alert.getThresholdValue()))
                .replaceAll(MAIL_TAG_PERIOD, String.valueOf(alert.getPeriod().toHours()))
                .replaceAll(MAIL_TAG_CALC_VALUE, String.valueOf(alert.getLastCheck().getValue()));
    }

    private String getAlertSubject(Alert alert, Map<String, String> templates) {
        return getTemplate(templates, "subject")
                .replaceAll(MAIL_TAG_ALERT_NAME, alert.getName());
    }

    private boolean sendEmail(String email, String subject, String message) {
        try {
            mailService.send(email, subject, message);
            return true;
        } catch (Exception e) {
            log.error("An error has occurred during mailing", e);
            return false;
        }
    }

    private String getTemplate(Map<String, String> mailTemplates, String templateName) {
        String template = mailTemplates.get(templateName);
        if (template.isEmpty()) {
            throw new TemplateNotFoundException(String.format("Template [%s] was not found. " +
                            "Please check ConfigurableAppSetting container in CosmosDB for [%s] parameter.",
                    templateName, AppSettingsType.MAIL_TEMPLATES.toString()));
        }
        return template;
    }

    public Set<AlertMetricDTO> getMetricsForCurrentUser() {
        return Arrays.stream(MetricType.values())
                .map(mt -> {
                    AlertMetricDTO dto = modelMapper.map(mt, AlertMetricDTO.class);
                    dto.setMetricType(mt);
                    return dto;
                })
                .collect(Collectors.toSet());
    }
}
