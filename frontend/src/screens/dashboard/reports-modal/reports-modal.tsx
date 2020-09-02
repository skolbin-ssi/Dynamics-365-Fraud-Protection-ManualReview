import React, { Component } from 'react';
import { resolve } from 'inversify-react';
import { CSVLink } from 'react-csv';

import { Modal } from '@fluentui/react/lib/Modal';
import { IconButton } from '@fluentui/react/lib/Button';
import { DatePicker } from '@fluentui/react/lib/DatePicker';

import './report-modal.scss';
import { observer } from 'mobx-react';
import { TYPES } from '../../../types';

import ExcelIconSVG from '../../../assets/excel-icon.svg';
import { ReportsModalStore } from '../../../view-services/dashboard';
import { Report } from '../../../models/misc';

const CN = 'reports-modal';

interface ReportsModalProps {
    fromDate: Date | null;
    toDate: Date | null;
}

@observer
export class ReportsModal extends Component<ReportsModalProps, never> {
    @resolve(TYPES.REPORTS_MODAL_STORE)
    private readonly reportsModalStore!: ReportsModalStore;

    private static renderReportItem(report: Report) {
        const { name, data } = report;
        const fileName = name.toLowerCase().replace(/ /g, '-');

        return (
            <div key={name} className={`${CN}__table-item`}>
                <ExcelIconSVG />
                <div>{name}</div>
                <div>CSV</div>
                <CSVLink
                    filename={fileName}
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
                {reports.map(report => ReportsModal.renderReportItem(report))}
            </div>
        );
    }

    render() {
        const { fromDate, toDate } = this.props;
        const { isModalOpen, closeModal } = this.reportsModalStore;

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
                        <div className={`${CN}__date-pickers`}>
                            <DatePicker
                                value={fromDate || new Date()}
                                disabled
                                className={`${CN}__date-picker`}
                                placeholder="Select start date..."
                                ariaLabel="Select start date"
                            />
                            <DatePicker
                                value={toDate || new Date()}
                                disabled
                                className={`${CN}__date-picker`}
                                ariaLabel="Select end date"
                            />
                        </div>
                    </div>
                    {this.renderReportsTable()}
                </div>
            </Modal>
        );
    }
}
