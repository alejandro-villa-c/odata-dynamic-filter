import Vue from 'vue';
import App from './App.vue';
import DynamicFilter from '@/components/DynamicFilter/DynamicFilter.vue';

Vue.component('dynamic-filter', DynamicFilter);

Vue.config.productionTip = false;

new Vue({
    render: h => h(App),
}).$mount('#app');
