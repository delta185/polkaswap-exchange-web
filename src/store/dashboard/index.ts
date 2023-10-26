import { defineModule } from 'direct-vuex';

import { localActionContext, localGetterContext } from '@/store';
import { Module } from '@/store/consts';

import mutations from './mutations';
import state from './state';

const dashboard = defineModule({
  namespaced: true,
  state,
  mutations,
});

const dashboardGetterContext = (args: [any, any, any, any]) => localGetterContext(args, Module.Dashboard, dashboard);
const dashboardActionContext = (context: any) => localActionContext(context, Module.Dashboard, dashboard);

export { dashboardGetterContext, dashboardActionContext };
export default dashboard;
