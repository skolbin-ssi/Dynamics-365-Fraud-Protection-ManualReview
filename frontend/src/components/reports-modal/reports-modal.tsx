// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './report-modal.scss';

import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { CSVLink } from 'react-csv';

import { IconButton } from '@fluentui/react/lib/Button';
import { Modal } from '@fluentui/react/lib/Modal';

import ExcelIconSVG from '../../assets/excel-icon.svg';
import { Report } from '../../models/misc';
import { TYPES } from '../../types';
import { formatDateToFullMMDDYYYY, formatTodddMMMDDYYYY, getClientTimeZoneString } from '../../utils/date';
import { capitalize } from '../../utils/text';
import { ReportsModalStore } from '../../view-services';

const CN = 'reports-modal';

interface ReportsModalProps {
    fromDate: Date | null;
    toDate: Date | null;
}

@observer
export class ReportsModal extends Component<ReportsModalProps, never> {
    @resolve(TYPES.REPORTS_MODAL_STORE)
    private readonly reportsModalStore!: ReportsModalStore;

    private renderReportItem(report: Report) {
        const { fromDate, toDate } = this.props;
        const { name, data } = report;
        const selectedPeriod = `${formatDateToFullMMDDYYYY(fromDate)}-${formatDateToFullMMDDYYYY(toDate)}`;

        const fileName = `${capitalize(name)} ${selectedPeriod}`;

        return (
            <div key={name} className={`${CN}__table-item`}>
                <ExcelIconSVG />
                <div>{name}</div>
                <div>CSV</div>
                <CSVLink
                    filename={`${fileName}.csv`}
                    className={`${CN}__download-link`}
                    data={data}
                >
                    Download
                </CSVLink>
            </div>
        );
    }

    renderReportsTable() {
        const { getReports: reports } = this.reportsModalStore;

        return (
            <div className={`${CN}__reports-table`}>
                {reports.map(report => this.renderReportItem(report))}
            </div>
        );
    }

    render() {
        const { fromDate, toDate } = this.props;
        const { isModalOpen, closeModal } = this.reportsModalStore;

        const from = fromDate || new Date();
        const to = toDate || new Date();

        return (
            <Modal
                titleAriaId="Generate reports modal"
                isOpen={isModalOpen}
                onDismiss={closeModal}
                containerClassName={CN}
                onDismissed={() => this.reportsModalStore.clearStore()}
            >
                <div className={`${CN}__header`}>
                    <div className={`${CN}__header-title`}>
                        Download reports
                    </div>
                    <IconButton
                        ariaLabel="Close generate reports popup modal"
                        className={`${CN}__close-icon`}
                        iconProps={{
                            iconName: 'Cancel'
                        }}
                        onClick={closeModal}
                    />
                </div>
                <div className={`${CN}__content`}>
                    <div className={`${CN}__notification-message`}>
                        By default dashboard page settings are used for exporting. If changes are required - please adjust dashboard settings first
                    </div>
                    <div className={`${CN}__selected-period`}>
                        <div className={`${CN}__selected-period-title`}>Selected period</div>
                        <div>
                            {formatTodddMMMDDYYYY(from)}
                            {' '}
                            -
                            {' '}
                            {formatTodddMMMDDYYYY(to)}
                        </div>
                        <div>
                            {getClientTimeZoneString()}
                        </div>
                    </div>
                    {this.renderReportsTable()}
                </div>
            </Modal>
        );
    }
}
