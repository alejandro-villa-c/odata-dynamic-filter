# odata-dynamic-filter

**VueJS** dynamic filter component with **TypeScript** support for querying **OData endpoints**. 

This component generates a form with filters based on the fields provided. When clicking the search button it will emit an object with a search query string for OData endpoints.

# Installation

NPM

```bash
npm install odata-dynamic-filter
```

Yarn

```bash
yarn add odata-dynamic-filter
```

Global registration on entry point

```javascript
import DynamicFilter from 'odata-dynamic-filter';
import 'odata-dynamic-filter/dist/odata-dynamic-filter.css';

Vue.component('dynamic-filter', DynamicFilter);
```

Local registration on a component

```javascript
import DynamicFilter from 'odata-dynamic-filter';
import 'odata-dynamic-filter/dist/odata-dynamic-filter.css';

new Vue({
    el: '#app',
    components: {
        'dynamic-filter': DynamicFilter
    }
});
```

Local registration using Class Style Component syntax

```javascript
import DynamicFilter from 'odata-dynamic-filter';
import 'odata-dynamic-filter/dist/odata-dynamic-filter.css';

@Component({
    components: {
        DynamicFilter
    }
})
export default class App extends Vue {}
```

Template

```html
<template>
    <dynamic-filter></dynamic-filter>
</template>
```

# Props

## fields: Array\<DynamicFilterField\>

This will be an array of fields and will be used to generate the dynamic filter form.

The fields are of type **DynamicFilterField** which you can import as follows:

```javascript
import { DynamicFilterField } from 'odata-dynamic-filter';
```

The properties of this object are:

**fieldName: string**

This is the name of the property of the model you will be filtering in OData. Supports **nested properties** to filter by.
For example, assume you have a Person model with a list of Cars, providing the value: ```'Cars[]/Brand'``` would let you query by the brands of the cars owned by each person.

**label: string** 

This is the label that will be visible for this field on the input of the form.

**type: DynamicFilterFieldType** 

This is the type of input you want to render for the current field. The options are on an enum that you can import as follows:
```javascript
import { DynamicFilterFieldType } from 'odata-dynamic-filter';
```
This enum has the following structure which is very descriptive:
```javascript
enum DynamicFilterFieldType {
    TEXT,
    NUMBER,
    CHECKBOX,
    DROPDOWN,
    DATEPICKER,
    MULTIPLE_DROPDOWN
}
```

**options: Array\<DynamicFilterSelectOption\>**

Only applies for fields of type **DROPDOWN**. These are the options that will display on the dropdown control.

The **DynamicFilterSelectOption** object has the following properties:

**label: string** 

This is the text displayed for the option.

**value: any** 

Value of the option.

**selected: boolean** 

Whether the option is selected by default.

It can be imported as follows:

```javascript
import { DynamicFilterSelectOption } from 'odata-dynamic-filter';
```

**valueModifierIndex: number**

This is the index of the value modifier function to use in the array of functions of the **valueModifiers** prop (explained below).

## valueModifiers: Array<(value: any) => any>

The valueModifiers prop is an array of functions that you may want to apply to the values you will be filtering by before generating the query string. To choose which function to use on each field, you would provide the index of the function in the **valueModifierIndex** property of the field.

For example, you may have the following valueModifiers variable (TypeScript):
```javascript
const valueModifiers: Array<(value: any) => any> = [
    (value: any) => {
        return value / 2;
    },
    (value: any) => { 
        return value * 2;
    }
];
```
Here we have two functions that could be used as value modifiers for your fields. To choose which one to use you would make the **valueModifierIndex** have the value 0 or 1 depending on which you want to use.

## queryStringAsObjectProperty: boolean

This prop just indicates whether to append the ```'?$filter=' ``` string fragment before the final query string or not. A value of **false** adds it, which means the generated query string will be appended to a request URL of an endpoint with OData support. This also means you will **not** be using the generated query string as a property of a JavaScript object of params.

## title: string

This will be the title to display in the form. Not providing a value will just not display any title.

## andOperatorColor: string

Sometimes you want the entire row of a form where you selected the **and** operator to have a background color so that it can be easily differentiated from a row using the **or** operator. This prop defines the color that will be used. Any HTML supported color is valid.

## orOperatorColor: string

This would be the prop used for the background color of **or** rows.

## languageIsoCode: string

This is an ISO code meaning the language to be used for the labels. Currently only **English** and **Spanish** are supported. The codes are ```'en'``` and ```'es'``` respectively. To use another language read the **i18n** prop below.

## i18n: Labels

This prop is an object that define the labels used in the component. Below is an example of the object used internally for the **English** language.

```javascript
{
    languageIsoCode: 'en',
    selectFields: '-- Select fields --',
    inputsPlaceholder: 'Value',
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
}
```

# Events

## @search

This is the event emitted when the search button is clicked. It will pass a **Filter** object as argument. This object will have the properties with the generated query strings for **OData**.

**query: string** 

This is the **OData** query string generated by the component.

**queryNotNested: string**

This provides the query string based on a property of the model.

The **Filter** model can be imported as follows:

```javascript
import { Filter } from 'odata-dynamic-filter';
```

## @reset

Event emitted when the component is resetted to its initial state.

## Thanks to the Solvex company for the help and support: https://solvex.com.do/
