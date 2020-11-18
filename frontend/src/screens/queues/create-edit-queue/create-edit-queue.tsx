// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import cn from 'classnames';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';

import {
    DefaultButton,
    IconButton,
    PrimaryButton
} from '@fluentui/react/lib/Button';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { Overlay } from '@fluentui/react/lib/Overlay';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Text } from '@fluentui/react/lib/Text';

import { VerticalTab } from '../../../components/vartical-tab/vertical-tab';
import { Queue } from '../../../models';
import { TYPES } from '../../../types';
import { QueueMutationModalStore } from '../../../view-services/essence-mutation-services';

import { QUEUE_MUTATION_TYPES, QUEUE_MANAGEMENT, CreateQueueModalTabs } from '../../../constants';

import { GeneralTab } from './general-tab/general-tab';
import { FiltersTab } from './filters-tab/filters-tab';
import { AssignTab } from './assign-tab/assign-tab';
import { DeleteTab } from './delete-tab/delete-tab';
import { CurrentUserStore } from '../../../view-services';

import './create-edit-queue.scss';

interface CreateEditQueueModalProps {
    closeCreateEditQueueModal: () => void;
    mutationType: QUEUE_MUTATION_TYPES;
    queue: Queue | null;
    initialTab?: CreateQueueModalTabs;
}

interface CreateEditQueueModalOwnState {
    activeTab: CreateQueueModalTabs;
}

const CN = 'create-edit-queue';

@observer
export class CreateEditQueueModal extends Component<CreateEditQueueModalProps, CreateEditQueueModalOwnState> {
    @resolve(TYPES.QUEUE_MUTATION_MODAL_STORE)
    private queueCreationModalStore!: QueueMutationModalStore;

    @resolve(TYPES.CURRENT_USER_STORE)
    private userStore!: CurrentUserStore;

    constructor(props: CreateEditQueueModalProps) {
        super(props);
        this.state = {
            activeTab: 'general'
        };
    }

    componentDidMount() {
        const { mutationType, queue, initialTab } = this.props;
        this.queueCreationModalStore.queueMutationStore.setMutationType(mutationType);
        if (mutationType === QUEUE_MUTATION_TYPES.UPDATE) {
            this.queueCreationModalStore.queueMutationStore.setCurrentValue(queue as Queue);
        }
        this.queueCreationModalStore.queueMutationStore.getUsersIfNecessary();
        if (initialTab) {
            this.setState({ activeTab: initialTab });
        }
    }

    @autobind
    setActiveTab(newValue: CreateQueueModalTabs) {
        this.setState({ activeTab: newValue });
    }

    @autobind
    handleClose() {
        const { closeCreateEditQueueModal } = this.props;
        closeCreateEditQueueModal();
    }

    @autobind
    async handleCreateEditQueueClick() {
        const { queueMutationStore } = this.queueCreationModalStore;
        const result = await queueMutationStore.performMutation();

        if (result === 'success') {
            setTimeout(() => this.handleClose(), 500);
        }
        if (result === 'failure') {
            this.handleClose();
        }
    }

    @autobind
    async handleDeleteQueueClick() {
        const { queueMutationStore } = this.queueCreationModalStore;
        const result = await queueMutationStore.performDeletion();

        if (result === 'success') {
            setTimeout(() => this.handleClose(), 500);
        }
        if (result === 'failure') {
            this.handleClose();
        }
    }

    renderLoadingNecessaryData() {
        return (
            <Overlay className={`${CN}__translucent-overlay`}>
                <div className={cn(`${CN}__info-badge`, `${CN}__info-badge-red`)}>
                    <Spinner label="Loading necessary data..." />
                </div>
            </Overlay>
        );
    }

    renderProcessing() {
        const { queueMutationStore } = this.queueCreationModalStore;
        const { mutationType } = queueMutationStore;
        let label = '';
        switch (mutationType) {
            case QUEUE_MUTATION_TYPES.CREATE:
                label = 'Creating a queue...';
                break;
            case QUEUE_MUTATION_TYPES.UPDATE:
                label = 'Updating...';
                break;
            case QUEUE_MUTATION_TYPES.DELETE:
                label = 'Performing deletion...';
                break;
            default:
                break;
        }
        return (
            <Overlay className={`${CN}__translucent-overlay`}>
                <div className={cn(`${CN}__info-badge`, `${CN}__info-badge-red`)}>
                    <Spinner label={label} />
                </div>
            </Overlay>
        );
    }

    @autobind
    renderErrorState(error: Error) {
        return (
            <Overlay className={`${CN}__translucent-overlay`}>
                <div className={cn(`${CN}__info-badge`, `${CN}__info-badge-red`)}>
                    <FontIcon iconName="AlertSolid" className={`${CN}__info-badge-icon`} />
                    <Text variant="large">{`${error.name}: ${error.message}`}</Text>
                </div>
            </Overlay>
        );
    }

    @autobind
    renderSuccess() {
        return (
            <Overlay className={`${CN}__translucent-overlay`}>
                <div className={cn(`${CN}__info-badge`, `${CN}__info-badge-green`)}>
                    <FontIcon iconName="CheckMark" className={`${CN}__info-badge-icon`} />
                    <Text variant="large">Success</Text>
                </div>
            </Overlay>
        );
    }

