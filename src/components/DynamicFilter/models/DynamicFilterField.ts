import DynamicFilterSelectOption from '../components/DynamicFilterSelect/models/DynamicFilterSelectOption';
import { DynamicFilterFieldType } from './DynamicFilterFieldType';
import LogicalOperatorSelectOption from './LogicalOperatorSelectOption';

export default class DynamicFilterField {
    constructor(
        /** Field name on the model. */
        public fieldName: string,
        /** Field name for the user. */
        public label: string,
        /** Type of field. */
        public type: DynamicFilterFieldType,
        /** Options for the dropdown in case it is of type DROPDOWN or MULTIPLE_DROPDOWN. */
        public options?: DynamicFilterSelectOption[],
        /** Index of the array of functions that transform the value before constructing the query. */
        public valueModifierIndex?: number,
        /** Comparative operators allowed in this type of field. */
        public comparativeOperators?: DynamicFilterSelectOption[],
        /** Value of the operator selected. */
        public comparativeOperator?: string,
        /** Value inserted to filter by. */
        public value?: any,
        /** Logical operator and/or selected. */
        public logicalOperator?: LogicalOperatorSelectOption,
        /** Field unique identifier. */
        public fieldId?: string
    ) {}
}
