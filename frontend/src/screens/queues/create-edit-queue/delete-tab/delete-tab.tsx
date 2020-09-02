import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Text } from '@fluentui/react/lib/Text';
import { QueueMutationModalStore } from '../../../../view-services/essence-mutation-services';

import './delete-tab.scss';

interface DeleteTabProps {
    queueMutationModalStoreInstance: QueueMutationModalStore;
}

const CN = 'delete-tab';

@observer
export class DeleteTab extends Component<DeleteTabProps, never> {
    render() {
        const { queueMutationModalStoreInstance } = this.props;
        const { name } = queueMutationModalStoreInstance.queueMutationStore.fields;
        return (
            <div className={CN}>
                <Text>
                    Are you sure you want to delete
                    &nbsp;
                    <strong>{ name }</strong>
                    ?
                </Text>
                <br />
                <br />
                <Text>Orders from this queue might be available in other queues, if they match their filters, or in the Residual Queue.</Text>
            </div>
        );
    }
}
