<template>
    <div class="_dynamic-filter-container">
        <div class="_dynamic-filter-row _flex-direction-row" v-show="title !== ''">
            <div class="_dynamic-filter-column">
                <h1 class="_title">{{ title }}</h1>
            </div>
        </div>
        <div class="_dynamic-filter-row">
            <div class="_dynamic-filter-column">
                <dynamic-filter-select
                    v-if="renderFieldsSelect"
                    :options="fieldOptions"
                    :isMultiselect="true"
                    :multipleSelectionLabel="labels.multipleSelection"
                    :allowsOptionRepetition="true"
                    :repeatedOptionIndexToRemove="repeatedFieldIndexToRemove"
                    :placeholder="labels.selectFields"
                    :addPlaceholderToOptions="false"
                    :isStaticPlaceholder="true"
                    @optionSelected="fieldOptionSelected">
                </dynamic-filter-select>
            </div>
        </div>
        <div class="_dynamic-filter-row _flex-direction-column" v-show="fields && fieldsToFilterBy.length > 0">
            <div class="_dynamic-filter-row _flex-direction-row" 
                v-for="(field, index) in fieldsToFilterBy" 
                :key="field.fieldId"
                :style="'background-color: ' + (field.logicalOperator && index !== fieldsToFilterBy.length - 1 ? field.logicalOperator.color : 'transparent')">
                <div class="_dynamic-filter-row" v-if="field.fieldName">
                    <div class="_dynamic-filter-column">
                        <input type="text" class="_dynamic-filter-input" disabled v-model="field.label" />
                    </div>
                    <div class="_dynamic-filter-column">
                        <dynamic-filter-select
                            :options="field.comparativeOperators"
                            :placeholder="null"
                            @optionSelected="comparativeOperatorSelected($event, field)">
                        </dynamic-filter-select>
                    </div>
                    <div class="_dynamic-filter-column">
                        <template v-if="field.type === dynamicFilterFieldType.TEXT">
                            <input 
                                type="text"
                                :placeholder="labels.inputsPlaceholder"
                                class="_dynamic-filter-input"
                                v-model="field.value">
                        </template>
                        <template v-if="field.type === dynamicFilterFieldType.NUMBER">
                            <input 
                                type="number"
                                :placeholder="labels.inputsPlaceholder"
                                class="_dynamic-filter-input"
                                v-model="field.value">
                        </template>
                        <template v-if="field.type === dynamicFilterFieldType.DROPDOWN">
                            <dynamic-filter-select
                                :options="field.options"
                                :addPlaceholderToOptions="false"
                                @optionSelected="dropdownOptionSelected($event, field)">
                            </dynamic-filter-select>
                        </template>
                        <template v-if="field.type === dynamicFilterFieldType.MULTIPLE_DROPDOWN">
                            <dynamic-filter-select
                                :options="field.options"
                                :isMultiselect="true"
                                :multipleSelectionLabel="labels.multipleSelection"
                                :addPlaceholderToOptions="false"
                                :placeholder="labels.dropdownPlaceholder"
                                @optionSelected="dropdownOptionSelected($event, field)">
                            </dynamic-filter-select>
                        </template>
                        <template v-if="field.type === dynamicFilterFieldType.CHECKBOX">
                            <div class="_dynamic-filter-checkbox-container">
                                <input type="checkbox" class="_dynamic-filter-checkbox" v-model="field.value">
                            </div>
                        </template>
                        <template v-if="field.type === dynamicFilterFieldType.DATEPICKER">
                            <input
                                type="text"
                                placeholder="dd/MM/yyyy"
                                class="_dynamic-filter-input"
                                v-model="field.value"
                                @keydown="validateDateInput($event)"
                                @paste="validateDateInput($event)">
                        </template>
                    </div>
                    <div class="_dynamic-filter-column" v-if="index !== fieldsToFilterBy.length - 1">
                        <dynamic-filter-select
                            :options="logicalOperators"
                            :placeholder="null"
                            @optionSelected="logicalOperatorSelected($event, field)">
                        </dynamic-filter-select>
                    </div>
                    <div class="_dynamic-filter-column-auto">
                        <button :class="[buttonClass, '_remove-filter-icon-button']" @click="removeField(field)">
                            <span class="_remove-filter-icon">X</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="_dynamic-filter-row">
            <button :class="[buttonClass, '_dynamic-filter-action-button']" @click="resetFields">
                <span class="_dynamic-filter-action-text">
                    {{ labels.resetButton }}
                </span>
            </button>
            <button :class="[buttonClass, '_dynamic-filter-action-button']" @click="search">
                <span class="_dynamic-filter-action-text">
                    {{ labels.searchButton }}
                </span>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import DynamicFilterSelect from "./components/DynamicFilterSelect/DynamicFilterSelect.vue";
