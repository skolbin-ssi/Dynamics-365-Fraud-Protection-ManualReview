import React, { Component } from 'react';

import { DefaultButton } from '@fluentui/react/lib/Button';

import { CSVLink } from 'react-csv';
import { observer } from 'mobx-react';
import { Data } from 'react-csv/components/CommonPropTypes';

interface CSVDownloadButtonProps {
    csvData: string | Data;
    fileName: string
}

@observer
export class CSVDownloadButton extends Component<CSVDownloadButtonProps, never> {
    render() {
        const {
            csvData,
            fileName
        } = this.props;

        return csvData?.length > 0
        && (
            <CSVLink
                filename={`${fileName}.csv`}
                data={csvData}
            >
                <DefaultButton
                    text="Download"
                    iconProps={{ iconName: 'DownloadDocument' }}
                />
            </CSVLink>
        );
    }
}
