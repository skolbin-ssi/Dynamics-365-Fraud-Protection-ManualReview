// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';

export interface KeyValueItem {
    key: string;
    value: any;
    className?: string;
    contentClassName?: string;
    isPrice?: boolean;
    valueToCopy?: string;
}

export const valuePlaceholder = () => (
    <span className="placeholder">N/A</span>
);
