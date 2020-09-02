import { History } from 'history';
import { Container } from 'inversify';
import React from 'react';
import ReactDOM from 'react-dom';
import { initializeIcons } from '@uifabric/icons';
import { App } from '../app';
import { TYPES } from '../types';
import { Logger } from '../utility-services';

export const renderTask = {
    execute: async (logger: Logger, container: Container) => {
        initializeIcons();

        const history = container.get<History>(TYPES.HISTORY);

        ReactDOM.render(
            <App
                container={container}
                history={history}
            />,
            document.getElementById('root')
        );

        return true;
    },

    toString: () => 'renderTask'
};
