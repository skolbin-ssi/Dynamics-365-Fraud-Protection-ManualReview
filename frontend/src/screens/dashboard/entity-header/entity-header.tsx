// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { DefaultButton } from '@fluentui/react/lib/Button';
import { Persona, PersonaSize } from '@fluentui/react/lib/Persona';
import { AnalystPerformanceStore } from '../../../view-services/dashboard/analyst-performance-store';

import './entity-header.scss';

const CN = 'entity-header';

interface EntityHeaderComponentProps {
    handleGenerateReportsButtonClick(): void
    analystPerformanceStore: AnalystPerformanceStore;
}

@observer
export class EntityHeader extends Component<EntityHeaderComponentProps, never> {
    renderAnalystPersona() {
        const { analystPerformanceStore } = this.props;
        const { analystAsPersona } = analystPerformanceStore;

        if (analystAsPersona) {
            const { text, secondaryText, imageUrl } = analystAsPersona;

            return (
                <>
                    <Persona imageUrl={imageUrl} text={text} size={PersonaSize.size32} className={`${CN}__persona`} />
                    <div className={`${CN}__persona-email`}>{secondaryText}</div>
                </>
            );
        }

        return null;
    }

    render() {
        const { handleGenerateReportsButtonClick } = this.props;
        return (
            <div className={`${CN}__header`}>
                <div className={`${CN}__sub-header `}>
                    <span className={`${CN}__header-title`}>Fraud analyst: </span>
                    {this.renderAnalystPersona()}
                </div>
                <DefaultButton text="Generate reports" onClick={handleGenerateReportsButtonClick} />
            </div>
        );
    }
}
