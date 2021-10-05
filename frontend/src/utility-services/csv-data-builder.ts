import { Item, ITEM_STATUS } from '../models/item/item';
import { LinkAnalysisDfpItem } from '../models/item/link-analysis/link-analysis-dfp-item';
import { LinkAnalysisMrItem } from '../models/item/link-analysis/link-analysis-mr-item';
import { Note } from '../models/item/note';
import { User } from '../models/user/user';
import { ItemsLoadable } from '../view-services/misc/items-loadable';
import { QueueStore } from '../view-services/queues/queue-store';

export interface CSVData {
    fraudScore?: number,
    purchaseId?: string,
    originalOrderId?: string,
    queues?: string,
    timeLeft?: number | null,
    importDate?: string | JSX.Element | null,
    amount?: string,
    status?: ITEM_STATUS | string,
    Analyst?: User,
    Tags?: string,
    Notes?: Note[]
}

export function getFormattedData(allItems: ItemsLoadable<Item>, queueStore: QueueStore): CSVData[] {
    return allItems.items.map(item => ({
        fraudScore: item.decision?.riskScore,
        purchaseId: item.id,
        originalOrderId: item.purchase?.originalOrderId,
        queues: item.queueIds.map(queue => queueStore.getQueueById?.(queue!)?.name).join(','),
        timeLeft: queueStore.getDaysLeft?.(item, queueStore.getQueueById?.(item.selectedQueueId!)!),
        importDate: item.displayImportDateTime,
        amount: item.amount,
        status: item.status,
        analyst: item.analyst,
        tags: item.tagsJoined,
        notes: item.notes
    }));
}

export function isMrItem(item: LinkAnalysisMrItem | LinkAnalysisDfpItem): item is LinkAnalysisMrItem {
    return 'item' in (item as LinkAnalysisMrItem);
}

export function getAnalysisFormattedData(items: LinkAnalysisMrItem[] | LinkAnalysisDfpItem[]): CSVData[] {
    return (items as Array<LinkAnalysisMrItem | LinkAnalysisDfpItem>).map((item:(LinkAnalysisMrItem | LinkAnalysisDfpItem)) => ({
        fraudScore: isMrItem(item) ? item.item.decision?.riskScore : item.riskScore,
        purchaseId: isMrItem(item) ? item.item.id : item.purchaseId,
        originalOrderId: isMrItem(item) ? item.item?.purchase?.originalOrderId || '' : '',
        importDate: isMrItem(item) ? item.item.displayImportDateTime : '',
        amount: isMrItem(item) ? item.item.amount : item.amount,
        status: isMrItem(item) ? item.item.status : item.merchantRuleDecision,
        email: isMrItem(item) ? item.item?.purchase?.user?.email : item.email
    }));
}
