package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * Implementation of {@link NodeData}
 *
 * @see NodeData
 */
@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class AddressNodeData extends NodeData {
    private String addressId;
    private String street1;
    private String street2;
    private String street3;
    private String city;
    private String state;
    private String zipCode;
    private String countryRegion;

}
