/**
 * @file
 * 供 main 使用的 vue 插件
 * 其他地方用不着
 * 真正的具体 stores 在 stores 目录下
 **/

import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export const store = createPinia();
store.use(piniaPluginPersistedstate);
