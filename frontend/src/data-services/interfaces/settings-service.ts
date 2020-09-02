import { SETTING_TYPE } from '../../constants';
import { Setting } from '../../models';

export interface SettingsService {
    /**
     * Get settings by type
     * @param type
     */
    getSettings(type: SETTING_TYPE): Promise<Setting[]>
}
