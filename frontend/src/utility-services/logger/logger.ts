// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface LogEntity {
    readonly data?: object;
    readonly message: string;
    readonly namespace: string;
    readonly requestId: string;
    readonly sessionId: string;
    readonly severity: string;
}

export interface Logger {
    getInstance(namespace: string): Logger;
    debug(message: string, ...data: any[]): Logger;
    error(message: string, ...data: any[]): Logger;
    info(message: string, ...data: any[]): Logger;
    trace(message: string, ...data: any[]): Logger;
    warn(message: string, ...data: any[]): Logger;
}

export enum SEVERITY {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
    TRACE = 'trace'
}
