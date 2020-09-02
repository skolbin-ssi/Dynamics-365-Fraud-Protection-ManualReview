package com.griddynamics.msd365fp.manualreview.analytics.service;

import com.griddynamics.msd365fp.manualreview.analytics.config.properties.MailProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

/**
 * MailService sends emails to selected user from user defined in application.yml.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final MailProperties mailProperties;

    public void send(String to, String subject, String body) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(mailProperties.getHost());
        mailSender.setPort(mailProperties.getPort());
        mailSender.setUsername(mailProperties.getUsername());
        mailSender.setPassword(mailProperties.getPassword());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", mailProperties.getTransportProtocol());
        props.put("mail.smtp.auth", mailProperties.getSmtpAuth());
        props.put("mail.smtp.starttls.enable", mailProperties.getSmtpStartTls());

        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message);
            helper.setFrom(mailProperties.getUsername());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            mailSender.send(message);
            log.info("Message sent to: [{}], subject: [{}], content: [{}]", to, subject, body);
        } catch (MessagingException e) {
            log.error("Exception occurred during mail sending. Mail to: [{}], subject: [{}], content: [{}]",
                    to, subject, body, e);
        }
    }


}
