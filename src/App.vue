<template>
    <div>
        <dynamic-filter
            :fields="dynamicFilterFields"
            :valueModifiers="dynamicFilterValueModifiers"
            :queryStringAsObjectProperty="true"
            @search="dynamicFilterSearch"
            @reset="resetFilters"
            andOperatorColor="rgba(234, 129, 43, 0.5)"
            orOperatorColor="rgba(13, 97, 182, 0.5)"
            languageIsoCode="en"
        ></dynamic-filter>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { DynamicFilterFieldType, DynamicFilterField, DynamicFilterSelectOption, Filter } from "@/components/DynamicFilter/DynamicFilter.vue";

@Component({})
export default class App extends Vue {
    public dynamicFilterFields: DynamicFilterField[] = [
        {
            fieldName: 'name',
            label: 'Name',
            type: DynamicFilterFieldType.TEXT
        },
        {
            fieldName: 'lastName',
            label: 'Last Name',
            type: DynamicFilterFieldType.TEXT
        },
        {
            fieldName: 'percentage',
            label: 'Percentage',
            type: DynamicFilterFieldType.NUMBER,
            valueModifierIndex: 0
        },
        {
            fieldName: 'gender',
            label: 'Gender',
            type: DynamicFilterFieldType.DROPDOWN,
            options: [
                {
                    label: 'Male',
                    value: 'male'
                },
                {
                    label: 'Female',
                    value: 'female'
                },
                {
                    label: 'Other',
                    value: 'other'
                }
            ]
        },
        {
            fieldName: 'ocurredAt',
            label: 'Date',
            type: DynamicFilterFieldType.DATEPICKER,
        },
        {
            fieldName: 'isMarried',
            label: 'Is Married',
            type: DynamicFilterFieldType.CHECKBOX
        },
        {
            fieldName: 'pet',
            label: 'Pet',
            type: DynamicFilterFieldType.MULTIPLE_DROPDOWN,
            options: [
                {
                    label: 'Dog',
                    value: 'dog'
                },
                {
                    label: 'Cat',
                    value: 'cat'
                },
                {
                    label: 'Fish',
                    value: 'fish'
                }
            ]
        }
    ];

    public dynamicFilterValueModifiers: Array<(value: any) => any> = [
        (value: any) => value / 100
    ];

    public dynamicFilterSearch(filter: Filter): void {
        console.log(filter);
    }

    public resetFilters(): void {
        console.log('Reset emitted');
    }
}
</script>