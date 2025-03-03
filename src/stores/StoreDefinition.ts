// import type { UnwrapRef } from 'vue';
import type { DefineStoreOptions, StateTree, _GettersTree } from 'pinia';
export type { DefineStoreOptions, StateTree, _GettersTree } from 'pinia';
export type StoreDefinition<SS extends StateTree, GG extends _GettersTree<SS>, AA> = Omit<DefineStoreOptions<string, SS, GG, AA>, 'id'>;

export interface ConvenientActions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
export type ConvenientStoreDefinition<SS extends StateTree> = StoreDefinition<SS, _GettersTree<SS>, ConvenientActions>;

