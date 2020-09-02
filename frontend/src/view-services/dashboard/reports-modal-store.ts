import { injectable } from 'inversify';
import {
    action, computed, observable
} from 'mobx';
import { Report } from '../../models/misc';

@injectable()
export class ReportsModalStore {
    @observable
    reports: Report[] = [];

    @observable
    isModalOpen = false;

    @computed
    get getReports() {
        if (this.reports.length) {
            return this.reports;
        }

        return [];
    }

    @action
    setPageReports(reports: Report[]) {
        this.reports = reports;
    }

    @action
    openModal() {
        this.isModalOpen = true;
    }

    @action.bound
    closeModal() {
        this.isModalOpen = false;
    }

    @action
    showReportsModal(reports: Report[]) {
        this.setPageReports(reports);
        this.openModal();
    }

    @action
    toggleModal(isOpen: boolean) {
        this.isModalOpen = !isOpen;
    }

    @action
    clearStore() {
        this.reports = [];
    }

    @action
    clearReportsModalStore() {
        this.reports = [];
    }
}
