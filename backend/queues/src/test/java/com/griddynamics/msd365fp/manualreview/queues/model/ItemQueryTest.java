package com.griddynamics.msd365fp.manualreview.queues.model;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ItemQueryTest {

    @Test
    void ItemQueryCanDealWithArrayInFilter() {
        ItemFilter filter = new ItemFilterIn();
        filter.setCondition(ItemFilter.FilterCondition.IN);
        filter.setField(ItemFilter.FilterField.PRODUCT_SKU);
        filter.setValues(List.of("edu", "sales"));
        String select = ItemQuery.constructor("i")
                .all(List.of(filter))
                .and().active(true)
                .constructSelect();
        assertEquals(
                "SELECT i FROM i " +
                        "JOIN (SELECT VALUE purchaseProductList " +
                        "FROM purchaseProductList IN i.purchase.ProductList " +
                        "WHERE purchaseProductList.Sku IN ('edu', 'sales')) purchaseProductList " +
                        "WHERE true AND i.active=true",
                select);

    }

    @Test
    void ItemQueryCanDealWithArrayInManyFilters() {
        ItemFilter filter1 = new ItemFilterIn();
        filter1.setCondition(ItemFilter.FilterCondition.IN);
        filter1.setField(ItemFilter.FilterField.PRODUCT_SKU);
        filter1.setValues(List.of("edu", "sales"));
        ItemFilter filter2 = new ItemFilterIn();
        filter2.setCondition(ItemFilter.FilterCondition.IN);
        filter2.setField(ItemFilter.FilterField.PRODUCT_SKU);
        filter2.setValues(List.of("edu", "dreams"));
        String select = ItemQuery.constructor("i")
                .all(List.of(filter1, filter2))
                .and().active(true)
                .constructSelect();
        assertEquals(
                "SELECT i FROM i " +
                        "JOIN (SELECT VALUE purchaseProductList " +
                        "FROM purchaseProductList IN i.purchase.ProductList " +
                        "WHERE purchaseProductList.Sku IN ('edu', 'sales') " +
                        "AND purchaseProductList.Sku IN ('edu', 'dreams')" +
                        ") purchaseProductList " +
                        "WHERE true AND true AND i.active=true",
                select);

    }

    @Test
    void ItemQueryCanDealWithArrayInCombinedFilters() {
        ItemFilter filter1 = new ItemFilterIn();
        filter1.setCondition(ItemFilter.FilterCondition.IN);
        filter1.setField(ItemFilter.FilterField.PRODUCT_SKU);
        filter1.setValues(List.of("edu", "sales"));
        ItemFilter filter2 = new ItemFilterIn();
        filter2.setCondition(ItemFilter.FilterCondition.IN);
        filter2.setField(ItemFilter.FilterField.SCORE);
        filter2.setValues(List.of("0", "1"));
        String select = ItemQuery.constructor("i")
                .all(List.of(filter1, filter2))
                .and().active(true)
                .constructSelect();
        assertEquals(
                "SELECT i FROM i " +
                        "JOIN (SELECT VALUE purchaseProductList " +
                        "FROM purchaseProductList IN i.purchase.ProductList " +
                        "WHERE purchaseProductList.Sku IN ('edu', 'sales')) purchaseProductList " +
                        "WHERE true AND i.decision.riskScore IN ('0', '1') AND i.active=true",
                select);
    }

    @Test
    void ItemQueryCanDealWithUsualInFilters() {
        ItemFilter filter = new ItemFilterIn();
        filter.setCondition(ItemFilter.FilterCondition.IN);
        filter.setField(ItemFilter.FilterField.SCORE);
        filter.setValues(List.of("0", "1"));
        String select = ItemQuery.constructor("i")
                .all(List.of(filter))
                .and().active(true)
                .constructSelect();
        assertEquals(
                "SELECT i FROM i  WHERE i.decision.riskScore IN ('0', '1') AND i.active=true",
                select);
    }

    @Test
    void ItemQueryCanDealWithArrayInCombinedFiltersWhenCount() {
        ItemFilter filter1 = new ItemFilterIn();
        filter1.setCondition(ItemFilter.FilterCondition.IN);
        filter1.setField(ItemFilter.FilterField.PRODUCT_SKU);
        filter1.setValues(List.of("edu", "sales"));
        ItemFilter filter2 = new ItemFilterIn();
        filter2.setCondition(ItemFilter.FilterCondition.IN);
        filter2.setField(ItemFilter.FilterField.SCORE);
        filter2.setValues(List.of("0", "1"));
        String counting = ItemQuery.constructor("i")
                .all(List.of(filter1, filter2))
                .and().active(true)
                .constructCount();
        assertEquals(
                "SELECT VALUE COUNT(1) FROM i " +
                        "JOIN (SELECT VALUE purchaseProductList " +
                        "FROM purchaseProductList IN i.purchase.ProductList " +
                        "WHERE purchaseProductList.Sku IN ('edu', 'sales')) purchaseProductList " +
                        "WHERE true AND i.decision.riskScore IN ('0', '1') AND i.active=true",
                counting);
    }

}