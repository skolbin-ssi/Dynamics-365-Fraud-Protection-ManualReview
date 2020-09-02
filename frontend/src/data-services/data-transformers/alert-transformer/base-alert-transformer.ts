import { Alert } from '../../../models';
import { AlertDTO } from '../../api-services/models';
import { BaseTransformer } from '../base-transformer';

export class BaseAlertTransformer extends BaseTransformer {
    protected mapSingleAlert(alert: AlertDTO) {
        const alertModel = new Alert();

        return alertModel.fromDTO(alert);
    }
}
