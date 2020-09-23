// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import autobind from 'autobind-decorator';
import cn from 'classnames';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { Price } from '../../../../../components/price';
import { ExternalLink } from '../../../../../models';
import { Item } from '../../../../../models/item';
import { formatToMMMDYYY, formatToLocaleString } from '../../../../../utils/date';
import { placeHold, stringToKebabCase } from '../../../../../utils/text';
import { ItemDetailsKeyValue } from '../../item-details-key-value';
import { ItemDetailsTile } from '../../item-details-tile';
import GreenCheckIcon from '../../../../../assets/icon/green-check.svg';
import './account-summary.scss';
import { KeyValueItem, valuePlaceholder } from '../key-value-item';

const CN = 'item-details-account-summary';

interface AccountSummaryProps {
    className?: string;
    item: Item,
    externalLinksMap: ExternalLink[]
}

interface AccountSummaryState {
    detailsExpanded: boolean;
}

@observer
export class AccountSummary extends Component<AccountSummaryProps, AccountSummaryState> {
    constructor(props: AccountSummaryProps) {
        super(props);

        this.state = {
            detailsExpanded: false
        };
    }

    @autobind
    toggleDetails() {
        const { detailsExpanded } = this.state;
        this.setState({ detailsExpanded: !detailsExpanded });
    }

    renderKeyValueConfig(config: KeyValueItem[]) {
        return config
            .map(({
                key,
                value,
                className,
                contentClassName,
                isPrice
            }) => {
                let valueToRender = value;

                if (isPrice && value) {
                    valueToRender = (<Price value={value} />);
                }

                return (
                    <ItemDetailsKeyValue
                        className={cn(`${CN}__key-value`, className)}
                        contentClassName={contentClassName}
                        key={stringToKebabCase(key)}
                        label={key}
                        value={placeHold(valueToRender, valuePlaceholder(CN))}
                    />
                );
            });
    }

    renderTopInfo() {
        const { detailsExpanded } = this.state;
        const { item } = this.props;
        const { user } = item.purchase;

        const renderingConfigTop: KeyValueItem[] = [
            { key: 'Total spent', value: user.totalSpend, isPrice: true },
            { key: 'Last 30 days spent', value: user.last30DaysSpend, isPrice: true },
            { key: 'Monthly average spent', value: user.monthlyAverageSpend, isPrice: true },
        ];

        const renderingConfigExpandable: KeyValueItem[] = [
            { key: 'Total transactions', value: user.totalTransactions },
            { key: 'Last 30 days transactions', value: user.last30DaysTransactions },
            { key: 'Monthly average transactions', value: user.monthlyAverageTransactions },
            { key: 'Total refund amount', value: user.totalRefundAmount, isPrice: true },
            { key: 'Last 30 days refund amount', value: user.last30DaysRefundAmount, isPrice: true },
            { key: 'Monthly average refund amount', value: user.monthlyAverageRefundAmount, isPrice: true },
            { key: 'Total chargeback amount', value: user.totalChargebackAmount, isPrice: true },
            { key: 'Last 30 days chargeback amount', value: user.last30DaysChargebackAmount, isPrice: true },
            { key: 'Monthly average chargeback amount', value: user.monthlyAverageChargebackAmount, isPrice: true },
        ];

        return (
            <div className={`${CN}__top`}>
                {this.renderKeyValueConfig(renderingConfigTop)}
                <IconButton
                    className={`${CN}__details-toggle`}
                    iconProps={{
                        iconName: detailsExpanded ? 'ChevronUp' : 'ChevronDown'
                    }}
                    title="Expand/Collapse"
                    ariaLabel="Expand account summary"
                    onClick={this.toggleDetails}
                />
                <div className={cn(`${CN}__expandable`, detailsExpanded && `${CN}__expandable--expanded`)}>
                    {this.renderKeyValueConfig(renderingConfigExpandable)}
                </div>
            </div>
        );
    }

    renderValidatedInfo(value: any, isValidated: boolean, timeValidated: string) {
        if (!value) {
            return placeHold(value, valuePlaceholder(CN));
        }

        return (
            <div>
                {isValidated && <GreenCheckIcon className={`${CN}__validated-info-icon`} />}
                <span className={`${CN}__validated-info-value`}>
                    {placeHold(value, valuePlaceholder(CN))}
                </span>
                {timeValidated && (
                    <span className={`${CN}__validated-info-date`}>
                        (
                        {formatToMMMDYYY(timeValidated)}
                        )
                    </span>
                )}
            </div>
        );
    }

    renderBottomInfo() {
        const { item } = this.props;
        const { purchase } = item;
        const { user } = purchase;

        const renderingConfig: KeyValueItem[] = [
            { key: 'Profile Type', value: user.profileType },
            { key: 'User ID', value: user.userId },
            { key: 'Country', value: user.country },
            { key: 'Zip', value: user.zipCode },
            { key: 'Name', value: user.fullName },
            { key: 'Member ID', value: user.membershipId, contentClassName: `${CN}__id` },
            { key: 'Language', value: user.language },
            { key: 'Time zone', value: user.timeZone },
            { key: 'Display name', value: user.displayName },
            { key: 'Created', value: formatToLocaleString(user.creationDate, valuePlaceholder(CN)) },
            { key: 'Phone number', value: this.renderValidatedInfo(user.phoneNumber, user.isPhoneNumberValidated, user.phoneNumberValidatedDate), className: `${CN}__span-2` },
            { key: 'Profile name', value: user.profileName },
            { key: 'Updated', value: formatToLocaleString(user.updateDate, valuePlaceholder(CN)) },
            { key: 'Email', value: this.renderValidatedInfo(user.email, user.isEmailValidated, user.emailValidationDate), className: `${CN}__span-2` },
        ];

        return (
            <div className={`${CN}__bottom`}>
                {this.renderKeyValueConfig(renderingConfig)}
            </div>
        );
    }

    @autobind
    renderLinks() {
        const { externalLinksMap } = this.props;

        if (externalLinksMap && externalLinksMap.length) {
            const links = externalLinksMap.map(({ url, name, icon }) => {
                if (icon) {
                    return (
                        <IconButton
                            className={`${CN}__external-links-icon`}
                            iconProps={{ iconName: icon }}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    );
                }

                return (
                    <a
                        className={`${CN}__external-links-badge`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {name}
                    </a>
                );
            });

            return (
                <div className={`${CN}__external-links`}>
                    {links}
                </div>
            );
        }

        return null;
    }

    render() {
        const { className } = this.props;
        return (
            <ItemDetailsTile
                className={cn(CN, className)}
                headerClassName={CN}
                title="Account summary"
                subtitle={this.renderLinks()}
            >
                {this.renderTopInfo()}
                {this.renderBottomInfo()}
            </ItemDetailsTile>
        );
    }
}
