import { IconButton } from '@fluentui/react/lib/Button';
import { Text } from '@fluentui/react/lib/Text';
import cn from 'classnames';
import autobind from 'autobind-decorator';
import React, { Component } from 'react';
import { Item } from '../../../../models/item';
import './fraud-score-indication.scss';
import { stringToKebabCase } from '../../../../utils/text';

const CN = 'fraud-score-indication';

interface FraudScoreIndicationProps {
    item: Item;
    className?: string;
}

interface FraudScoreIndicationState {
    expanded: boolean;
}

export class FraudScoreIndication extends Component<FraudScoreIndicationProps, FraudScoreIndicationState> {
    constructor(props: FraudScoreIndicationProps) {
        super(props);

        this.state = {
            expanded: false
        };
    }

    @autobind
    toggle() {
        const { expanded } = this.state;

        this.setState({ expanded: !expanded });
    }

    renderListOfCodes(codes: string[]) {
        const list = codes.map(code => (<li key={stringToKebabCase(code)}>{code}</li>));

        return (
            <ul>
                {list}
            </ul>
        );
    }

    render() {
        const { item, className } = this.props;
        const { expanded } = this.state;

        if (!item.decision) {
            return null;
        }

        const { riskScore, humanReadableCodes } = item.decision;

        const fraudScoreDeg = Math.min(180, Math.abs(180 - (180 / 1000) * (1000 - (riskScore || 0))));
        const factorsAmount = humanReadableCodes.length;

        return (
            <div className={cn(className, CN, expanded && `${CN}--expanded`)}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                <div
                    className={`${CN}__top`}
                    role="button"
                    tabIndex={0}
                    onClick={this.toggle}
                >
                    <div className={`${CN}-value-indicator`}>
                        <div className={`${CN}-value-indicator-bg`} />
                        <div
                            className={`${CN}-value-indicator-value`}
                            style={{ transform: `rotate(${fraudScoreDeg}deg)` }}
                        />
                        <Text
                            className={`${CN}-value-indicator-score`}
                            variant="medium"
                        >
                            {riskScore}
                        </Text>
                    </div>
                    <Text className={`${CN}-title`} variant="medium">Risk score</Text>
                    <Text className={`${CN}-score-factors`} variant="medium">
                        {factorsAmount}
                        &nbsp;Score factors
                    </Text>
                    { !!factorsAmount && (
                        <IconButton
                            className={`${CN}-expand`}
                            iconProps={{
                                iconName: expanded ? 'ChevronUp' : 'ChevronDown'
                            }}
                            onClick={this.toggle}
                        />
                    )}
                </div>

                <div className={cn(`${CN}-list-score-factors`, expanded && `${CN}-list-score-factors--expanded`)}>
                    {this.renderListOfCodes(humanReadableCodes)}
                </div>
            </div>
        );
    }
}
