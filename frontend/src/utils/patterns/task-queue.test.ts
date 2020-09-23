// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Container } from 'inversify';
import { Task, TaskQueue } from './task-queue';

/** TODO: Move to global testing helpers */
const LogMock = {
    getInstance: () => LogMock,
    debug: () => LogMock,
    error: () => LogMock,
    info: () => LogMock,
    trace: () => LogMock,
    warn: () => LogMock
};

describe('patterns.taskQueue', () => {
    let successTaskOne: Task<boolean>;
    let successTaskTwo: Task<boolean>;
    let failureTask: Task<boolean>;
    let queue: TaskQueue;
    const error = new Error('Failed task');

    beforeEach(() => {
        successTaskOne = {
            execute: jest.fn<Promise<boolean>, any>(() => Promise.resolve(true)),
            toString: () => 'successTaskOne'
        };

        successTaskTwo = {
            execute: jest.fn<Promise<boolean>, any>(() => Promise.resolve(true)),
            toString: () => 'successTaskTwo'
        };

        failureTask = {
            execute: jest.fn<Promise<boolean>, any>(() => {
                throw error;
            }),
            toString: () => 'failureTask'
        };

        queue = new TaskQueue('test', LogMock, new Container());
    });

    it('implements desired API', () => {
        expect(queue).toBeDefined();
        expect(queue.enqueue).toBeDefined();
        expect(typeof queue.enqueue).toEqual('function');
        expect(queue.start).toBeDefined();
        expect(typeof queue.start).toEqual('function');
    });

    it('enqueue tasks', async () => {
        queue
            .enqueue([
                successTaskOne,
                successTaskTwo
            ]);

        await queue.start();

        expect(successTaskOne.execute).toHaveBeenCalledTimes(1);
        expect(successTaskOne.execute).toHaveBeenCalledTimes(1);
    });

    it('fails task if previous failed', async () => {
        queue
            .enqueue([
                successTaskOne,
                failureTask,
                successTaskTwo
            ]);

        try {
            await queue.start();
        } catch (e) {
            expect(e.message).toContain(error.message);
        }

        expect(successTaskOne.execute).toHaveBeenCalled();
        expect(failureTask.execute).toHaveBeenCalled();
        expect(successTaskTwo.execute).not.toHaveBeenCalled();

        queue.start();
        expect(successTaskTwo.execute).toHaveBeenCalled();
    });
});
