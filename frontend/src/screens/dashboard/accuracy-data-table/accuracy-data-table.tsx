import React, { Component } from 'react';
import autoBind from 'autobind-decorator';
import { observer } from 'mobx-react';
import cx from 'classnames';

import { Text } from '@fluentui/react/lib/Text';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import {
    DetailsListLayoutMode, IColumn, SelectionMode
} from '@fluentui/react/lib/DetailsList';
import { Persona, PersonaSize, IPersonaProps } from '@fluentui/react/lib/Persona';
import { ShimmeredDetailsList } from '@fluentui/react/lib/ShimmeredDetailsList';

import { AnalystPerformance, BasicEntityPerformance } from '../../../models/dashboard';
import { DEFAULT_DATA_LIST_SHIMMER_LINES_NUMBER } from '../../../constants';

import './accuracy-data-table.scss';
import { User } from '../../../models/user';

const CN = 'accuracy-data-table';

interface DataGridListProps<T> {
    isAnalystTable?: boolean;
    className?: string;
    isLoading: boolean;
    data: T[] | null;
    onRowClick?(selectedItem: any): void;
    onRowSelection(queueId: string, checked?: boolean): void
}

@observer
export class AccuracyDataTable<T extends BasicEntityPerformance> extends Component<DataGridListProps<T>, never> {
    private readonly columns: IColumn[] = [
        {
            // eslint-disable-next-line react/destructuring-assignment
            key: this.props.isAnalystTable ? 'analyst' : ' queue',
            // eslint-disable-next-line react/destructuring-assignment
            name: this.props.isAnalystTable ? 'Analyst' : 'Queue',
            minWidth: 50,
            maxWidth: 470,
            onRender: this.renderFirstColumn,

        },
        {
            key: 'approve-applied',
            name: 'Approve applied',
            minWidth: 50,
            maxWidth: 90,
            className: `${CN}__right-aligned-cell`,
            onRender: ({ approvedApplied }) => (
                <div className={`${CN}__content-row`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {approvedApplied}
                    </Text>
                </div>
            ),
        },
        {
            key: 'approved-overturned',
            name: 'Approved overturned',
            minWidth: 50,
            maxWidth: 120,
            className: `${CN}__right-aligned-cell`,
            onRender: ({ approvedOverturned }) => (
                <div className={`${CN}__content-row`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {approvedOverturned}
                    </Text>
                </div>
            ),
        },
        {
            key: 'approve-accuracy',
            name: 'Approve accuracy',
            minWidth: 50,
            maxWidth: 90,
            className: `${CN}__right-aligned-cell`,
            onRender: ({ approvedAccuracy }) => (
                <div className={`${CN}__content-row`}>
                    <Text
                        variant="medium"
                        className={cx(
                            `${CN}__score-cell`,
                            this.getColorClassName(approvedAccuracy)
                        )}
                    >
                        {approvedAccuracy}
                        %
                    </Text>
                </div>
            ),
        },
        {
            key: 'rejected-applied',
            name: 'Rejected applied',
            minWidth: 50,
            maxWidth: 90,
            className: `${CN}__right-aligned-cell`,
            onRender: ({ rejectedApplied }) => (
                <div className={`${CN}__content-row`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {rejectedApplied}
                    </Text>
                </div>
            ),
        }, {
            key: 'rejected-overturned',
            name: 'Rejected overturned',
            minWidth: 50,
            maxWidth: 120,
            className: `${CN}__right-aligned-cell`,
            onRender: ({ rejectedOverturned }) => (
                <div className={`${CN}__content-row`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {rejectedOverturned}
                    </Text>
                </div>
            ),
        }, {
            key: 'rejected-accuracy',
            name: 'Rejected accuracy',
            minWidth: 50,
            maxWidth: 90,
            className: `${CN}__right-aligned-cell`,
            onRender: ({ rejectedAccuracy }) => (
                <div className={`${CN}__content-row`}>
                    <Text
                        variant="medium"
                        className={
                            cx(`${CN}__score-cell`,
                                this.getColorClassName(rejectedAccuracy))
                        }
                    >
                        {rejectedAccuracy}
                        %
                    </Text>
                </div>
            ),
        }, {
            key: 'accuracy-average-rate',
            name: 'Accuracy average rate',
            minWidth: 100,
            maxWidth: 100,
            className: `${CN}__right-aligned-cell ${CN}__accuracy-sorting-arrow`,
            onRender: ({ accuracyAverage }) => (
                <div className={`${CN}__content-row`}>
                    <Text
                        variant="medium"
                        className={cx(
                            `${CN}__score-cell`,
                            `${CN}__approve-column-text`,
                            this.getColorClassName(accuracyAverage)
                        )}
                    >
                        {accuracyAverage}
                        %
                    </Text>
                </div>
            ),
        },

    ];

    getColorClassName(score: number) {
        if (score <= 50) {
            return `${CN}__score-cell--low`;
        }

        if (score > 50 && score <= 80) {
            return `${CN}__score-cell--medium-low`;
        }

        if (score > 80 && score <= 90) {
            return `${CN}__score-cell--medium-high`;
        }

        if (score > 90) {
            return `${CN}__score-cell--high`;
        }

        return '';
    }

    renderUserRow(user: User | null) {
        if (user) {
            return (
                <Persona
                    showSecondaryText={!!(user.asPersona as IPersonaProps).secondaryText}
                    text={user.name}
                    secondaryText={(user.asPersona as IPersonaProps).secondaryText}
                    size={PersonaSize.size28}
                    className={`${CN}__analyst`}
                    imageUrl={user.imageUrl}
                    imageAlt={`analyst ${user.name}`}
                />
            );
        }

        return null;
    }

    @autoBind
    renderFirstColumn(entity: BasicEntityPerformance) {
        const { onRowSelection, onRowClick, isAnalystTable } = this.props;

        const checkBoxStyles = {
            checkbox: {
                borderColor: `${entity.color} !important`,
            },
            checkmark: {
                color: 'white',
                backgroundColor: entity.color,
            }
        };

        return (
            <div className={`${CN}__content-row`}>
                <Checkbox
                    checked={entity.isChecked}
                    className={`${CN}__checkbox`}
                    onChange={(event, checked) => (onRowSelection(entity.id, checked))}
                    styles={checkBoxStyles}
                />

                {isAnalystTable
                    ? this.renderUserRow((entity as AnalystPerformance).analyst)
                    : (
                        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
                        <div
                            role="button"
                            tabIndex={-1}
                            className={`${CN}__first-column-content`}
                            onClick={onRowClick ? () => onRowClick(entity) : undefined}
                        >
                            <Text
                                variant="medium"
                                className={`${CN}__score-cell`}
                            >
                                {entity.name}
                            </Text>
                        </div>
                    )}
            </div>
        );
    }

    render() {
        const {
            data, isLoading, className
        } = this.props;

        return (
            <div className={cx(CN, className)}>
                <ShimmeredDetailsList
                    enableShimmer={isLoading}
                    layoutMode={DetailsListLayoutMode.justified}
                    className={CN}
                    selectionMode={SelectionMode.none}
                    columns={this.columns}
                    items={data || []}
                    shimmerLines={DEFAULT_DATA_LIST_SHIMMER_LINES_NUMBER}
                />
            </div>
        );
    }
}
