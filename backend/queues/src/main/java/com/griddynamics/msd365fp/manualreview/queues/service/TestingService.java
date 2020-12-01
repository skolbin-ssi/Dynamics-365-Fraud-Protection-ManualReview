// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.github.javafaker.Faker;
import com.griddynamics.msd365fp.manualreview.cosmos.utilities.PageProcessingUtility;
import com.griddynamics.msd365fp.manualreview.model.DisposabilityCheck;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.dfp.CalculatedFields;
import com.griddynamics.msd365fp.manualreview.model.dfp.MainPurchase;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import com.griddynamics.msd365fp.manualreview.queues.model.testing.*;
import com.griddynamics.msd365fp.manualreview.queues.repository.ItemRepository;
import com.griddynamics.msd365fp.manualreview.queues.repository.QueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.MESSAGE_QUEUE_NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestingService {

    private final EmailDomainService emailDomainService;
    private final ItemRepository itemRepository;
    private final QueueRepository queueRepository;

    private static final Locale[] locales = Locale.getAvailableLocales();
    private static final Faker faker = new Faker();
    private static final String[] beTypes = {"Auth", "AuthCancel", "ChargeReversal", "Charge"};
    private static final String[] beStatuses = {"Approved", "Unknown", "Declined"};

    MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrumentAddress addressPool[] = {
            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrumentAddress.builder()
                    .city("San Ramon")
                    .country("US")
                    .street1("5000 Executive Parkway, Suite 520")
                    .zipCode("94583")
                    .state("CA")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrumentAddress.builder()
                    .city("Mountain View")
                    .state("CA")
                    .country("USA")
                    .street1("1065 La Avenida Mountain View")
                    .zipCode("94043")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrumentAddress.builder()
                    .city("Austin")
                    .state("TX")
                    .country("US")
                    .street1("10900 Stonelake Boulevard, Suite 225")
                    .zipCode("78759")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrumentAddress.builder()
                    .city("Austin")
                    .state("TX")
                    .country("USA")
                    .street1("10900 Stonelake Boulevard, Suite 225")
                    .zipCode("78759")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrumentAddress.builder()
                    .city("Monaco")
                    .country("FR")
                    .street1("39, quai du Président Roosevelt")
                    .zipCode("92130")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),


            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrumentAddress.builder()
                    .city("Monaco")
                    .country("France")
                    .street1("39, quai du Président Roosevelt")
                    .zipCode("92130")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrumentAddress.builder()
                    .city("Sydney")
                    .country("Australia")
                    .street1("PO Box 91, North Ryde NSW 1670")
                    .zipCode("1670")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrumentAddress.builder()
                    .city("Sydney")
                    .country("AU")
                    .street1("PO Box 91, North Ryde NSW 1670")
                    .zipCode("1670")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build()
    };

    MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress addressPoolShipping[] = {
            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.builder()
                    .city("San Ramon")
                    .country("US")
                    .street1("5000 Executive Parkway, Suite 520")
                    .zipCode("94583")
                    .state("CA")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.builder()
                    .city("Mountain View")
                    .state("CA")
                    .country("USA")
                    .street1("1065 La Avenida Mountain View")
                    .zipCode("94043")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.builder()
                    .city("Austin")
                    .state("TX")
                    .country("US")
                    .street1("10900 Stonelake Boulevard, Suite 225")
                    .zipCode("78759")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.builder()
                    .city("Austin")
                    .state("TX")
                    .country("USA")
                    .street1("10900 Stonelake Boulevard, Suite 225")
                    .zipCode("78759")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.builder()
                    .city("Monaco")
                    .country("FR")
                    .street1("39, quai du Président Roosevelt")
                    .zipCode("92130")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),


            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.builder()
                    .city("Monaco")
                    .country("France")
                    .street1("39, quai du Président Roosevelt")
                    .zipCode("92130")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.builder()
                    .city("Sydney")
                    .country("Australia")
                    .street1("PO Box 91, North Ryde NSW 1670")
                    .zipCode("1670")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build(),

            MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.builder()
                    .city("Sydney")
                    .country("AU")
                    .street1("PO Box 91, North Ryde NSW 1670")
                    .zipCode("1670")
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .build()
    };


    //TODO: temporary for testing
    public Item createItem(final Item item) {
        if (item.getId() == null) {
            item.setId(java.util.UUID.randomUUID().toString());
        }
        return itemRepository.save(item);
    }

    //TODO: temporary for testing
    public void duplicate(final String queueId) throws NotFoundException, BusyException {
        Iterator<Queue> queueTuple = queueRepository.findByIdAndActiveTrue(queueId).iterator();
        if (!queueTuple.hasNext()) {
            throw new NotFoundException(MESSAGE_QUEUE_NOT_FOUND);
        }
        Queue queue = queueTuple.next();
        Random random = new Random();

        PageableCollection<Item> data = PageProcessingUtility.getNotEmptyPage(
                null,
                continuation -> itemRepository.findUnassignedItemsByItemFilters(
                        queue.getId(),
                        queue.getFilters(),
                        null,
                        1000,
                        continuation,
                        new Sort.Order(queue.getSorting().getOrder(), queue.getSorting().getField().getPath()),
                        false));

        List<Item> items = data.getValues()
                .stream()
                .peek(item -> item.setId(java.util.UUID.randomUUID().toString()))
                .peek(item -> item.getDecision().setRiskScore(random.nextInt(1000)))
                .collect(Collectors.toList());
        log.debug("Queue size is now: " + items.size());
        itemRepository.saveAll(items);
    }


    public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent generateBankEvent(String id) {
        return MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent.builder()
                .purchaseId(id)
                .bankEventId(UUID.randomUUID().toString())
                .bankEventTimestamp(OffsetDateTime.now())
                .bankResponseCode(faker.code().asin())
                .mid(faker.code().ean8())
                .mrn(faker.code().gtin8())
                .paymentProcessor(faker.finance().iban())
                .status(beStatuses[faker.random().nextInt(beStatuses.length)])
                .type(beTypes[faker.random().nextInt(beTypes.length)])
                ._metadata(MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityMetadata.builder()
                        .trackingId(UUID.randomUUID().toString())
                        .merchantTimeStamp(OffsetDateTime.now().toString())
                        .build())
                .build();
    }


    public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchase generatePurchase() {
        String id = UUID.randomUUID().toString();
        String currency = faker.random().nextInt(10) < 8 ? "USD" : faker.currency().code();
        String firstName = faker.name().firstName();
        String lastName = faker.name().lastName();
        String userName = generateUsername(firstName, lastName);
        String country = faker.country().countryCode2();
        Locale locale = getLocaleByCountry(country);
        String domain = generateDomainStatistically(country);

        MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseDeviceContext device =
                MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseDeviceContext.builder()
                        .externalDeviceId(faker.code().imei())
                        .deviceContextDC("westus")
                        .externalDeviceType(faker.resolve("device.model_name"))
                        .provider("DFPFingerPrinting")
                        .deviceContextId(UUID.randomUUID().toString())
                        .ipAddress(faker.internet().ipV4Address())
                        .build();

        int productAmount = 1 + faker.random().nextInt(3);
        double totalAmount = faker.random().nextInt(99);
        List<MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct> productList = new ArrayList<>(productAmount);
        for (int i = 0; i < productAmount; i++) {
            double price = faker.random().nextDouble() * 999;
            totalAmount += price;
            productList.add(MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.builder()
                    .purchasePrice(BigDecimal.valueOf(price).setScale(2, RoundingMode.HALF_UP))
                    .isPreorder(faker.random().nextBoolean())
                    .margin(BigDecimal.valueOf(faker.random().nextDouble()).setScale(2, RoundingMode.HALF_UP))
                    .productName(faker.commerce().productName())
                    .category(faker.commerce().department())
                    .cogs(BigDecimal.valueOf(faker.random().nextDouble()).setScale(2, RoundingMode.HALF_UP))
                    .currency(faker.currency().code())
                    .isFree(faker.random().nextBoolean())
                    .isRecurring(faker.random().nextBoolean())
                    .language(locale.toString())
                    .salesPrice(BigDecimal.valueOf(price).setScale(2, RoundingMode.HALF_UP))
                    .sku(faker.random().nextBoolean() ? "sales" : "edu")
                    .type(faker.commerce().color())
                    .productId(faker.number().digits(5))
                    .quantity(faker.random().nextInt(10))
                    .shippingMethod(faker.space().agency())
                    .build());
        }

        int paymentAmount = 1 + faker.random().nextInt(2);
        List<MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrument> paymentList = new ArrayList<>(paymentAmount);
        for (int i = 0; i < paymentAmount; i++) {
            paymentList.add(
                    MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchasePaymentInstrument.builder()
                            .addressStatus("some status")
                            .billingAddress(
                                    addressPool[faker.random().nextInt(addressPool.length)]
                            )
                            .billingAgreementId(faker.idNumber().valid())
                            .bin(faker.number().digits(3))
                            .cardType("VISA")
                            .holderName(faker.name().fullName())
                            .type("DEBITCARD")
                            .purchaseAmount(BigDecimal.valueOf(totalAmount / paymentAmount).setScale(2, RoundingMode.HALF_UP))
                            .build()
            );
        }

        MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseUser user =
                MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseUser.builder()
                        .authenticationProvider(domain)
                        .country(country)
                        .creationDate(OffsetDateTime.now())
                        .displayName(userName)
                        .email(userName + "@" + domain)
                        .language(locale.getLanguage())
                        .lastName(faker.name().lastName())
                        .firstName(faker.name().firstName())
                        .userId(String.valueOf(faker.random().nextInt(500)))
                        .build();

        HashMap<String, String> customAttributes = new HashMap<>();
        customAttributes.put("email_confirmed", faker.random().nextBoolean().toString());
        customAttributes.put("account_age_in_days_bucket", String.valueOf(faker.random().nextInt(32)));
        customAttributes.put("connection_count_bucket", faker.company().buzzword());
        customAttributes.put("cards_per_member_24_hours", String.valueOf(faker.random().nextLong()));
        customAttributes.put("purchases_per_card_24_hours", String.valueOf(faker.random().nextLong()));
        customAttributes.put("purchases_per_member_24_hours", String.valueOf(faker.random().nextLong()));
        customAttributes.put("members_per_card_24_hours", String.valueOf(faker.random().nextLong()));
        customAttributes.put("country_match", faker.random().nextBoolean().toString());
        customAttributes.put("country_code", faker.address().countryCode());
        customAttributes.put("top_mx_record", faker.commerce().material());
        customAttributes.put("email_domain", domain);
        customAttributes.put("product_families", faker.commerce().department());
        customAttributes.put("cc_hash", String.valueOf(faker.random().nextLong()));
        customAttributes.put("num_invitations_sent_last_6_months", String.valueOf(faker.random().nextLong()));
        customAttributes.put("MemberID", String.valueOf(faker.random().nextLong()));
        customAttributes.put("Member_history_on_reviews_and_restricted", String.valueOf(faker.random().nextLong()));

        return MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchase.builder()
                .assessmentType(faker.random().nextInt(10) < 7 ? "protect" : "evaluate")
                .purchaseId(id)
                .currency(currency)
                .customerLocalDate(OffsetDateTime.now())
                .deviceContext(device)
                .merchantLocalDate(OffsetDateTime.now())
                .originalOrderId(faker.idNumber().validSvSeSsn())
                .paymentInstrumentList(paymentList)
                .productList(productList)
                .salesTax(BigDecimal.valueOf(faker.random().nextDouble() * 999).setScale(2, RoundingMode.HALF_UP))
                .shippingAddress(
                        addressPoolShipping[faker.random().nextInt(addressPoolShipping.length)])
                .shippingMethod(faker.space().agency())
                .totalAmount(BigDecimal.valueOf(totalAmount).setScale(2, RoundingMode.HALF_UP))
                .user(user)
                .customData(customAttributes)
                ._metadata(MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityMetadata.builder()
                        .trackingId(UUID.randomUUID().toString())
                        .merchantTimeStamp(OffsetDateTime.now().toString())
                        .build())
                .build();
    }


    public static Locale getLocaleByCountry(String country) {
        if (country != null) {
            List<Locale> localeList = Arrays.stream(locales)
                    .filter(l -> l.getCountry().equalsIgnoreCase(country))
                    .collect(Collectors.toList());
            if (!localeList.isEmpty()) {
                return localeList.get(faker.random().nextInt(localeList.size()));
            }
        }
        return Locale.US;
    }

    public List<DisposabilityCheck> checkDisposableEmails() {
        List<DisposabilityCheck> result = new ArrayList<>();

        itemRepository.findAll()
                .forEach(item -> {
                    MainPurchase purchase = item.getPurchase();
                    if (purchase != null) {
                        String emailDomain = null;

                        CalculatedFields calculatedFields = purchase.getCalculatedFields();
                        if (calculatedFields != null) {
                            emailDomain = calculatedFields.getAggregatedEmailDomain();
                        } else {
                            Map<String, String> customData = purchase.getCustomData();
                            if (customData != null) {
                                emailDomain = customData.get("email_domain");
                                calculatedFields = new CalculatedFields();
                                purchase.setCalculatedFields(calculatedFields);
                            }
                        }

                        if (emailDomain != null) {
                            result.add(emailDomainService.checkDisposability(emailDomain));
                        }
                    }
                });

        return result;
    }

    private String generateUsername(String fname, String lname) {
        String userName = faker.random().nextBoolean() ?
                (faker.random().nextBoolean() ? fname : "")
                        + (faker.random().nextBoolean() ? lname : "")
                        + (faker.random().nextBoolean() ? faker.number().digits(2) : "") : "";
        if (faker.random().nextBoolean()) {
            HashSet<String> nicks = new HashSet<>();
            if (faker.random().nextBoolean()) nicks.add(faker.leagueOfLegends().champion());
            if (faker.random().nextBoolean()) nicks.add(faker.leagueOfLegends().summonerSpell());
            if (faker.random().nextBoolean()) nicks.add(faker.ancient().god());
            if (faker.random().nextBoolean()) nicks.add(faker.ancient().hero());
            if (faker.random().nextBoolean()) nicks.add(faker.ancient().titan());
            if (faker.random().nextBoolean()) nicks.add(faker.cat().breed());
            if (faker.random().nextBoolean()) nicks.add(faker.cat().name());
            if (faker.random().nextBoolean()) nicks.add(faker.dog().breed());
            if (faker.random().nextBoolean()) nicks.add(faker.dog().name());
            Iterator<String> iter = nicks.iterator();
            if (nicks.size() > 1) {
                userName += iter.next();
                if (nicks.size() > 2 && userName.length() < 8) {
                    userName += iter.next();
                }
            }
        }
        if (userName.length() < 8) {
            userName += faker.funnyName().name();
        }
        if (faker.random().nextBoolean()) userName = userName.toLowerCase();
        return userName.replaceAll("[^\\w]", "");
    }

    public String generateDomainStatistically(String countryCode) {
        int coin = faker.random().nextInt(100);
        if (countryCode == null) countryCode = "net";
        if (coin >= 0 && coin < 7) return "microsoft.com";
        else if (coin >= 5 && coin < 20) return "gmail.com";
        else if (coin >= 21 && coin < 25) return "apple.com";
        else if (coin >= 25 && coin < 40)
            return faker.internet().domainName().replaceFirst("\\..*", "." + countryCode.toLowerCase());
        else if (coin >= 40 && coin < 95) return faker.internet().domainName();
        else return "mail." + countryCode.toLowerCase();
    }
}
