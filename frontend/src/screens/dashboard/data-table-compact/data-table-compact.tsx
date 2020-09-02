import React, { Component } from 'react';
import autoBind from 'autobind-decorator';
import { observer } from 'mobx-react';
import cx from 'classnames';

import { Text } from '@fluentui/react/lib/Text';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { DetailsListLayoutMode, IColumn, SelectionMode, } from '@fluentui/react/lib/DetailsList';
import { Persona, PersonaSize, IPersonaProps } from '@fluentui/react/lib/Persona';
import { ShimmeredDetailsList } from '@fluentui/react/lib/ShimmeredDetailsList';

import { AnalystPerformance, BasicEntityPerformance } from '../../../models/dashboard';
import { DEFAULT_DATA_LIST_SHIMMER_LINES_NUMBER } from '../../../constants';

import { User } from '../../../models/user';
import './data-table-compact.scss';

const CN = 'data-table-compact';

interface DataGridListProps<T> {
    layoutMode?: DetailsListLayoutMode,
    isAnalystTable?: boolean;
    className?: string;
    isLoading: boolean;
    hideArrow?: boolean
    data: T[] | null;
    onRowClick?(selectedItem: any): void;
    onRowSelection(queueId: string, checked?: boolean): void
}

@observer
export class DataTableCompact<T extends BasicEntityPerformance> extends Component<DataGridListProps<T>, never> {
    private readonly columns: IColumn[] = [
        {
            // eslint-disable-next-line react/destructuring-assignment
            key: this.props.isAnalystTable ? 'analyst' : ' queue',
            // eslint-disable-next-line react/destructuring-assignment
            name: this.props.isAnalystTable ? 'Analyst' : 'Queue',
            minWidth: 50,
            maxWidth: 250,
            onRender: this.renderFirstColumn,
        },
        {
            key: 'reviewed',
            name: 'Reviewed',
            minWidth: 50,
            maxWidth: 120,
            className: `${CN}__right-aligned-cell ${CN}__sorting-arrow`,
            onRender: ({ total }: T) => (
                <div className={`${CN}__content-row`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {total.reviewed}
                    </Text>
                </div>
            ),
        },
        {
            key: 'approved',
            name: 'Approved',
            minWidth: 50,
            maxWidth: 120,
            className: `${CN}__right-aligned-cell`,
            onRender: (queue: T) => (
                <div className={`${CN}__content-row`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {queue.total.approved}
                    </Text>
                    <div className={cx(`${CN}__cell-label`, `${CN}__cell-label--approved`)}>
                        <span>
                            {queue.approvedRatio}
                            %
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'watched',
            name: 'Watched',
            minWidth: 50,
            maxWidth: 120,
            className: `${CN}__right-aligned-cell`,
            onRender: (queue: T) => (
                <div className={`${CN}__content-row`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {queue.total.watched}
                    </Text>
                    <div className={cx(`${CN}__cell-label`, `${CN}__cell-label--watched`)}>
                        <span>
                            {queue.watchedRatio}
                            %
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'rejected',
            name: 'Rejected',
            minWidth: 50,
            maxWidth: 120,
            className: `${CN}__right-aligned-cell`,
            onRender: (queue: T) => (
                <div className={`${CN}__content-row`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {queue.total.rejected}
                    </Text>
                    <div className={cx(`${CN}__cell-label`, `${CN}__cell-label--rejected`)}>
                        <span>
                            {queue.rejectedRatio}
                            %
                        </span>
                    </div>
                </div>
            ),
        }
    ];

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
                            className={`${CN}__first-column-content`}
                        >
                            <Text
                                role="button"
                                variant="medium"
                                onClick={onRowClick ? () => onRowClick(entity) : undefined}
                                className={cx(
                                    `${CN}__score-cell`,
                                    { [`${CN}__clickable-row`]: !!onRowClick }
                                )}
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
