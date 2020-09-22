export default class DynamicFilterSelectOption {
    constructor(
        /** Label of the option. */
        public label: string,
        /** Value of the option. If the field is of type MULTIPLE_DROPDOWN, it can only be a string. OData doesn't allow the use of the 'contains' operator on numbers. */
        public value: any,
        /** Whether the option is the selected one by default. In the case of fields of type DROPDOWN, only one of the options can have a value of true. */
        public selected?: boolean,
        public index?: string) {}
}
