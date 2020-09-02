/*
 * Knowledge Gateway Service
 * This API allows merchants using Microsoft Dynamics 365 Fraud Protection to send events for risk evaluation. These events are used to build up information about the purchases the customers are making and provide merchants with a recommendation to approve or reject transactions due to Fraud. For integration and testing, please use the https://api.dfp.microsoft-int.com/ endpoint. For Production, please use https://api.dfp.microsoft.com/.
 *
 * OpenAPI spec version: v1.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

package com.griddynamics.msd365fp.manualreview.queues.model.testing;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.Objects;

/**
 * N/A
 */
@Schema(description = "N/A")
@Builder
@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.JavaClientCodegen", date = "2019-11-14T20:07:05.300728+04:00[Europe/Saratov]")
public class MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct {
  @JsonProperty("productId")
  private String productId;

  @JsonProperty("productName")
  private String productName;

  @JsonProperty("type")
  private String type;

  @JsonProperty("sku")
  private String sku;

  @JsonProperty("category")
  private String category;

  @JsonProperty("market")
  private String market;

  @JsonProperty("salesPrice")
  private java.math.BigDecimal salesPrice;

  @JsonProperty("currency")
  private String currency;

  @JsonProperty("cogs")
  private java.math.BigDecimal cogs;

  @JsonProperty("isRecurring")
  private Boolean isRecurring;

  @JsonProperty("isFree")
  private Boolean isFree;

  @JsonProperty("language")
  private String language;

  @JsonProperty("purchasePrice")
  private java.math.BigDecimal purchasePrice;

  @JsonProperty("margin")
  private java.math.BigDecimal margin;

  @JsonProperty("quantity")
  private Integer quantity;

  @JsonProperty("isPreorder")
  private Boolean isPreorder;

  @JsonProperty("shippingMethod")
  private String shippingMethod;

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct productId(String productId) {
    this.productId = productId;
    return this;
  }

   /**
   * Product identifier in merchant system.
   * @return productId
  **/
  @Schema(required = true, description = "Product identifier in merchant system.")
  public String getProductId() {
    return productId;
  }

