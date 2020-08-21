<template>
    <div :class="{ '_dynamic-filter-select-container': true, '_disabled': disabled }" v-click-outside="hideSelectOptions">
        <div class="_dynamic-filter-select" @click="toggleOptions">
            <template>
                <template v-if="!isMultiselect">
                    <span v-if="selectedOption">
                        {{ selectedOption.label }}
                    </span>
                </template>
                <template v-else>
                    <template v-if="(isStaticPlaceholder && placeholder) || selectedOptions.length === 0">
                        <span>
                            {{ placeholder }}
                        </span>
                    </template>
                    <template v-else>
                        <span>
                            {{ multipleSelectionDisplay(selectedOptions) }}
                        </span>
                    </template>
                </template>
                <span class="_selected-option-arrow">&#11206;</span>
            </template>
        </div>
        <ul class="_dynamic-filter-select-options" v-show="showOptions" v-if="optionsClone && optionsClone.length > 0">
            <li v-for="option in optionsClone" :key="option.value" :class="{ '_selected-option': option.selected && !allowsOptionRepetition }" @click="selectOption(option)">
                <span class="_selected-option-label">{{ option.label }}</span>
                <template v-if="isMultiselect && !allowsOptionRepetition">
                    <input type="checkbox" v-if="isMultiselect" :checked="option.selected" class="_selected-checkbox">
                </template>
                <template v-else>
                    <span>
                        ({{ selectedOptions.filter(x => x.value === option.value).length }})
                    </span>
                    <span class="_addition-icon">
                        +
                    </span>
                </template>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import DynamicFilterSelectOption from './models/DynamicFilterSelectOption';

Vue.directive('click-outside', {
    bind: function (el, binding, vnode) {
        el.clickOutsideEvent = function (event) {
            if (el !== event.target && !el.contains(event.target)) {
                vnode.context[binding.expression](event);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent)
    },
    unbind: function (el: any) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
    }
});

@Component({})
export default class DynamicFilterSelect extends Vue {
    @Prop() options: DynamicFilterSelectOption[];
    @Prop({ default: false }) disabled: boolean;
    @Prop({ default: 'Seleccione una opción' }) placeholder: string;
    @Prop({ default: true }) addPlaceholderToOptions: boolean;
    @Prop({ default: false }) isMultiselect: boolean;
    @Prop({ default: false }) isStaticPlaceholder: boolean;
    /** Only applies if it is multiselect */
    @Prop({ default: false }) allowsOptionRepetition: boolean;
    /** Only applies if it is multiselect. Has a watcher in case you want to remove one of the repeated options in the parent component. */
    @Prop({ default: null }) repeatedOptionIndexToRemove: string;

    public showOptions: boolean = false;
    public selectedOption: DynamicFilterSelectOption = null;
    public selectedOptions: DynamicFilterSelectOption[] = [];
    public optionsClone: DynamicFilterSelectOption[];

    public created(): void {
        this.optionsClone = JSON.parse(JSON.stringify(this.options));
        if (this.placeholder && this.addPlaceholderToOptions) {
            const option: DynamicFilterSelectOption = new DynamicFilterSelectOption(this.placeholder, null, false);
            this.optionsClone.push(option);
        }
        if (!this.isMultiselect) {
            this.selectOption(this.optionsClone[0]);
        }
    }

    @Watch('repeatedOptionIndexToRemove')
    public onRepeatedOptionRemoved(index: string): void {
        const indexInArray: number = this.selectedOptions.map(x => x.index).indexOf(index);
        if (indexInArray > -1) {
            this.selectedOptions.splice(indexInArray, 1);
        }
    }

    public toggleOptions(): void {
        if (!this.disabled) {
            this.showOptions = !this.showOptions;
        }
    }

    public hideSelectOptions(): void {
        this.showOptions = false;
    }

