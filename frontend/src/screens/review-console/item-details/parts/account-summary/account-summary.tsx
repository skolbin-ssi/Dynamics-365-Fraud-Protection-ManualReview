// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './account-summary.scss';

import autobind from 'autobind-decorator';
import cn from 'classnames';
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import { IconButton } from '@fluentui/react/lib/Button';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';

import { IconText } from '../../../../../components/icon-text';
import { Price } from '../../../../../components/price';
import { ExternalLink } from '../../../../../models';
import { Item } from '../../../../../models/item';
import { formatToLocaleString, formatToMMMDYYY } from '../../../../../utils/date';
import { placeHold, stringToKebabCase } from '../../../../../utils/text';
import { ItemDetailsKeyValue } from '../../item-details-key-value';
import { ItemDetailsTile } from '../../item-details-tile';
import { KeyValueItem, valuePlaceholder } from '../key-value-item';

const CN = 'item-details-account-summary, red';

interface AccountSummaryProps {
    className?: string;
    item: Item,
    externalLinksMap: ExternalLink[]
}

@observer
export class AccountSummary extends Component<AccountSummaryProps, never> {
    renderKeyValueConfig(config: KeyValueItem[]) {
        return config
            .map(({
                key,
                value,
                className,
                contentClassName,
                isPrice,
                valueToCopy,
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
                        value={placeHold(valueToRender, valuePlaceholder())}
                        valueToCopy={valueToCopy}
                    />
                );
            });
    }

    renderValidatedInfo(value: any, isValidated: boolean, tooltipText?: string | JSX.Element) {
        return (
            <IconText
                text={value || null}
                textVariant="medium"
                placeholder={valuePlaceholder()}
                iconValue={isValidated}
                icons={{
                    GOOD: {
                        value: true,
                        iconName: 'CompletedSolid',
                        tooltipText
                    },
                    BAD: {
                        value: false,
                        iconName: 'WarningSolid',
                        tooltipText
                    },
                }}
            />
        );
    }

    renderValueWithExtraInfo(value: string | JSX.Element, extraInfo: string | JSX.Element | null, tooltipText?: string) {
        const tooltipId = `${Math.random()}`;
        return (
            <div>
                <span className={`${CN}__complex-value__value`}>
                    {placeHold(value, valuePlaceholder())}
                </span>
                {extraInfo && (
                    <span className={`${CN}__complex-value__extra-info`}>
                        (
                        {extraInfo}
                        )
                    </span>
                )}
                {
                    extraInfo && tooltipText && (
                        <TooltipHost
                            content={tooltipText}
                            id={tooltipId}
                            calloutProps={{ gapSpace: 0 }}
                        >
                            <FontIcon
                                iconName="Info"
                                className={`${CN}__complex-value__icon`}
                                aria-describedby={tooltipId}
                            />
                        </TooltipHost>
                    )
                }
            </div>
        );
    }

    renderMainContent() {
        const { item } = this.props;
        const { purchase } = item;
        const { user, calculatedFields } = purchase;

        const renderingConfig: KeyValueItem[] = [
            { key: 'Profile type', value: user.profileType, className: `${CN}__span-2` },
            {
                key: 'User ID',
                value: user.isFraud ? this.renderValidatedInfo(
                    user.userId,
                    !user.isFraud,
                    `${user.isFraud ? 'User Restricted' : ''}`
                ) : user.userId,
                valueToCopy: user.userId
            },
            { key: 'Country', value: user.country },
            { key: 'Zip', value: user.zipCode, valueToCopy: user.zipCode },
            {
                key: 'Name',
                value: user.fullName,
                className: `${CN}__span-2`,
                valueToCopy: user.fullName,
            },
            {
                key: 'Member ID',
                value: user.membershipId,
                contentClassName: `${CN}__id`,
                valueToCopy: user.membershipId,
            },
            {
                key: 'Phone number',
                value: this.renderValidatedInfo(
                    user.phoneNumber,
                    user.isPhoneNumberValidated,
                    user.phoneNumberValidatedDate ? `Was validated ${formatToMMMDYYY(user.phoneNumberValidatedDate)}` : ''
                ),
                className: `${CN}__span-2`,
                valueToCopy: user.phoneNumber,
            },
            {
                key: 'Display name',
                value: user.displayName,
                className: `${CN}__span-2`,
                valueToCopy: user.displayName
            },
            {
                key: 'Created',
                value: this.renderValueWithExtraInfo(
                    formatToLocaleString(user.creationDate, valuePlaceholder()),
                    typeof calculatedFields.accountAgeInDays === 'number'
                        ? `${calculatedFields.accountAgeInDays} ${calculatedFields.accountAgeInDays === 1 ? 'day' : 'days'}`
                        : null,
                    'The data was calculated at the time of the transaction'
                )
            },
            {
                key: 'Email',
                value: this.renderValidatedInfo(
                    user.email,
                    calculatedFields.aggregatedEmailConfirmed,
                ),
                className: `${CN}__span-2`,
                valueToCopy: user.email,
            },
            {
                key: 'Profile name',
                value: user.profileName,
                className: `${CN}__span-2`,
                valueToCopy: user.profileName,
            },
            { key: 'Updated', value: formatToLocaleString(user.updateDate, valuePlaceholder()) },
            {
                key: 'Email provider',
                value: user.authenticationProvider,
                className: `${CN}__span-2`,
                valueToCopy: user.authenticationProvider,
            },
            { key: 'Language', value: user.language },
            { key: 'Time zone', value: user.timeZone },
            {
                key: 'First transaction',
                value: this.renderValueWithExtraInfo(
                    formatToLocaleString(calculatedFields.firstTransactionDateTime, valuePlaceholder()),
                    typeof calculatedFields.activityAgeInDays === 'number'
                        ? `${calculatedFields.activityAgeInDays} ${calculatedFields.activityAgeInDays === 1 ? 'day' : 'days'}`
                        : null,
                    'The data was calculated at the time of the transaction'
                )
            },
            {
                key: 'Email domain',
                value: this.renderValidatedInfo(
                    calculatedFields.aggregatedEmailDomain,
                    !calculatedFields.disposableEmailDomain,
                    calculatedFields.disposableEmailDomain ? 'Marked as disposable' : '',
                ),
                className: `${CN}__span-2`,
                valueToCopy: calculatedFields.aggregatedEmailDomain,
            },
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
                {this.renderMainContent()}
            </ItemDetailsTile>
        );
    }
}
