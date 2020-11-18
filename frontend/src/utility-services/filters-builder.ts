// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { SettingsService } from '../data-services/interfaces';
import { TYPES } from '../types';
import { ConcreteConditionFactory, ConditionsFactory } from '../models/filter/condition-factory';
import { Condition } from '../models/filter/condition';
import { FilterConditionDto } from '../data-services/api-services/models/settings/filter-condition-dto';
import { FilterField } from '../models/filter/filter-field';

interface FieldConditionGroup {
    field: string;
    conditions: Condition[]
}

@injectable()
export class FiltersBuilder {
    // TODO: Register conditionsFactory in container and use a single instance
    private conditionsFactory: ConditionsFactory = new ConcreteConditionFactory();

    private filterFields: Map<string, FilterField>;

    constructor(
        @inject(TYPES.SETTINGS_SERVICE) private readonly settingsService: SettingsService,
    ) {
        const filters = this.settingsService.getFilters();
        this.filterFields = new Map<string, FilterField>(filters.map(filter => [filter.id, filter]));
    }

    /**
     * Reads filterConditionDTOs models and creates in-memory filter object base on the condition
     *
     * @param filterConditionDTOs - filter condition DTO models
     */
    getPopulatedFilterFields(filterConditionDTOs: FilterConditionDto[]) {
        const populatedFilters: FilterField[] = [];

        const filedConditionGroups = this.getFiltersFieldsFromFiltersDto([...filterConditionDTOs]);

        filedConditionGroups.forEach(group => {
            const searchedFilterField = this.filterFields.get(group.field);

            if (searchedFilterField) {
                searchedFilterField.setIsFilterUsed(true);
                searchedFilterField.setConditions(group.conditions);

                populatedFilters.push(searchedFilterField);
            }
        });

        return populatedFilters;
    }

    private getFiltersFieldsFromFiltersDto(filterConditionDTOs: FilterConditionDto[]): FieldConditionGroup[] {
        return this.getUniqueFilterIdsList(filterConditionDTOs)
            .map(field => ({
                field,
                conditions: this.getCreatedConditionsForFiltersGroup(filterConditionDTOs, field)
            }));
    }

    private getCreatedConditionsForFiltersGroup(filterConditionDTOs: FilterConditionDto[], field: string) {
        const createdConditionModels: Condition[] = [];
        let emptyFilterConditions: Condition[] = [];

        // conditions that comes from API
        const usedConditions: string[] = [];

        filterConditionDTOs
            .filter(conditionDto => conditionDto.field === field)
            .forEach(filterConditionDTO => {
                usedConditions.push(filterConditionDTO.condition);
                const createdConditionModel = this.createCondition(filterConditionDTO);

                if (createdConditionModel) {
                    createdConditionModel.setIsConditionUsed(true);
                    createdConditionModel.setIsValid(true);
                    createdConditionModels.push(createdConditionModel);
                }
            });

        const filter = this.filterFields.get(field);

        if (filter) {
            const { acceptableConditions } = filter;

            emptyFilterConditions = acceptableConditions
                .filter(acceptableCondition => !usedConditions.includes(acceptableCondition))
                .map(acceptableCondition => this.conditionsFactory.createCondition(acceptableCondition));
        }

        return [...createdConditionModels, ...emptyFilterConditions];
    }

    private createCondition(filterConditionDto: FilterConditionDto): Condition | null {
        const { condition } = filterConditionDto;

        const conditionModal = this.conditionsFactory
            .createCondition(condition, { lowerBound: null, upperBound: null });

        if (conditionModal) {
            return conditionModal.fromDto(filterConditionDto);
        }

        return null;
    }

    private getUniqueFilterIdsList(fields: FilterConditionDto[]): string[] {
        const uniqCategoriesList = new Set(fields.map(filterField => filterField.field));
        return Array.from(uniqCategoriesList);
    }
}
