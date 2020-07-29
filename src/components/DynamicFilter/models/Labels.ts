export default class Label {
    constructor(
        public language: string,
        public title: string,
        public selectFields: string,
        public inputsPlaceholder: string,
        public resetButton: string,
        public searchButton: string,
        public comparativeOperators: {
            contains: string,
            equal: string,
            greater: string,
            less: string,
            greaterOrEqual: string,
            lessOrEqual: string
        },
        public logicalOperators: {
            and: string,
            or: string
        }
    ) {}
}