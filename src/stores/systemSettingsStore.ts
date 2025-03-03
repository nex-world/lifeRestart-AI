import _ from 'lodash';
import { defineStore } from 'pinia';
import { parse, stringify } from 'zipson';

// - 想要复用或继承 store 的 getters 和 actions 的话
//   - 应该把第二个参数单独拿出来进行复用，但 ts 类型标注会遇到问题
//     - 涉及一些复杂的类型引用，需要进一步研究
//   - 这篇文章的做法行不通  https://geek-docs.com/vuejs/vue-js-questions/294_vuejs_inheritance_shared_action_and_getters_in_pinia.html


import type { ConvenientStoreDefinition } from './StoreDefinition';

export type SystemSettingsDefinition = ConvenientStoreDefinition<SystemSettingsState>;

export interface SystemSettingsState {
  locale?: string;
  fallbackLocale?: string;
  availableLocales?: string[];
};

const defaultState: SystemSettingsState = {
  locale: 'en',
  fallbackLocale: 'en',
  availableLocales: ['en', 'zh'],
};

export const systemSettingsDefinition: SystemSettingsDefinition = {
  state: () => (_.cloneDeep(defaultState)),
  getters: {
  },
  actions: {
    setLocale(locale?: string, i18nLocale?: {value: string}) {
      locale = (locale??"").toLowerCase();
      if (!this.availableLocales?.includes(locale)) {
        locale = this.locale;
      }
      if (i18nLocale!=null) {
        i18nLocale.value = locale!;
      }
      this.locale = locale;
    }
  },
  persist: {
    // https://prazdevs.github.io/pinia-plugin-persistedstate/guide/config.html
    serializer: {
      deserialize: parse,
      serialize: stringify,
    },
    // pick: ['notes'],
  },
};

export const useSystemSettingsStore = defineStore('systemSettingsStore', systemSettingsDefinition);