    public selectOption(selectedOption: DynamicFilterSelectOption): void {
        if (!this.isMultiselect) {
            this.showOptions = false;
            this.selectedOption = selectedOption;
            const currentSelectedOption: DynamicFilterSelectOption = this.optionsClone.find((option: DynamicFilterSelectOption) => option.selected);
            if (currentSelectedOption) {
                currentSelectedOption.selected = false;
            }
            if (!selectedOption.selected) {
                selectedOption.selected = true;
            }
            this.$emit('optionSelected', selectedOption);
        } else {
            this.triggerReactivityAfterOptionSelection();
            if (!this.allowsOptionRepetition) {
                if (selectedOption.selected) {
                    selectedOption.selected = false;
                    const optionIndex: number = this.selectedOptions.indexOf(selectedOption);
                    this.selectedOptions.splice(optionIndex, 1);
                } else {
                    selectedOption.selected = true;
                    this.selectedOptions.push(selectedOption);
                }
                this.$emit('optionSelected', selectedOption);
            } else {
                selectedOption.selected = true;
                const previouslyAdded: number = this.selectedOptions.filter(x => x.value === selectedOption.value).length;
                const selectedOptionClone: DynamicFilterSelectOption = JSON.parse(JSON.stringify(selectedOption));
                selectedOptionClone.index = selectedOptionClone.value + previouslyAdded;
                this.selectedOptions.push(selectedOptionClone);
                this.$emit('optionSelected', selectedOptionClone);
            }
        }
    }

    public multipleSelectionDisplay(options: DynamicFilterSelectOption[]): string {
        let label: string = `${options.length} opciones seleccionadas`;
        if (options.length < 4) {
            label = options.map(x => x.label).join(", ");
        }
        
        return label;
    }

    public triggerReactivityAfterOptionSelection(): void {
        this.showOptions = false;
        this.showOptions = true;
    }
}
</script>

<style scoped>
    ._disabled {
        color: rgba(0, 0, 0, 0.38);
    }

    ._dynamic-filter-select-container {
        display: inline-flex;
        align-self: flex-start;
        min-height: 42px;
        position: relative;
        font-size: 16px;
        width: 100%;
    }

    ._dynamic-filter-select-container * {
        box-sizing: border-box;
    }

    ._dynamic-filter-select-container:not(._disabled) {
        cursor: pointer;
    }

    ._disabled > ._dynamic-filter-select, ._disabled > ._dynamic-filter-select-options {
        border: 1px solid rgba(0, 0, 0, 0.38)!important;
    }

    ._dynamic-filter-select, ._dynamic-filter-select-options {
        width: 100%;
        border: 1px solid black;
        border-radius: 4px;
        line-height: 24px;
        -webkit-user-select: none; /* Safari */        
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE10+/Edge */
        user-select: none; /* Standard */
    }

    ._dynamic-filter-select {
        display: flex;
        background-color: white;
    }

    ._dynamic-filter-select-options {
        background-color: white;
        position: absolute;
        z-index: 10000;
        top: 100%;
        left: 0;
        max-height: 260px;
        overflow: auto;
        padding: 0;
        margin-top: 0;
        margin-bottom: 0;
        margin-left: 0;
        margin-right: 0;
    }

    ._dynamic-filter-select, ._dynamic-filter-select-options > li {
        padding: 8px;
    }

    ._dynamic-filter-select-options > li:not(._selected-option):hover {
        background-color: rgba(0,0,0,.04);
    }

    ._dynamic-filter-select-options > li {
        display: flex;
        flex-direction: row;
        margin-top: 0;
    }

    ._selected-checkbox, ._addition-icon {
        display: flex;
        flex-direction: row;
        margin-left: auto;
        margin-top: auto;
        margin-bottom: auto;
        cursor: pointer;
    }

    ._selected-checkbox {
        width: 18px;
        height: 18px;
        min-width: 18px;
        min-height: 18px;
    }

    ._addition-icon {
        font-size: 24px;
    }

    ._selected-option {
        background-color: rgba(0,0,0,.12);
    }

    ._selected-option-arrow {
        margin-left: auto;
    }

    ._selected-option-label {
        margin-right: 5px;
    }
</style>
