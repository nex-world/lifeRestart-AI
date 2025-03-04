/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SupplierDict } from 'llm-utils';
import * as zipson from "zipson";
import Dexie, { Table } from 'dexie';

const db_ = new Dexie('DBOfLifeRestartAI');
db_.version(1).stores({
  kvs: '++id, &key, value',
  functions: '++id, &name, config',
  records: '++id, supplier, function, input, output',
  chats: '++id, title',
});
interface Database {
  records: Table<{ [key: string]: any }, number>;
  kvs: Table<{ [key: string]: any }, number>;
  chats: Table<{ [key: string]: any }, number>;
}
const db = db_ as unknown as Database;

export const load = async (key: string) => {
  const value_ = (await db.kvs.get({key}))?.value;
  if (value_ == null) { return null; }
  return zipson.parse(value_);
}
export const save = async (key: string, value: any) => {
  const value_ = zipson.stringify(value);
  await db.kvs.put({id: key, key, value: value_});
};


export const 刷新模型列表 = async (supplier: SupplierDict, form: any) => {

  const apiKeyDict = form.apiKeyDict as Record<string, string>;
  const supplierModelsDict = form.supplierModelsDict as Record<string, any>;

  try {
    const Authorization = `Bearer ${apiKeyDict[supplier.name]}`;
    console.log({supplier, apiKeyDict, Authorization});
    let res;
    try {
      const response = await fetch(`${supplier.baseUrl}${supplier.modelsUrl}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      res = { data: await response.json() };
      console.log(res);
    } catch (err_1) {
      try {
        const response = await fetch(`${supplier.baseUrl}${supplier.modelsUrl}`, {
          headers: {
            Authorization: Authorization,
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        res = { data: await response.json() };
        console.log(res);
      } catch (err_2) {
        console.warn(err_1);
        console.warn(err_2);
      }
    }
    let models = res?.data?.data??[];
    console.log({models});
    if (!models?.length) {
      models = supplier?.models??[];
    }
    const newSupplierModelsDict = {...supplierModelsDict};
    newSupplierModelsDict[supplier.name] = models;
    // Object.assign(form, {supplierModelsDict: newSupplierModelsDict});
    form.supplierModelsDict = newSupplierModelsDict;
    save("supplierForm", form);
  } catch (error) {
    console.warn(error);
  }
};

