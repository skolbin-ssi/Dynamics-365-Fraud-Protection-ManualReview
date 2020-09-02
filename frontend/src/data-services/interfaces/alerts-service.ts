import { Alert } from '../../models';

export interface AlertsService {
    /**
     * Get list of alerts
     */
    getAlerts(): Promise<Alert[]>;

    /**
     * Create alert
     * @param alert
     */
    createAlert(alert: Alert): Promise<Alert>;

    /**
     * Update alert
     * @param alert
     */
    updateAlert(alert: Alert): Promise<Alert>;

    /**
     * Update alert
     * @param alert
     */
    deleteAlert(alert: Alert): Promise<Alert>;
}
