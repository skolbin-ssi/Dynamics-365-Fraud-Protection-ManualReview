// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { injectable } from 'inversify';
import { LogEntity, Logger, SEVERITY } from './logger';

@injectable()
export class ConsoleLogger implements Logger {
    constructor(
        private readonly namespace: string,
        private readonly requestId?: string,
        private readonly sessionId?: string
    ) {}

    getInstance(namespace: string) {
        return new ConsoleLogger(`${this.namespace}.${namespace}`, this.requestId, this.sessionId);
    }

    error(message: string, ...data: any[]) {
        ConsoleLogger.logToConsole(this.buildLogEntity(SEVERITY.ERROR, message, data));
        return this;
    }

    warn(message: string, ...data: any[]) {
        ConsoleLogger.logToConsole(this.buildLogEntity(SEVERITY.WARN, message, data));
        return this;
    }

    info(message: string, ...data: any[]) {
        ConsoleLogger.logToConsole(this.buildLogEntity(SEVERITY.INFO, message, data));
        return this;
    }

    debug(message: string, ...data: any[]) {
        ConsoleLogger.logToConsole(this.buildLogEntity(SEVERITY.DEBUG, message, data));
        return this;
    }

    trace(message: string, ...data: any[]) {
        ConsoleLogger.logToConsole(this.buildLogEntity(SEVERITY.TRACE, message, data));
        return this;
    }

    /* eslint-disable no-console */
    private static logToConsole(logEntity: LogEntity) {
        switch (logEntity.severity) {
            case SEVERITY.ERROR:
                return console.error(ConsoleLogger.serialiseLogEntity(logEntity));
            case SEVERITY.WARN:
                return console.warn(ConsoleLogger.serialiseLogEntity(logEntity));
            case SEVERITY.INFO:
                return console.info(ConsoleLogger.serialiseLogEntity(logEntity));
            case SEVERITY.DEBUG:
                return console.debug(ConsoleLogger.serialiseLogEntity(logEntity));
            case SEVERITY.TRACE:
                return console.trace(ConsoleLogger.serialiseLogEntity(logEntity));
            default:
                return console.info(ConsoleLogger.serialiseLogEntity(logEntity));
        }
    }
    /* eslint-enable no-console */

    private static serialiseLogEntity(logEntity: LogEntity) {
        return `${logEntity.namespace} ${logEntity.severity} ${logEntity.message}`;
    }

    private buildLogEntity(severity: string, message: string, data?: object): LogEntity {
        return {
            data,
            message,
            severity,
            namespace: this.namespace,
            requestId: this.requestId || '',
            sessionId: this.sessionId || ''
        };
    }
}
