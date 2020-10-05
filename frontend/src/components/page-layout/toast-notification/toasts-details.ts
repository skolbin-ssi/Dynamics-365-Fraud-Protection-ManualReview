import { MessageBarType } from '@fluentui/react/lib/MessageBar';
import { LABEL, TOAST_TYPE } from '../../../constants';
import { Toast, ToastSettings } from '../../../models';

export const GENERAL_TOAST_SETTINGS = new Map<TOAST_TYPE, ToastSettings>([
    [
        TOAST_TYPE.SUCCESS,
        {
            title: 'Well done!',
            type: TOAST_TYPE.SUCCESS,
            messageBarType: MessageBarType.success,
            iconName: 'Completed'
        }
    ],
    [
        TOAST_TYPE.ERROR,
        {
            title: 'Something went wrong!',
            type: TOAST_TYPE.ERROR,
            messageBarType: MessageBarType.error,
            iconName: 'ErrorBadge'
        }
    ],
]);

export const TOASTS_FOR_ITEM_LABELS = new Map<LABEL, Toast>([
    [
        LABEL.GOOD,
        {
            title: 'Good',
            type: TOAST_TYPE.GOOD,
            messageBarType: MessageBarType.success,
            iconName: 'Completed',
            message: 'The order was labeled as "Good"'
        }
    ],
    [
        LABEL.BAD,
        {
            title: 'Bad',
            type: TOAST_TYPE.BAD,
            messageBarType: MessageBarType.error,
            iconName: 'ErrorBadge',
            message: 'The order was labeled as "Bad"'
        }
    ],
    [
        LABEL.WATCH_INCONCLUSIVE,
        {
            title: 'Watch',
            type: TOAST_TYPE.WATCH,
            messageBarType: MessageBarType.success,
            iconName: 'RedEye',
            message: 'The order was labeled as "Watch"'
        }
    ],
    [
        LABEL.WATCH_NA,
        {
            title: 'Watch',
            type: TOAST_TYPE.WATCH,
            messageBarType: MessageBarType.success,
            iconName: 'RedEye',
            message: 'The order was labeled as "Watch"'
        }
    ],
    [
        LABEL.ESCALATE,
        {
            title: 'Escalate',
            type: TOAST_TYPE.ESCALATE,
            messageBarType: MessageBarType.success,
            iconName: 'FollowUser',
            message: 'The  order was escalated'
        }
    ],
    [
        LABEL.HOLD,
        {
            title: 'Hold',
            type: TOAST_TYPE.HOLD,
            messageBarType: MessageBarType.success,
            iconName: 'HourGlass',
            message: 'The  order was put on hold'
        }
    ],
]);