    @autobind
    renderLeftPart() {
        const { queueMutationStore } = this.queueCreationModalStore;
        const { isResidual, forEscalation } = queueMutationStore;
        const canDelete = this.userStore.checkUserCan(QUEUE_MANAGEMENT.DELETE_QUEUE);
        const { mutationType } = this.props;
        const { activeTab } = this.state;
        const isEditModal = mutationType === QUEUE_MUTATION_TYPES.UPDATE;
        const showDeleteTab = isEditModal && !isResidual && canDelete && !forEscalation;
        return (
            <div className={`${CN}__left-part`}>
                <div className={`${CN}__left-part-title`}>
                    <Text
                        variant="large"
                        className={`${CN}__part-title-text`}
                    >
                        Settings
                    </Text>
                </div>
                <div className={`${CN}__left-tabs`}>
                    <VerticalTab
                        name="General"
                        icon="Settings"
                        tabKey="general"
                        isActive={activeTab === 'general'}
                        onClick={() => this.setActiveTab('general')}
                    />
                    <VerticalTab
                        name="Filter orders"
                        icon="Filter"
                        tabKey="filter"
                        isActive={activeTab === 'filter'}
                        onClick={() => this.setActiveTab('filter')}
                    />
                    <VerticalTab
                        name="Assign people"
                        icon="RecruitmentManagement"
                        tabKey="assign"
                        isActive={activeTab === 'assign'}
                        onClick={() => this.setActiveTab('assign')}
                    />
                    {
                        showDeleteTab && (
                            <VerticalTab
                                name="Delete queue"
                                icon="Delete"
                                tabKey="delete"
                                isActive={activeTab === 'delete'}
                                onClick={() => this.setActiveTab('delete')}
                                className={`${CN}__delete-tab`}
                            />
                        )
                    }
                </div>
            </div>
        );
    }

    @autobind
    renderRightPart() {
        const { mutationType } = this.props;
        const { activeTab } = this.state;
        const { queueMutationStore } = this.queueCreationModalStore;
        const { isValid } = queueMutationStore;

        const isCreateModal = mutationType === QUEUE_MUTATION_TYPES.CREATE;

        let tabToRender: JSX.Element;
        let primaryBtnText = isCreateModal ? 'Next' : 'Update';
        let primaryBtnAction: () => void | Promise<void> = this.handleCreateEditQueueClick;
        let isPrimaryBtnDisabled = isCreateModal ? false : !isValid;

        switch (activeTab) {
            case 'general':
                tabToRender = <GeneralTab queueMutationModalStoreInstance={this.queueCreationModalStore} />;
                if (isCreateModal) {
                    primaryBtnAction = () => this.setActiveTab('filter');
                }
                break;
            case 'filter':
                tabToRender = <FiltersTab queueMutationModalStoreInstance={this.queueCreationModalStore} />;
                if (isCreateModal) {
                    primaryBtnAction = () => this.setActiveTab('assign');
                }
                break;
            case 'assign':
                tabToRender = <AssignTab queueMutationModalStoreInstance={this.queueCreationModalStore} />;
                if (isCreateModal) {
                    primaryBtnText = 'Create';
                    isPrimaryBtnDisabled = !isValid;
                }
                break;
            case 'delete':
                tabToRender = <DeleteTab queueMutationModalStoreInstance={this.queueCreationModalStore} />;
                primaryBtnText = 'Delete';
                isPrimaryBtnDisabled = false;
                primaryBtnAction = () => this.handleDeleteQueueClick();
                break;
            default:
                tabToRender = <></>;
        }

        return (
            <div className={`${CN}__right-part`}>
                <div className={`${CN}__right-part-title`}>
                    <Text
                        variant="large"
                        className={`${CN}__part-title-text`}
                    >
                        {
                            isCreateModal
                                ? 'Create a new queue'
                                : `${activeTab === 'delete' ? 'Delete' : 'Edit'} queue`
                        }
                    </Text>
                    <IconButton
                        iconProps={{ iconName: 'Cancel' }}
                        onClick={this.handleClose}
                        className={`${CN}__close-btn`}
                    />
                </div>
                <div className={`${CN}__right-part-body`}>
                    { tabToRender }
                </div>
                <div className={`${CN}__bottom-btns`}>
                    <PrimaryButton
                        className={cn({ [`${CN}__delete-btn`]: activeTab === 'delete' })}
                        text={primaryBtnText}
                        onClick={primaryBtnAction}
                        allowDisabledFocus
                        disabled={isPrimaryBtnDisabled}
                    />
                    <DefaultButton
                        text="Cancel"
                        onClick={this.handleClose}
                        allowDisabledFocus
                    />
                </div>
            </div>
        );
    }

    render() {
        const { queueMutationStore } = this.queueCreationModalStore;
        const { overlayType, error } = queueMutationStore;

        let overlay: JSX.Element | null = null;

        switch (overlayType) {
            case 'loadingData': {
                overlay = this.renderLoadingNecessaryData();
                break;
            }
            case 'success': {
                overlay = this.renderSuccess();
                break;
            }
            case 'failure': {
                overlay = this.renderErrorState(error as Error);
                break;
            }
            case 'ongoing': {
                overlay = this.renderProcessing();
                break;
            }
            default:
                break;
        }

        return (
            <div className={CN}>
                { this.renderLeftPart() }
                { this.renderRightPart() }
                { overlay }
            </div>
        );
    }
}
