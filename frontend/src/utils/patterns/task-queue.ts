// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Container } from 'inversify';
import { Logger } from '../../utility-services';

/**
 * Describes a task to be executed by the queue.
 */
export interface Task<T> {
    /**
     * Executes the task.
     * @return A promise which resolves when the task is executed successfully.
     */
    execute(logger: Logger, container: Container): Promise<T>;

    /**
     * Provides a description for the task.
     * @return A string representing the task.
     */
    toString(): string;
}

/** Manages a queue of the async tasks. */
export class TaskQueue {
    private currentExecution?: Promise<void> | null;

    private readonly queue: Task<any>[] = [];

    private readonly logger: Logger;

    private readonly taskLogger: Logger;

    constructor(
        private readonly queueName: string,
        private readonly appLogger: Logger,
        private readonly container: Container
    ) {
        this.taskLogger = appLogger;
        this.logger = appLogger.getInstance(queueName);
    }

    /**
     * Add tasks to the end of the queue.
     * @param tasks The task to append.
     */
    public enqueue(tasks: Task<any>[]) {
        this.queue.push(...tasks);
    }

    /**
     * Starts the queue execution.
     * @return A promise which resolves when the queue is successfully completed
     *    tasks execution.
     */
    public async start() {
        this.logger.debug(`Starting queue with ${this.queue.length} task(s).`);
        this.currentExecution = this.currentExecution || this.next();

        return this.currentExecution;
    }

    private async next(): Promise<void> {
        const task = this.queue.shift();

        if (!task) {
            this.currentExecution = null;
            return Promise.resolve();
        }

        try {
            this.logger.debug(`Executing task: "${task}"`);
            await task.execute(this.taskLogger, this.container);
            this.logger.debug(`Task: "${task}" succeeded.`);
            return this.next();
        } catch (error) {
            this.logger.error(`--> Task: "${task}" failed.`, error);
            this.currentExecution = null;
            throw new Error(`Queue stopped, task: "${task}" has failed.\n`
                + `Next task in queue: "${this.peek()}". `
                + `Error: ${error}`);
        }
    }

    private peek(): Task<any> | null {
        return this.queue[0] || null;
    }
}
