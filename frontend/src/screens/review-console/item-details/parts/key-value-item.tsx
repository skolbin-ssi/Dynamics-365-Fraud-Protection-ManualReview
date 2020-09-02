import React from 'react';

export interface KeyValueItem {
    key: string;
    value: any;
    className?: string;
    contentClassName?: string;
    isPrice?: boolean;
}

export const valuePlaceholder = (CN: string) => (
    <span className={`${CN}__pl`}>N/A</span>
);