import DynamicFilterSelectOption from './components/DynamicFilterSelect/models/DynamicFilterSelectOption';
import DynamicFilterField from "./models/DynamicFilterField";
import { DynamicFilterFieldType } from './models/DynamicFilterFieldType';
import LogicalOperatorSelectOption from './models/LogicalOperatorSelectOption';
import Filter from './models/Filter';
import Labels from './models/Labels';

@Component({
    components: {
        DynamicFilterSelect
    }
})
class DynamicFilter extends Vue {
    @Prop({ default: "" }) title: string;
    @Prop() fields: Array<DynamicFilterField>;
    @Prop({ default: false }) queryStringAsObjectProperty: boolean;
    @Prop({ default: (value: any) => value }) valueModifiers: Array<(value: any) => any>;
    @Prop({ default: 'transparent' }) andOperatorColor: string;
    @Prop({ default: 'transparent' }) orOperatorColor: string;
    @Prop({ default: 'en' }) languageIsoCode: string;
    @Prop({ default: null }) i18n: Labels;
    @Prop({ default: '_dynamic-filter-button' }) buttonClass: string;

    public fieldsToFilterBy: Array<DynamicFilterField> = [];
    public repeatedFieldIndexToRemove: string = null;
    public labelsByLanguage: Array<Labels> = [
        {
            languageIsoCode: 'en',
            selectFields: 'Select the fields',
            inputsPlaceholder: 'Value',
            dropdownPlaceholder: 'Select an option',
            multipleSelection: 'selected options',
            resetButton: 'Reset',
            searchButton: 'Search',
            comparativeOperators: {
                contains: 'Contains',
                equal: 'Equal to',
                greater: 'Greater than',
                less: 'Less than',
                greaterOrEqual: 'Greater or equal to',
                lessOrEqual: 'Less or equal to'
            },
            logicalOperators: {
                and: 'And',
                or: 'Or'
            }
        },
        {
            languageIsoCode: 'es',
            selectFields: 'Seleccione los campos',
            inputsPlaceholder: 'Valor',
            dropdownPlaceholder: 'Seleccione una opción',
            multipleSelection: 'opciones seleccionadas',
            resetButton: 'Reiniciar',
            searchButton: 'Buscar',
            comparativeOperators: {
                contains: 'Contiene',
                equal: 'Igual que',
                greater: 'Mayor que',
                less: 'Menor que',
                greaterOrEqual: 'Mayor o igual que',
                lessOrEqual: 'Menor o igual que'
            },
            logicalOperators: {
                and: 'Y',
                or: 'O'
            }
        }
    ];
    public labels: Labels = this.labelsByLanguage.find(x => x.languageIsoCode === this.languageIsoCode);
    public fieldOptions: DynamicFilterSelectOption[] = [];
    public dynamicFilterFieldType: typeof DynamicFilterFieldType = DynamicFilterFieldType;
    public fieldNamePlaceholder: string = '_fieldName_';
    public valuePlaceholder: string = '_value_';
    public comparativeOperators: DynamicFilterSelectOption[] = [
        {
            label: this.labels.comparativeOperators.contains,
            value: `contains(${this.fieldNamePlaceholder},${this.valuePlaceholder})`
        },
        {
            label: this.labels.comparativeOperators.equal,
            value: ' eq '
        },
        {
            label: this.labels.comparativeOperators.greater,
            value: ' gt '
        },
        {
            label: this.labels.comparativeOperators.greaterOrEqual,
            value: ' ge '
        },
        {
            label: this.labels.comparativeOperators.less,
            value: ' lt '
        },
        {
            label: this.labels.comparativeOperators.lessOrEqual,
            value: ' le '
        }
    ];
    public logicalOperators: LogicalOperatorSelectOption[] = [];
    public renderFieldsSelect: boolean = true;
    public nestedPropertiesSeparator: string = '[]/';

    public created(): void {
        this.setLabels();
        this.logicalOperators = [
            {
                label: this.labels.logicalOperators.and,
                value: ' and ',
                color: this.andOperatorColor
            },
            {
                label: this.labels.logicalOperators.or,
                value: ' or ',
                color: this.orOperatorColor
            }
        ];
        this.initFields();
        this.setDynamicFilterFieldOptions();
    }

