import { Duration, parse } from 'iso8601-duration';
import { action, computed, observable } from 'mobx';
import { ALERT_METRIC_TYPE, ALERT_THRESHOLD_OPERATOR, PERIOD_DURATION_TYPE } from '../constants';
import { AlertDTO, NewAlertDTO } from '../data-services/api-services/models';

export class Alert {
    id: string = '';

    @observable
    name: string = '';

    @observable
    custom: boolean = false;

    @observable
    ownerId: string = '';

    @observable
    metricType: ALERT_METRIC_TYPE = ALERT_METRIC_TYPE.APPROVAL_RATE;

    @observable
    period: string = 'P1D';

    @observable
    thresholdOperator: ALERT_THRESHOLD_OPERATOR = ALERT_THRESHOLD_OPERATOR.GREATER_THAN;

    @observable
    thresholdValue: number = 0;

    @observable
    queues: string[] = [];

    @observable
    analysts: string[] = [];

    @observable
    active: boolean = false;

    // lastCheck: AlertCheckDTO;

    // lastNotification: AlertNotificationDTO

    @action
    setActive(active: boolean) {
        this.active = active;
    }

    fromDTO(alert: AlertDTO) {
        const {
            id,
            name,
            custom,
            ownerId,
            metricType,
            period,
            thresholdOperator,
            thresholdValue,
            queues,
            analysts,
            active
            // lastCheck,
            // lastNotification
        } = alert;

        this.id = id;
        this.name = name;
        this.custom = custom;
        this.ownerId = ownerId;
        this.metricType = metricType;
        this.period = period;
        this.thresholdOperator = thresholdOperator;
        this.thresholdValue = thresholdValue;
        this.queues = queues;
        this.analysts = analysts;
        this.active = active;

        return this;
    }

    toNewAlertDTO(): NewAlertDTO {
        return {
            name: this.name,
            metricType: this.metricType,
            period: this.period,
            thresholdOperator: this.thresholdOperator,
            thresholdValue: this.thresholdValue,
            queues: this.queues,
            analysts: this.analysts,
            active: this.active
        };
    }

    @computed
    get periodDuration(): Duration {
        try {
            return parse(this.period);
        } catch (e) {
            return {} as Duration;
        }
    }

    @computed
    get periodBiggestDuration(): number {
        return this.periodDuration[this.periodDurationType] || 0;
    }

    @computed
    get periodDurationType(): PERIOD_DURATION_TYPE {
        if (this.periodDuration.years) {
            return PERIOD_DURATION_TYPE.YEARS;
        } if (this.periodDuration.months) {
            return PERIOD_DURATION_TYPE.MONTHS;
        } if (this.periodDuration.weeks) {
            return PERIOD_DURATION_TYPE.WEEKS;
        } if (this.periodDuration.days) {
            return PERIOD_DURATION_TYPE.DAYS;
        } if (this.periodDuration.hours) {
            return PERIOD_DURATION_TYPE.HOURS;
        } if (this.periodDuration.minutes) {
            return PERIOD_DURATION_TYPE.MINUTES;
        }

        return PERIOD_DURATION_TYPE.DAYS;
    }
}
