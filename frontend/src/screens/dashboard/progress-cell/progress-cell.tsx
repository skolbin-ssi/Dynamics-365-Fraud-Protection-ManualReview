// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import cx from 'classnames';
import autoBind from 'autobind-decorator';

import { CurrentProgress } from '../../../models/dashboard/progress-performance-metric';
import ArrowUpGreen from '../../../assets/icon/arrows/arrow-up-top-right-green.svg';
import ArrowUpRed from '../../../assets/icon/arrows/arrow-up-top-right-red.svg';

import './progress-cell.scss';

interface ProgressCellProps {
    className?: string;
    cellsViewMap: Map<string, CurrentProgress>
}

const CN = 'progress-cell';

export class ProgressCell extends React.Component<ProgressCellProps, never> {
    @autoBind
    renderCells() {
        const { cellsViewMap, className } = this.props;

        const renderArrow = (progress: number) => {
            if (progress === 0) {
                return null;
            }

            return (
                <div className={`${CN}__percent-arrow`}>
                    {progress > 0 ? <ArrowUpGreen /> : <ArrowUpRed />}
                </div>
            );
        };

        return Array.from(cellsViewMap).map(([cellTitle, metric]) => (
            <div key={cellTitle} className={cx(`${CN}__decision-cell`, className)}>
                <div className={`${CN}__progress-item-title`}>{cellTitle}</div>
                <span className={`${CN}__progress-number`}>
                    <span>{metric.current}</span>
                    {metric.progress !== undefined && (
                        <div className={cx(
                            `${CN}__progress-percents`,
                            { [`${CN}__progress-percents--red`]: metric.progress < 0 },
                            { [`${CN}__progress-percents--green`]: metric.progress > 0 }
                        )}
                        >
                            { renderArrow(metric.progress) }
                            <div>{metric.progress}</div>
                            %
                        </div>
                    )}
                </span>

            </div>
        ));
    }

    render() {
        return this.renderCells();
    }
}
