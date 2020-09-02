import { injectable } from 'inversify';
import { observable } from 'mobx';
import { Item } from '../../models';

@injectable()
export class ItemStore {
    @observable item: Item | null = null;
}