    public setLabels(): void {
        if (this.i18n) {
            this.labels = this.i18n;
        }
    }

    public setDynamicFilterFieldOptions(): void {
        this.fieldOptions = this.fields.map((field: DynamicFilterField) => {
            return new DynamicFilterSelectOption(field.label, field.fieldName);
        });
    }

    public initFields(): void {
        this.fields.forEach((field: DynamicFilterField) => {
            if (field.fieldName) {
                const comparativeOperatorsClone: DynamicFilterSelectOption = JSON.parse(JSON.stringify(this.comparativeOperators));
                field.comparativeOperators = [];
                switch(field.type) {
                    case DynamicFilterFieldType.TEXT:
                        field.comparativeOperator = comparativeOperatorsClone[0].value;
                        field.comparativeOperators.push(comparativeOperatorsClone[0]);
                        field.comparativeOperators.push(comparativeOperatorsClone[1]);
                        break;
                    case DynamicFilterFieldType.NUMBER:
                        field.comparativeOperator = comparativeOperatorsClone[1].value;
                        field.comparativeOperators.push(comparativeOperatorsClone[1]);
                        field.comparativeOperators.push(comparativeOperatorsClone[2]);
                        field.comparativeOperators.push(comparativeOperatorsClone[3]);
                        field.comparativeOperators.push(comparativeOperatorsClone[4]);
                        field.comparativeOperators.push(comparativeOperatorsClone[5]);
                        break;
                    case DynamicFilterFieldType.CHECKBOX:
                        field.comparativeOperator = comparativeOperatorsClone[1].value;
                        field.comparativeOperators.push(comparativeOperatorsClone[1]);
                        break;
                    case DynamicFilterFieldType.DROPDOWN:
                        if (!field.options) {
                            field.options = [];
                        }
                        if (field.options.length > 0) {
                            field.value = field.options[0].value;
                        }
                        field.comparativeOperator = comparativeOperatorsClone[0].value;
                        field.comparativeOperators.push(comparativeOperatorsClone[0]);
                        field.comparativeOperators.push(comparativeOperatorsClone[1]);
                        break;
                    case DynamicFilterFieldType.MULTIPLE_DROPDOWN:
                        if (!field.options) {
                            field.options = [];
                        }
                        field.comparativeOperator = comparativeOperatorsClone[0].value;
                        field.comparativeOperators.push(comparativeOperatorsClone[0]);
                        field.comparativeOperators.push(comparativeOperatorsClone[1]);
                        break;
                    case DynamicFilterFieldType.DATEPICKER:
                        field.value = this.formatDate(new Date());
                        field.comparativeOperator = comparativeOperatorsClone[1].value;
                        field.comparativeOperators.push(comparativeOperatorsClone[1]);
                        field.comparativeOperators.push(comparativeOperatorsClone[2]);
                        field.comparativeOperators.push(comparativeOperatorsClone[3]);
                        field.comparativeOperators.push(comparativeOperatorsClone[4]);
                        field.comparativeOperators.push(comparativeOperatorsClone[5]);
                        break;
                    default:
                        field.comparativeOperator = comparativeOperatorsClone[1].value;
                        field.comparativeOperators.push(comparativeOperatorsClone[1]);
                        break;
                }
            }
        });
    }

    public fieldOptionSelected(option: DynamicFilterSelectOption): void {
        const field: DynamicFilterField = this.fields.find((field: DynamicFilterField) => field.fieldName === option.value);
        if (field) {
            const fieldClone: DynamicFilterField = JSON.parse(JSON.stringify(field));
            fieldClone.fieldId = option.index;
            this.fieldsToFilterBy.push(fieldClone);
        }
    }

    public comparativeOperatorSelected(option: DynamicFilterSelectOption, field: DynamicFilterField): void {
        field.comparativeOperator = option.value;
    }

    public logicalOperatorSelected(option: LogicalOperatorSelectOption, field: DynamicFilterField): void {
        field.logicalOperator = option;
        this.$nextTick().then(() => {
            this.$forceUpdate();
        });
    }

    public dropdownOptionSelected(option: DynamicFilterSelectOption, field: DynamicFilterField): void {
        if (field.type === DynamicFilterFieldType.MULTIPLE_DROPDOWN) {
            field.value = field.value || [];
            if (option.selected) {
                field.value.push(option.value);
            } else {
                var valueIndex = field.value.indexOf(option.value);
                field.value.splice(valueIndex, 1);
            }
        } else {
            field.value = option.value;
        }
    }

