package com.griddynamics.msd365fp.manualreview.queues.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.javafaker.Faker;
import com.griddynamics.msd365fp.manualreview.dfpauth.util.UserPrincipalUtility;
import com.griddynamics.msd365fp.manualreview.model.ItemLabel;
import com.griddynamics.msd365fp.manualreview.model.ItemLock;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.model.testing.MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent;
import com.griddynamics.msd365fp.manualreview.queues.model.testing.MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchase;
import com.griddynamics.msd365fp.manualreview.queues.repository.ItemRepository;
import com.griddynamics.msd365fp.manualreview.queues.service.ItemService;
import com.griddynamics.msd365fp.manualreview.queues.service.TaskService;
import com.griddynamics.msd365fp.manualreview.queues.service.TestingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ClientHttpResponse;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.BodyExtractor;
import org.springframework.web.reactive.function.BodyExtractors;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.ADMIN_MANAGER_ROLE;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.SECURITY_SCHEMA_IMPLICIT;

//TODO: temporary for testing
@RestController
@RequestMapping("/api/testing")
@Tag(name = "testing", description = "Mocks and utilities")
@Slf4j
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@RequiredArgsConstructor
@Secured({ADMIN_MANAGER_ROLE})
@SuppressWarnings({"java:S5411", "java:S3776", "java:S3358"})
public class TestingController {

    private static final Faker faker = new Faker();

    private final ItemRepository itemRepository;
    private final ItemService itemService;
    private final TestingService testingService;
    private final TaskService taskService;
    private final ObjectMapper mapper;
    @Setter(onMethod = @__({@Autowired, @Qualifier("azureDFPAPIWebClient")}))
    private WebClient dfpClient;

    @Value("${azure.dfp.purchase-event-url}")
    private String purchaseEventUrl;
    @Value("${azure.dfp.bank-event-url}")
    private String bankEventUrl;

    @Operation(summary = "Create a new item directly in the database")
    @PostMapping(value = "/items",
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public List<Item> createItem(@RequestBody final Item parameters,
                                 @RequestParam(value = "amount", defaultValue = "1") final int amount) {
        List<Item> res = new LinkedList<>();
        String basename = parameters.getId() + "-";
        for (int i = 0; i < amount; i++) {
            parameters.setId(basename + i);
            parameters.setImported(parameters.getImported().plus(Duration.ofMinutes(i)));
            parameters.setTtl(-1);
            parameters.setLabel(new ItemLabel());
            parameters.setLock(new ItemLock());
            parameters.setReviewers(Collections.emptySet());
            res.add(testingService.createItem(parameters));
        }
        return res;
    }

    @Operation(summary = "Duplicate all items in the queue")
    @PostMapping(value = "/items/duplicate/queue/{queueId}")
    public void duplicateItems(@PathVariable("queueId") final String queueId) throws NotFoundException, BusyException {
        testingService.duplicate(queueId);
    }

    @Operation(summary = "Hard delete for all items by IDs")
    @DeleteMapping(value = "/items")
    public void deleteAllById(
            @Parameter(hidden = true)
            @AuthenticationPrincipal PreAuthenticatedAuthenticationToken principal,
            @RequestBody List<Map<String, String>> ids) {
        List<String> toDelete = ids.stream().map(mp -> mp.get("id")).collect(Collectors.toList());
        itemRepository.deleteAll(itemRepository.findAllById(toDelete));
        log.info("User [{}] has deleted items [{}].", UserPrincipalUtility.extractUserId(principal), toDelete);
    }

    @Operation(summary = "Generate specified amount of purchases. Send them to the DFP. " +
            "Generate events for EventHub.")
    @PostMapping(value = "/dfp/events", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<List<Object>> postEntities(@RequestParam(defaultValue = "1") int amount)
            throws JsonProcessingException {
        final List<List<Object>> result = new LinkedList<>();
        for (int i = 0; i < amount; i++) {
            List<Object> data = new LinkedList<>();
            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchase purchase =
                    testingService.generatePurchase();
            data.add(purchase);
            log.debug(mapper.writeValueAsString(purchase));
            EventResponse purchaseEventResponse = dfpClient.post()
                    .uri(purchaseEventUrl)
                    .bodyValue(purchase)
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .flatMap(r -> r.bodyToMono(EventResponse.class))
                    .doOnNext(a -> log.debug(a.toString()))
                    .block();
            data.add(purchaseEventResponse);
            if (purchaseEventResponse != null && purchaseEventResponse.getResultDetails() != null) {
                log.info("Purchase event has been populated to DFP with ID: [{}]",
                        purchaseEventResponse.getResultDetails().getPurchaseId());
            } else {
                log.warn("Purchase event has been populated to DFP but could not parse a response.");
            }
            int bankEventAmount = faker.random().nextInt(3) + 1;
            for (int j = 0; j < bankEventAmount; j++) {
                MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent bankEvent =
                        testingService.generateBankEvent(purchase.getPurchaseId());
                data.add(bankEvent);
                log.debug(mapper.writeValueAsString(bankEvent));
                EventResponse bankEventResponse = dfpClient.post()
                        .uri(bankEventUrl)
                        .bodyValue(bankEvent)
                        .exchange()
                        .flatMap(r -> r.bodyToMono(EventResponse.class))
                        .doOnNext(a -> log.debug(a.toString()))
                        .block();
                if (bankEventResponse != null && bankEventResponse.getResultDetails() != null) {
                    log.info("Bank event has been populated to DFP with response: [{}]",
                            bankEventResponse.getResultDetails().isSuccess());
                } else {
                    log.warn("Bank event has been populated to DFP but could not parse a response.");
                }
            }
            result.add(data);
        }
        return result;
    }

    @Data
    public static class EventResponse {
        private EventResultDetails resultDetails;
    }

    @Data
    public static class EventResultDetails {
        @JsonProperty("PurchaseId")
        private String purchaseId;
        @JsonProperty("Succeeded")
        private boolean success;
    }
}
