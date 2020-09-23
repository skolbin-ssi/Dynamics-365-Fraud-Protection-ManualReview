// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { FC, useEffect, useRef } from 'react';
import cn from 'classnames';

import './range-slider.scss';

export interface RangeSliderProps {
    className?: string;
    currentMin: number;
    currentMax: number;
    overallMin: number;
    overallMax: number;
    onMinValueChanged: (newValue: number) => void;
    onMaxValueChanged: (newValue: number) => void;
    disabled?: boolean;
}

const CN = 'range-slider';

export const RangeSlider: FC<RangeSliderProps> = (props: RangeSliderProps) => {
    /**
     * room for improvements:
     *  - add an opportunity to use "steps"
     *  - debounce outer state updates
     */

    const {
        className,
        currentMin,
        currentMax,
        overallMin,
        overallMax,
        onMinValueChanged,
        onMaxValueChanged,
        disabled = false
    } = props;

    const rangeRef = useRef() as React.MutableRefObject<HTMLDivElement>;
    const thumbLeftRef = useRef() as React.MutableRefObject<HTMLDivElement>;
    const thumbRightRef = useRef() as React.MutableRefObject<HTMLDivElement>;

    const setMinInputValue = (value: number) => {
        const percent = ((value - overallMin) / (overallMax - overallMin)) * 100;
        thumbLeftRef.current.style.left = `${percent}%`;
        rangeRef.current.style.left = `${percent}%`;
    };

    const onMinInput = (event: React.FormEvent<HTMLInputElement>) => {
        const value = parseInt((event.target as HTMLInputElement).value, 10);
        setMinInputValue(value);
        onMinValueChanged(value);
    };

    const setMaxInputValue = (value: number) => {
        const percent = ((value - overallMin) / (overallMax - overallMin)) * 100;
        thumbRightRef.current.style.right = `${100 - percent}%`;
        rangeRef.current.style.right = `${100 - percent}%`;
    };

    const onMaxInput = (event: React.FormEvent<HTMLInputElement>) => {
        const value = parseInt((event.target as HTMLInputElement).value, 10);
        setMaxInputValue(value);
        onMaxValueChanged(value);
    };

    useEffect(() => {
        setMinInputValue(currentMin);
        setMaxInputValue(currentMax);
    }, [currentMin, currentMax]);

    return (
        <div className={cn(className, CN)}>
            <input
                type="range"
                min={overallMin}
                max={overallMax}
                value={currentMin}
                onInput={onMinInput}
                onChange={() => null}
                disabled={disabled}
                className={`${CN}__hidden-range`}
            />
            <input
                type="range"
                min={overallMin}
                max={overallMax}
                value={currentMax}
                onInput={onMaxInput}
                onChange={() => null}
                disabled={disabled}
                className={`${CN}__hidden-range`}
            />

            <div className={cn(`${CN}__slider`, { disabled })}>
                <div className={cn(`${CN}__track`, { disabled })} />
                <div className={cn(`${CN}__range`, { disabled })} ref={rangeRef} />
                <div className={cn(`${CN}__thumb-left`, { disabled })} ref={thumbLeftRef} />
                <div className={cn(`${CN}__thumb-right`, { disabled })} ref={thumbRightRef} />
            </div>
        </div>
    );
};
