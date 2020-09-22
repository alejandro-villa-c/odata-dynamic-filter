import DynamicFilterSelectOption from '../components/DynamicFilterSelect/models/DynamicFilterSelectOption';

export default class LogicalOperatorSelectOption extends DynamicFilterSelectOption {
    constructor(
        public label: string,
        public value: any,
        public color?: string) { 
            super(label, value); 
        }
}