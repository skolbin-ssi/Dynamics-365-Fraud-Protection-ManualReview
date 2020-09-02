import { IconButton } from '@fluentui/react/lib/Button';
import { Text } from '@fluentui/react/lib/Text';
import autobind from 'autobind-decorator';
import cn from 'classnames';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { renderToString } from 'react-dom/server';
import BillingMarker from '../../../../../assets/icon/markers/billing.svg';
import GeolocationMarker from '../../../../../assets/icon/markers/geolocation.svg';
import ShippingMarker from '../../../../../assets/icon/markers/shipping.svg';
import {
    Address,
    ADDRESS_TYPE,
    Item,
    Purchase
} from '../../../../../models/item';
import { stringToKebabCase } from '../../../../../utils/text';
import { ItemDetailsTile } from '../../item-details-tile';
import { Map, MapMarker } from './map';
import './transaction-map.scss';

const CN = 'item-details-transaction-map';

interface TransactionMapProps {
    className?: string;
    item: Item
}

interface TransactionMapState {
    detailsExpandedFor: string | null
}

@observer
export class TransactionMap extends Component<TransactionMapProps, TransactionMapState> {
    private readonly shippingMarkerAsSVGString = renderToString(<ShippingMarker />);

    private readonly billingMarkerAsSVGString = renderToString(<BillingMarker />);

    private readonly geolocationMarkerAsSVGString = renderToString(<GeolocationMarker />);

    constructor(props: TransactionMapProps) {
        super(props);

        this.state = {
            detailsExpandedFor: null
        };
    }

    getAddresses(purchase: Purchase): MapMarker[] {
        const markers = purchase.geoAddressList
            .map(geoAddress => ({
                geoAddress,
                icon: geoAddress.address.type === ADDRESS_TYPE.SHIPPING ? this.shippingMarkerAsSVGString : this.billingMarkerAsSVGString,
                IconComponent: geoAddress.address.type === ADDRESS_TYPE.SHIPPING ? ShippingMarker : BillingMarker
            }));

        return markers.concat([
            {
                geoAddress: purchase.deviceContext.address,
                icon: this.geolocationMarkerAsSVGString,
                IconComponent: GeolocationMarker
            }
        ]);
    }

    getAddressDisplayType(address: Address) {
        switch (address.type) {
            case ADDRESS_TYPE.SHIPPING:
                return 'Shipping address';
            case ADDRESS_TYPE.GEO:
                return 'Geo location';
            case ADDRESS_TYPE.BILLING:
            default:
                return 'Billing address';
        }
    }

    @autobind
    toggleExpandedAddress(address: Address) {
        const { detailsExpandedFor } = this.state;
        const key = stringToKebabCase(address.street1);

        if (detailsExpandedFor === key) {
            this.setState({ detailsExpandedFor: null });
        } else {
            this.setState({ detailsExpandedFor: key });
        }
    }

    @autobind
    renderSingleAddressDetail(label: string, value?: string) {
        if (!value) {
            return null;
        }

        return (
            <div className={`${CN}__single-address-detail`}>
                <Text
                    variant="medium"
                    className={`${CN}__single-address-detail-label`}
                >
                    {label}
                    :&nbsp;
                </Text>
                <Text
                    variant="medium"
                    className={`${CN}__single-address-detail-value`}
                >
                    {value}
                </Text>
            </div>
        );
    }

    @autobind
    renderSingleAddress(mapMarker: MapMarker, shippingAddressMarker?: MapMarker) {
        const { detailsExpandedFor } = this.state;
        const { geoAddress, IconComponent } = mapMarker;
        const { address } = geoAddress;
        const { firstName, lastName, phoneNumber } = address;
        const isShippingAddress = geoAddress.address.type === ADDRESS_TYPE.SHIPPING;
        const key = stringToKebabCase(geoAddress.address.street1);
        const hasDetails = firstName || lastName || phoneNumber;
        const areDetailsExpanded = detailsExpandedFor === key && hasDetails;
        let distance = null;

        if (shippingAddressMarker) {
            distance = geoAddress.getDistanceToAddress(shippingAddressMarker.geoAddress).distanceInMiles;
        }

        const hasDistance = !isShippingAddress && shippingAddressMarker && distance;

        return (
            <div
                className={`${CN}__single-address`}
                key={key}
            >
                <div className={`${CN}__single-address-type`}>
                    <Text
                        variant="medium"
                        className={`${CN}__single-address-type-label`}
                    >
                        {this.getAddressDisplayType(geoAddress.address)}
                        {hasDistance && (<>:&nbsp;</>)}
                    </Text>
                    { hasDistance && (
                        <Text
                            variant="medium"
                            className={`${CN}__single-address-type-distance`}
                        >
                            distance&nbsp;
                            {distance}
                            &nbsp;mi
                        </Text>
                    )}
                </div>
                <IconComponent className={`${CN}__single-address-icon`} />
                <Text
                    variant="medium"
                    className={`${CN}__single-address-street`}
                >
                    {geoAddress.address.displayLineAddress}
                </Text>
                { hasDetails && (
                    <IconButton
                        className={`${CN}__single-address-details-toggle`}
                        iconProps={{
                            iconName: areDetailsExpanded ? 'ChevronUp' : 'ChevronDown'
                        }}
                        title="Expand/Collapse"
                        ariaLabel="Expand address details"
                        onClick={() => this.toggleExpandedAddress(geoAddress.address)}
                    />
                )}
                <div className={cn(`${CN}__single-address-details`, areDetailsExpanded && `${CN}__single-address-details--expanded`)}>
                    {this.renderSingleAddressDetail('First name', firstName)}
                    {this.renderSingleAddressDetail('Last name', lastName)}
                    {this.renderSingleAddressDetail('Phone number', phoneNumber)}
                </div>
            </div>
        );
    }

    renderAddresses() {
        const { item } = this.props;
        const { purchase } = item;

        const addresses = this.getAddresses(purchase);
        const shippingAddress = addresses.find(marker => marker.geoAddress.address.type === ADDRESS_TYPE.SHIPPING);

        return (
            <div className={`${CN}__address-list-inner`}>
                {addresses.map(address => this.renderSingleAddress(address, shippingAddress))}
            </div>
        );
    }

    render() {
        const { className, item } = this.props;

        return (
            <ItemDetailsTile
                className={cn(className, CN)}
                title="Transaction map"
            >
                <Map
                    className={`${CN}__map`}
                    item={item}
                    markers={this.getAddresses(item.purchase)}
                />
                <div className={`${CN}__address-list`}>
                    {this.renderAddresses()}
                </div>
            </ItemDetailsTile>
        );
    }
}
