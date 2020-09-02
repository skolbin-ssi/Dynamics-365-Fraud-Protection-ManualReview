import { ItemPlacementMetricDTO } from './item-placement-metric-dto';

export interface ItemPlacementMetricsDTO {
    id: string;
    name: string;
    data: { [key: string]: ItemPlacementMetricDTO};
    total: ItemPlacementMetricDTO;
}
