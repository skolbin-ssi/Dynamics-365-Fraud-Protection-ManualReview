// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, observable } from 'mobx';
import { ANALYSIS_FIELDS, AnalysisFieldConfig } from '../../constants/link-analysis';

export class AnalysisField implements AnalysisFieldConfig {
    id!: ANALYSIS_FIELDS;

    displayName!: string;

    tooltipContent: string | undefined;

    @observable
    value = '';

    @observable
    count = 0;

    @observable
    isChecked = false;

    constructor(analysisFieldsConfig?: AnalysisFieldConfig) {
        if (analysisFieldsConfig) {
            const {
                id, displayName, tooltipContent
            } = analysisFieldsConfig;

            this.id = id;
            this.displayName = displayName;
            this.tooltipContent = tooltipContent;
        }
    }

    @action
    setValue(value: string) {
        this.value = value;
    }

    @action
    setCount(count: number) {
        this.count = count;
    }

    @action
    setIsChecked(checked: boolean) {
        this.isChecked = checked;
    }
}