    public resetFields(): void {
        this.fieldsToFilterBy = [];
        this.renderFieldsSelect = false;
        this.$nextTick().then(() => {
            this.renderFieldsSelect = true;
        });
        this.$emit('reset');
    }

    public getComparativeExpression(comparativeOperator: string, fieldName: string, value: any): string {
        let comparativeExpression: string = '';
        const fieldNameIsNestedProperty: boolean = fieldName.indexOf(this.nestedPropertiesSeparator) > -1;
        let collectionName: string = null;
        if (fieldNameIsNestedProperty) {
            const fieldSplitted: Array<string> = fieldName.split(this.nestedPropertiesSeparator);
            collectionName = fieldSplitted[0];
            fieldName = fieldSplitted[1];
            comparativeExpression += `${collectionName}/any(x:`;
        }
        
        switch(comparativeOperator) {
            case this.comparativeOperators[0].value:
                if (fieldNameIsNestedProperty) {
                    fieldName = `x/${fieldName}`;
                }
                const containsOperatorQuery: string = comparativeOperator
                    .replace(this.fieldNamePlaceholder, fieldName)
                    .replace(this.valuePlaceholder, value);
                comparativeExpression += containsOperatorQuery;
                break;
            default:
                if (fieldNameIsNestedProperty) {
                    comparativeExpression += 'x/';
                }
                comparativeExpression += fieldName + comparativeOperator + value;
                break;
        }

        if (fieldNameIsNestedProperty) {
            comparativeExpression += ')';
        }

        return comparativeExpression;
    }

    public getFilterQuery(fields: DynamicFilterField[]): string {
        let filterQuery: string = !this.queryStringAsObjectProperty ? '?$filter=' : '';

        if (fields && fields.length > 0) {
            fields.forEach((field: DynamicFilterField, index: number) => {
                let modifiedValue = field.value;
                if (field.valueModifierIndex || field.valueModifierIndex === 0) {
                    modifiedValue = this.valueModifiers[field.valueModifierIndex](modifiedValue);
                }
                let valueTransformedByField: any = null;
                switch (field.type) {
                    case DynamicFilterFieldType.DATEPICKER:
                        valueTransformedByField = this.formatDate(this.stringToDate(modifiedValue), true);
                        filterQuery += this.getComparativeExpression(field.comparativeOperator, field.fieldName, valueTransformedByField);
                        break;
                    case DynamicFilterFieldType.NUMBER:
                        filterQuery += this.getComparativeExpression(field.comparativeOperator, field.fieldName, modifiedValue);
                        break;
                    case DynamicFilterFieldType.MULTIPLE_DROPDOWN:
                        filterQuery += "(";
                        modifiedValue.forEach((value: any, i: number) => {
                            if (i > 0) {
                                filterQuery += this.logicalOperators[1].value;
                            }
                            if (typeof value === 'string') {
                                valueTransformedByField = `\'${value}\'`;
                                filterQuery += this.getComparativeExpression(field.comparativeOperator, field.fieldName, valueTransformedByField);
                            } else if (typeof value === 'number') {
                                filterQuery += this.getComparativeExpression(field.comparativeOperator, field.fieldName, value);
                            }
                        });
                        filterQuery += ")";
                        break;
                    case DynamicFilterFieldType.DROPDOWN:
                        if (typeof modifiedValue === 'string') {
                            valueTransformedByField = `\'${modifiedValue}\'`;
                            filterQuery += this.getComparativeExpression(field.comparativeOperator, field.fieldName, valueTransformedByField);
                        } else if (typeof modifiedValue === 'number') {
                            filterQuery += this.getComparativeExpression(field.comparativeOperator, field.fieldName, modifiedValue);
                        }
                        break;
                    default:
                        valueTransformedByField = `\'${modifiedValue}\'`;
                        filterQuery += this.getComparativeExpression(field.comparativeOperator, field.fieldName, valueTransformedByField);
                        break;
                }

                if (index !== fields.length - 1) {
                    filterQuery += field.logicalOperator.value;
                }
            });
        }

        return filterQuery;
    }

    public search(): void {
        const fields: DynamicFilterField[] = this.fieldsToFilterBy.filter(x => x.value !== undefined);
        const fieldsClone = JSON.parse(JSON.stringify(fields));
        const query: string = this.getFilterQuery(fieldsClone);
        const queryNotNested: string = this.getFilterQuery(fieldsClone.map((field: DynamicFilterField) => {
            if (field.fieldName.indexOf(this.nestedPropertiesSeparator) > -1) {
                field.fieldName = field.fieldName.split(this.nestedPropertiesSeparator)[1];
            }
            return field;
        }));
        
        this.$emit('search', new Filter(
            query,
            queryNotNested
        ));
    }

