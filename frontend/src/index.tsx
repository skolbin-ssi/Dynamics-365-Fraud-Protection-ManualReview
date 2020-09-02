import 'typeface-roboto';
import 'reflect-metadata';
import './index.css';
import { Container } from 'inversify';
import { ConsoleLogger } from './utility-services';
import { TaskQueue } from './utils/patterns';
import {
    loadUsersTask,
    registerConfigurationTask,
    registerDataServicesTask,
    registerUtilityServicesTask,
    registerViewServicesTask,
    renderTask
} from './application-bootstrap';

const appLogger = new ConsoleLogger('DFP-MR');
const appContainer = new Container();
const appBootstrap = new TaskQueue('bootstrap', appLogger, appContainer);

/**
 * Enqueueing tasks of application bootstrap queue.
 * Order of invocation is important here,
 * since tasks are dependent on previous results
 */
appBootstrap
    .enqueue([
        registerConfigurationTask,
        registerDataServicesTask,
        registerUtilityServicesTask,
        registerViewServicesTask,
        loadUsersTask,
        renderTask
    ]);

/**
 * Starting application by executing bootstrap task queue
 */
(async function start() {
    try {
        return await appBootstrap.start();
    } catch (error) {
        appLogger.error(`Error: ${error.message}`, error);
    }

    return false;
}());
