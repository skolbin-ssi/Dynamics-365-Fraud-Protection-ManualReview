package com.griddynamics.msd365fp.manualreview.queues.config;

import com.griddynamics.msd365fp.manualreview.model.Decision;
import com.griddynamics.msd365fp.manualreview.model.dfp.*;
import com.griddynamics.msd365fp.manualreview.model.dfp.raw.*;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DATETIME_PATTERN_DFP;

@Configuration
public class DFPModelMapperConfig {

    @Bean
    public ModelMapper dfpModelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setSkipNullEnabled(true)
                .setCollectionsMergeEnabled(false)
                .setMatchingStrategy(MatchingStrategies.STRICT);
        addStringToDateConverter(modelMapper);
        addGeneralModelConvertor(modelMapper);
        return modelMapper;
    }


    private void addStringToDateConverter(ModelMapper modelMapper) {
        TypeMap<String, OffsetDateTime> typeMap = modelMapper.createTypeMap(String.class, OffsetDateTime.class);
        Converter<String, OffsetDateTime> dateConverter = ctx ->
                ctx.getSource() == null ?
                        null :
                        OffsetDateTime.parse(ctx.getSource(), DateTimeFormatter.ofPattern(DATETIME_PATTERN_DFP));
        typeMap.setConverter(dateConverter);
    }

    private void addGeneralModelConvertor(ModelMapper modelMapper) {
        TypeMap<ExplorerEntity, Item> typeMap = modelMapper.createTypeMap(ExplorerEntity.class, Item.class);
        Converter<ExplorerEntity, Item> converter = ctx ->
        {
            Item item = Objects.requireNonNullElse(ctx.getDestination(), new Item());
            ExplorerEntity entity = Objects.requireNonNull(ctx.getSource());
            mapExplorerEntityToItem(modelMapper, item, entity);
            return item;
        };
        typeMap.setConverter(converter);
    }

    private void mapExplorerEntityToItem(final ModelMapper modelMapper, final Item item, final ExplorerEntity entity) {
        DeviceContext deviceContext = new DeviceContext();
        Map<String, PaymentInstrument> paymentInstrumentMap = new HashMap<>();
        Map<String, Product> productMap = new HashMap<>();
        Map<String, BankEvent> bankEventMap = new HashMap<>();
        Map<String, Address> addressMap = new HashMap<>();
        Map<String, PreviousPurchase> previousPurchaseMap = new HashMap<>();
        AssesmentResult assesmentResult = new AssesmentResult();
        Map<String, PurchaseStatus> purchaseStatusMap = new HashMap<>();
        User user = new User();
        MainPurchase purchase = new MainPurchase();
        Map<String, Map<String, Object>> additionalInfo = new HashMap<>();

        entity.getEdges().forEach(edge -> {
            switch (edge.getName()) {
                case "PurchaseAddress":
                    modelMapper.map(edge.getData(), addressMap.computeIfAbsent(
                            ((PurchaseAddressEdgeData) edge.getData()).getAddressId(),
                            key -> new Address()));
                    break;
                case "PaymentInstrumentAddress":
                    PaymentInstrumentAddressEdgeData edgeData =
                            ((PaymentInstrumentAddressEdgeData) edge.getData());
                    modelMapper.map(edge.getData(), addressMap.computeIfAbsent(
                            edgeData.getAddressId(),
                            key -> new Address()));
                    paymentInstrumentMap
                            .computeIfAbsent(
                                    edgeData.getPaymentInstrumentId(),
                                    key -> new PaymentInstrument())
                            .setAddressId(edgeData.getAddressId());
                    break;
                case "PurchaseBankEvent":
                    modelMapper.map(edge.getData(), bankEventMap.computeIfAbsent(
                            ((PurchaseBankEventEdgeData) edge.getData()).getBankEventId(),
                            key -> new BankEvent()));
                    break;
                case "PurchaseDeviceContext":
                    modelMapper.map(edge.getData(), deviceContext);
                    break;
                case "PaymentInstrumentPurchase":
                case "PurchasePaymentInstrument":
                    modelMapper.map(edge.getData(), paymentInstrumentMap.computeIfAbsent(
                            ((PurchasePaymentInstrumentEdgeData) edge.getData()).getPaymentInstrumentId(),
                            key -> new PaymentInstrument()));
                    break;
                case "PurchaseProduct":
                    modelMapper.map(edge.getData(), productMap.computeIfAbsent(
                            ((PurchaseProductEdgeData) edge.getData()).getProductId(),
                            key -> new Product()));
                    break;
                case "PurchaseStatus":
                    modelMapper.map(edge.getData(), purchaseStatusMap.computeIfAbsent(
                            edge.getId(),
                            key -> new PurchaseStatus()));
                    modelMapper.map(edge.getData(), assesmentResult);
                    break;
                case "PurchaseUser":
                    modelMapper.map(edge.getData(), user);
                    break;
                default:
                    modelMapper.map(edge.getData(), additionalInfo.computeIfAbsent(
                            edge.getName() + edge.getId(),
                            key -> new HashMap<>()));
            }
        });
        entity.getNodes().forEach(node -> {
            switch (node.getName()) {
                case "Address":
                    modelMapper.map(node.getData(), addressMap.computeIfAbsent(node.getId(), key -> new Address()));
                    break;
                case "BankEvent":
                    modelMapper.map(node.getData(), bankEventMap.computeIfAbsent(node.getId(), key -> new BankEvent()));
                    break;
                case "DeviceContext":
                    modelMapper.map(node.getData(), deviceContext);
                    break;
                case "PaymentInstrument":
                    modelMapper.map(node.getData(), paymentInstrumentMap.computeIfAbsent(node.getId(), key -> new PaymentInstrument()));
                    break;
                case "Product":
                    modelMapper.map(node.getData(), productMap.computeIfAbsent(node.getId(), key -> new Product()));
                    break;
                case "Purchase":
                    if (node.getId().equals(item.getId())) {
                        modelMapper.map(node.getData(), purchase);
                        modelMapper.map(node.getData(), assesmentResult);
                    } else {
                        modelMapper.map(node.getData(), previousPurchaseMap.computeIfAbsent(node.getId(), key -> new PreviousPurchase()));
                    }
                    break;
                case "User":
                    modelMapper.map(node.getData(), user);
                    break;
                default:
                    modelMapper.map(node.getData(), additionalInfo.computeIfAbsent(
                            node.getName() + node.getId(),
                            key -> new HashMap<>()));
            }
        });

        purchase.setPreviousPurchaseList(new ArrayList<>(previousPurchaseMap.values()));
        purchase.setAddressList(new ArrayList<>(addressMap.values()));
        purchase.setBankEventsList(new ArrayList<>(bankEventMap.values()));
        purchase.setDeviceContext(deviceContext);
        purchase.setPaymentInstrumentList(new ArrayList<>(paymentInstrumentMap.values()));
        purchase.setProductList(new ArrayList<>(productMap.values()));
        purchase.setUser(user);
        assesmentResult.setPurchaseStatusList(new ArrayList<>(purchaseStatusMap.values()));
        // Create and save the item
        item.setPurchase(purchase);
        item.setAssessmentResult(assesmentResult);
        item.setDecision(Decision.builder()
                .riskScore(assesmentResult.getRiskScore())
                .reasonCodes(assesmentResult.getReasonCodes())
                .build());
    }
}