  public void setProductId(String productId) {
    this.productId = productId;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct productName(String productName) {
    this.productName = productName;
    return this;
  }

   /**
   * User-readable product name.
   * @return productName
  **/
  @Schema(description = "User-readable product name.")
  public String getProductName() {
    return productName;
  }

  public void setProductName(String productName) {
    this.productName = productName;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct type(String type) {
    this.type = type;
    return this;
  }

   /**
   * Type of product sold. Possible values &#x27;Digital&#x27; | &#x27;Physical&#x27;
   * @return type
  **/
  @Schema(description = "Type of product sold. Possible values 'Digital' | 'Physical'")
  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct sku(String sku) {
    this.sku = sku;
    return this;
  }

   /**
   * Product SKU
   * @return sku
  **/
  @Schema(description = "Product SKU")
  public String getSku() {
    return sku;
  }

  public void setSku(String sku) {
    this.sku = sku;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct category(String category) {
    this.category = category;
    return this;
  }

   /**
   * Category of product. Possible values &#x27;Subscription&#x27; | &#x27;Game&#x27; | &#x27;GameConsumable&#x27; | &#x27;GameDLC&#x27; | &#x27;HardwareDevice&#x27; | &#x27;HardwareAccessory&#x27; | &#x27;SoftwareToken&#x27; | &#x27;SoftwareDirectEntitlement&#x27; | &#x27;ClothingShoes&#x27; | &#x27;RecreationalEquipment&#x27; | &#x27;Jewelry&#x27; | &#x27;Hotel&#x27; | &#x27;Ticket&#x27; | &#x27;VehicleRental&#x27; | &#x27;GiftCard&#x27; | &#x27;Movies&#x27; | &#x27;Music&#x27; | &#x27;GarageIndustrial&#x27; | &#x27;HomeGarden&#x27; | &#x27;Tools&#x27; | &#x27;Books&#x27; | &#x27;HealthBeauty&#x27; | &#x27;Furniture&#x27; | &#x27;Toys&#x27; | &#x27;FoodGrocery&#x27;
   * @return category
  **/
  @Schema(description = "Category of product. Possible values 'Subscription' | 'Game' | 'GameConsumable' | 'GameDLC' | 'HardwareDevice' | 'HardwareAccessory' | 'SoftwareToken' | 'SoftwareDirectEntitlement' | 'ClothingShoes' | 'RecreationalEquipment' | 'Jewelry' | 'Hotel' | 'Ticket' | 'VehicleRental' | 'GiftCard' | 'Movies' | 'Music' | 'GarageIndustrial' | 'HomeGarden' | 'Tools' | 'Books' | 'HealthBeauty' | 'Furniture' | 'Toys' | 'FoodGrocery'")
  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct market(String market) {
    this.market = market;
    return this;
  }

   /**
   * Market in which product is offered
   * @return market
  **/
  @Schema(description = "Market in which product is offered")
  public String getMarket() {
    return market;
  }

  public void setMarket(String market) {
    this.market = market;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct salesPrice(java.math.BigDecimal salesPrice) {
    this.salesPrice = salesPrice;
    return this;
  }

   /**
   * Price of item sold (not including tax). Provided by the Merchant.
   * @return salesPrice
  **/
  @Schema(description = "Price of item sold (not including tax). Provided by the Merchant.")
  public java.math.BigDecimal getSalesPrice() {
    return salesPrice;
  }

  public void setSalesPrice(java.math.BigDecimal salesPrice) {
    this.salesPrice = salesPrice;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct currency(String currency) {
    this.currency = currency;
    return this;
  }

   /**
   * Currency used for sales price. Provided by the Merchant.
   * @return currency
  **/
  @Schema(description = "Currency used for sales price. Provided by the Merchant.")
  public String getCurrency() {
    return currency;
  }

  public void setCurrency(String currency) {
    this.currency = currency;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct cogs(java.math.BigDecimal cogs) {
    this.cogs = cogs;
    return this;
  }

   /**
   * Cost of Goods Sold – raw material cost of item. Provided by the Merchant.
   * @return cogs
  **/
  @Schema(description = "Cost of Goods Sold – raw material cost of item. Provided by the Merchant.")
  public java.math.BigDecimal getCogs() {
    return cogs;
  }

  public void setCogs(java.math.BigDecimal cogs) {
    this.cogs = cogs;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct isRecurring(Boolean isRecurring) {
    this.isRecurring = isRecurring;
    return this;
  }

   /**
   * Indicates if product is recurring subscription.
   * @return isRecurring
  **/
  @Schema(description = "Indicates if product is recurring subscription.")
  public Boolean isIsRecurring() {
    return isRecurring;
  }

  public void setIsRecurring(Boolean isRecurring) {
    this.isRecurring = isRecurring;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct isFree(Boolean isFree) {
    this.isFree = isFree;
    return this;
  }

   /**
   * Indicates if product is offered for free.
   * @return isFree
  **/
  @Schema(description = "Indicates if product is offered for free.")
  public Boolean isIsFree() {
    return isFree;
  }

  public void setIsFree(Boolean isFree) {
    this.isFree = isFree;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct language(String language) {
    this.language = language;
    return this;
  }

   /**
   * Language in which product is described.
   * @return language
  **/
  @Schema(description = "Language in which product is described.")
  public String getLanguage() {
    return language;
  }

  public void setLanguage(String language) {
    this.language = language;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct purchasePrice(java.math.BigDecimal purchasePrice) {
    this.purchasePrice = purchasePrice;
    return this;
  }

   /**
   * Price for line item at the purchase.
   * @return purchasePrice
  **/
  @Schema(description = "Price for line item at the purchase.")
  public java.math.BigDecimal getPurchasePrice() {
    return purchasePrice;
  }

  public void setPurchasePrice(java.math.BigDecimal purchasePrice) {
    this.purchasePrice = purchasePrice;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct margin(java.math.BigDecimal margin) {
    this.margin = margin;
    return this;
  }

   /**
   * Margin gained by sale of item.
   * @return margin
  **/
  @Schema(description = "Margin gained by sale of item.")
  public java.math.BigDecimal getMargin() {
    return margin;
  }

  public void setMargin(java.math.BigDecimal margin) {
    this.margin = margin;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct quantity(Integer quantity) {
    this.quantity = quantity;
    return this;
  }

   /**
   * Quantity of item purchased
   * @return quantity
  **/
  @Schema(description = "Quantity of item purchased")
  public Integer getQuantity() {
    return quantity;
  }

  public void setQuantity(Integer quantity) {
    this.quantity = quantity;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct isPreorder(Boolean isPreorder) {
    this.isPreorder = isPreorder;
    return this;
  }

   /**
   * Indicates if the product is offered for preorder.
   * @return isPreorder
  **/
  @Schema(description = "Indicates if the product is offered for preorder.")
  public Boolean isIsPreorder() {
    return isPreorder;
  }

  public void setIsPreorder(Boolean isPreorder) {
    this.isPreorder = isPreorder;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct shippingMethod(String shippingMethod) {
    this.shippingMethod = shippingMethod;
    return this;
  }

   /**
   * Indicates the method used to ship the product. Possible values &#x27;InStorePickup&#x27; | &#x27;Standard&#x27; | &#x27;Express&#x27; | &#x27;DirectEntitlement&#x27; | &#x27;DigitalToken&#x27;
   * @return shippingMethod
  **/
  @Schema(description = "Indicates the method used to ship the product. Possible values 'InStorePickup' | 'Standard' | 'Express' | 'DirectEntitlement' | 'DigitalToken'")
  public String getShippingMethod() {
    return shippingMethod;
  }

  public void setShippingMethod(String shippingMethod) {
    this.shippingMethod = shippingMethod;
  }


  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct = (MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct) o;
    return Objects.equals(this.productId, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.productId) &&
        Objects.equals(this.productName, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.productName) &&
        Objects.equals(this.type, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.type) &&
        Objects.equals(this.sku, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.sku) &&
        Objects.equals(this.category, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.category) &&
        Objects.equals(this.market, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.market) &&
        Objects.equals(this.salesPrice, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.salesPrice) &&
        Objects.equals(this.currency, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.currency) &&
        Objects.equals(this.cogs, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.cogs) &&
        Objects.equals(this.isRecurring, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.isRecurring) &&
        Objects.equals(this.isFree, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.isFree) &&
        Objects.equals(this.language, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.language) &&
        Objects.equals(this.purchasePrice, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.purchasePrice) &&
        Objects.equals(this.margin, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.margin) &&
        Objects.equals(this.quantity, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.quantity) &&
        Objects.equals(this.isPreorder, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.isPreorder) &&
        Objects.equals(this.shippingMethod, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct.shippingMethod);
  }

  @Override
  public int hashCode() {
    return Objects.hash(productId, productName, type, sku, category, market, salesPrice, currency, cogs, isRecurring, isFree, language, purchasePrice, margin, quantity, isPreorder, shippingMethod);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseProduct {\n");
    
    sb.append("    productId: ").append(toIndentedString(productId)).append("\n");
    sb.append("    productName: ").append(toIndentedString(productName)).append("\n");
    sb.append("    type: ").append(toIndentedString(type)).append("\n");
    sb.append("    sku: ").append(toIndentedString(sku)).append("\n");
    sb.append("    category: ").append(toIndentedString(category)).append("\n");
    sb.append("    market: ").append(toIndentedString(market)).append("\n");
    sb.append("    salesPrice: ").append(toIndentedString(salesPrice)).append("\n");
    sb.append("    currency: ").append(toIndentedString(currency)).append("\n");
    sb.append("    cogs: ").append(toIndentedString(cogs)).append("\n");
    sb.append("    isRecurring: ").append(toIndentedString(isRecurring)).append("\n");
    sb.append("    isFree: ").append(toIndentedString(isFree)).append("\n");
    sb.append("    language: ").append(toIndentedString(language)).append("\n");
    sb.append("    purchasePrice: ").append(toIndentedString(purchasePrice)).append("\n");
    sb.append("    margin: ").append(toIndentedString(margin)).append("\n");
    sb.append("    quantity: ").append(toIndentedString(quantity)).append("\n");
    sb.append("    isPreorder: ").append(toIndentedString(isPreorder)).append("\n");
    sb.append("    shippingMethod: ").append(toIndentedString(shippingMethod)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }

}
