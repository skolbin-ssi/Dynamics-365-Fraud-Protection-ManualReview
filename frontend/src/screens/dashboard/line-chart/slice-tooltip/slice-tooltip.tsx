// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './slice-tooltip.scss';

import cx from 'classnames';
/* eslint-disable react/prop-types */
import React from 'react';

import { Persona, PersonaSize } from '@fluentui/react/lib/Persona';
import { SliceTooltipProps as NivoSliceTooltipProps, Point } from '@nivo/line';

import { User } from '../../../../models/user';
import { formatDateToFullMonthDayYear } from '../../../../utils';

interface SliceTooltipProps {
    /**
     * withAvatar - if true, displays user avatars inside the tooltip
     * */
    withAvatar?: boolean

    /**
     * showSummaryRow - calculate sum of tooltip items
     */
    showSummaryRow?: boolean

    showPercentage?: boolean
}

export interface ExtendedPoint extends Point {
    data: Point['data'] & {
        name: string;
        user?: User;
        entityId: string;
    }
}

const CN = 'slice-tooltip';
const FIRST_POINT_INDEX = 0;

export const SliceTooltip: React.FC<SliceTooltipProps & NivoSliceTooltipProps> = ({
    slice, withAvatar, showSummaryRow, showPercentage
}) => {
    const dateXValue = slice.points[FIRST_POINT_INDEX]?.data.x || new Date();
    const totalCount = slice.points
        .map(datum => Number(datum.data.y))
        .reduce((prev, next) => prev + next);
    const reversedPoints = [...slice.points].reverse();

    function renderUserAvatar(value: ExtendedPoint) {
        const { user } = value.data;
        return (
            <Persona
                size={PersonaSize.size24}
                coinProps={{
                    styles: {
                        coin: {
                            padding: '2px',
                            border: `1px solid ${value.serieColor}`,
                            borderRadius: '50%'
                        }
                    }
                }}
                imageUrl={user?.imageUrl}
                imageAlt={`analyst ${user?.name}`}
            />
        );
    }

    function renderIndicator(value: ExtendedPoint) {
        if (withAvatar) {
            return renderUserAvatar(value);
        }

        return (
            <div
                className={`${CN}__color-indicator`}
                style={{
                    background: value.serieColor
                }}
            />
        );
    }

    return (
        <div className={CN}>
            <div className={`${CN}__title-row`}>
                <div>
                    <strong>{formatDateToFullMonthDayYear((dateXValue as Date))}</strong>
                </div>
                { showSummaryRow && (
                    <div>
                        {totalCount}
                        &nbsp;reviewed
                    </div>
                )}
            </div>
            {
                reversedPoints
                    .map(value => (
                        <div
                            key={value.serieId}
                            className={cx(
                                `${CN}__row`,
                                { [`${CN}__row--increased-height`]: withAvatar }
                            )}
                        >
                            <div className={`${CN}__title`}>
                                {renderIndicator(value as ExtendedPoint)}
                                <div className={`${CN}__field-name`}>{(value as ExtendedPoint).data.name || (value as ExtendedPoint).data?.entityId }</div>
                            </div>
                            <div className={`${CN}__field-value`}>
                                {value.data.y}
                                {showPercentage && '%'}
                            </div>
                        </div>
                    ))
            }
        </div>
    );
};
