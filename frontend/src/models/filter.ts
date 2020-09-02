import { observable } from 'mobx';
import {
    QUEUE_ITEMS_FIELD,
    FILTER_CONDITION,
    FILTER_NAMES,
    FILTER_DESCRIPTIONS,
    FILTER_CONDITIONS,
    FILTER_INITIAL_VALUES,
    FILTER_VALIDATORS
} from '../constants';
import { ItemFilterDTO } from '../data-services/api-services/models';
import { FilterValidator, filterValidatorFactory } from './filterValidator';

export class Filter {
    @observable
    name: string | undefined = undefined;

    @observable
    description: string | undefined = undefined;

    field: QUEUE_ITEMS_FIELD | undefined = undefined;

    condition: FILTER_CONDITION | undefined = undefined;

    @observable
    values: string[] = [];

    @observable
    validators: FilterValidator[] = [];

    constructor(field?: QUEUE_ITEMS_FIELD) {
        if (!field) {
            return this;
        }
        const name = this.getName(field);
        if (!name) {
            throw new Error(`Impossible to create a filter of type: ${this.field}`);
        }
        const initialValue = this.getInitialValues(field);
        this.field = field;
        this.name = name;
        this.description = this.getDescription(field);
        this.condition = this.getCondition(field);
        this.values = [...initialValue];
        this.validators = this.getValidators(field);
    }

    getName(field: QUEUE_ITEMS_FIELD): string | undefined {
        return FILTER_NAMES.get(field);
    }

    getDescription(field: QUEUE_ITEMS_FIELD): string | undefined {
        return FILTER_DESCRIPTIONS.get(field);
    }

    getCondition(field: QUEUE_ITEMS_FIELD): FILTER_CONDITION | undefined {
        return FILTER_CONDITIONS.get(field);
    }

    getInitialValues(field: QUEUE_ITEMS_FIELD): string[] {
        return FILTER_INITIAL_VALUES.get(field) || [];
    }

    getValidators(field: QUEUE_ITEMS_FIELD): FilterValidator[] {
        const requiredValidatorTypes = FILTER_VALIDATORS.get(field) || [];
        return requiredValidatorTypes.map(type => filterValidatorFactory.create(type, field, this.values));
    }

    fromDTO(filterDTO: ItemFilterDTO) {
        const {
            field,
            condition,
            values
        } = filterDTO;

        const name = this.getName(filterDTO.field);
        const description = this.getDescription(filterDTO.field);

        if (!name) {
            // throw new Error(`Impossible to create a filter of type: ${this.field}`);
            return null;
        }

        this.field = field;
        this.condition = condition;
        this.values = values;
        this.name = name;
        this.description = description;
        return this;
    }

    toDTO(): ItemFilterDTO {
        return {
            field: this.field as QUEUE_ITEMS_FIELD,
            condition: this.condition as FILTER_CONDITION,
            values: this.values
        };
    }
}