    public removeField(field: DynamicFilterField): void {
        const index: number = this.fieldsToFilterBy.map(x => x.fieldId).indexOf(field.fieldId);
        if (index > -1) {
            this.fieldsToFilterBy.splice(index, 1);
        }
        this.repeatedFieldIndexToRemove = field.fieldId;
    }

    public stringToDate(date: string): Date {
        if (date) {
            const dateSplitted: string[] = date.split('/');
            const year: number = Number(dateSplitted[2]);
            const month: number = Number(dateSplitted[1]) - 1;
            const day: number = Number(dateSplitted[0]);
            const d: Date = new Date(year, month, day);
            return d;
        } else {
            return null;
        }
    }

    public formatDate(d: Date, isIso8601: boolean = false): string {
        let month: string = (d.getMonth() + 1).toString();
        let day: string = d.getDate().toString();
        const year: number = d.getFullYear();

        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        } 

        if (isIso8601) {
            return [year, month, day].join('-');
        } else {
            return [day, month, year].join('/');
        }
    }

    public validateDateInput(event: KeyboardEvent): void {
        const leftArrowKeyCode: number = 37;
        const rightArrowKeyCode: number = 39;
        const keyIsLeftOrRightArrow: boolean = event.keyCode === leftArrowKeyCode || event.keyCode === rightArrowKeyCode;
        const backspaceKeyCode: number = 8;
        const keyIsBackspace: boolean = event.keyCode === backspaceKeyCode;
        const key: string = event.key;
        const onlyDigits: boolean = (/^\d+$/).test(key);
        if (!(onlyDigits || keyIsBackspace || keyIsLeftOrRightArrow)) {
            event.preventDefault();
            return;
        }

        const dateInput: any = (event.target as any);
        if (dateInput) {
            const caretPosition: number = dateInput.selectionStart;
            if (!((caretPosition === dateInput.value.length) || keyIsLeftOrRightArrow)) {
                event.preventDefault();
                return;
            }

            const lengthLessThanTen: boolean = dateInput.value.length < 10;
            if (!(lengthLessThanTen || keyIsBackspace || keyIsLeftOrRightArrow)) {
                event.preventDefault();
                return;
            }

            switch(caretPosition) {
                case 0:
                    if (!(key === '0' || key === '1' || key === '2' || key === '3')) {
                        event.preventDefault();
                        return;
                    }
                    break;
                case 2:
                    if (!(key === '0' || key === '1' || keyIsBackspace)) {
                        event.preventDefault();
                        return;
                    }
                    break;
            }

            if (!keyIsBackspace) {
                if ((dateInput.value.length === 2) || (dateInput.value.length === 5)) {
                    dateInput.value += '/';
                }
            }
        }
    }
}

export default DynamicFilter;
export { DynamicFilterSelect, DynamicFilterField, DynamicFilterFieldType, DynamicFilterSelectOption, LogicalOperatorSelectOption, Filter };
</script>

<style scoped>
    @import './dynamic-filter.css';

    ._dynamic-filter-container {
        display: flex;
        flex-direction: column;
        background-color: white;
        border-radius: 4px;
        border: 1px solid rgba(24, 28, 33, 0.26);
        padding: 20px;
    }

    ._dynamic-filter-row {
        display: flex;
        width: fit-content;
        border-radius: 4px;
        flex-wrap: wrap;
        margin-top: 5px;
        margin-bottom: 5px;
    }

    ._flex-direction-row {
        flex-direction: row;
    }

    ._flex-direction-column {
        flex-direction: column;
    }

    ._title {
        font-size: 28px;
        font-weight: bold;
        display: inline-flex;
        align-self: flex-start;
        margin-top: auto;
        margin-bottom: auto;
    }

    ._dynamic-filter-action-button {
        padding-bottom: 0.5em;
        padding-left: 1em;
        padding-right: 1em;
        padding-top: 0.5em;
        margin-right: 10px;
        margin-left: 10px;
    }

    ._dynamic-filter-action-text {
        font-size: 16px;
    }

    ._remove-filter-icon-button {
        width: 30px;
        height: 30px;
        margin-top: auto;
        margin-bottom: auto;
        margin-left: auto;
        margin-right: auto;
    }

    ._remove-filter-icon {
        font-size: 16px;
    }
</style>
