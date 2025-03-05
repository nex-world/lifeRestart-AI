/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SupplierDict, LifeCycleFns } from 'llm-utils';
import { LLMClient, LLMRole } from 'llm-utils';
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

export const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({});
    }, ms);
  });
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

export const 人生故事讲述者提示词 = `
你是人生故事讲述者，
你的任务是根据用户提供的「之前的人生故事」以及「当下的人生属性」和「当下的故事概述」，对「当下的人生故事」进行展开讲述。你的讲述不要超过5句话。

#### 基本要求
- 「之前的人生故事」以及「当下的故事概述」之中的主语是“你”，表示主角。
- 在「当下的故事概述」中，可能会描述与主角自身有关的事件，也可能描述与主角本身无关的外部事件。
- 如果与主角自身有关，你需要结合「之前的人生故事」和「当下的人生属性」来细化主角当下的体验、感受、感悟、思考等。
- 如果与主角本身无关，你也要根据主角的「当下的人生属性」以及性格、经历、价值观等来描述主角对这些事件的态度、看法、反应等。
- 你的讲述虽然只有不超过5句话，但是要提供足够的细节，让人觉得很生动、很真实。

#### 关于人生属性
- 分为「颜值、智力、体质、家境、快乐」5个维度。
- 每个维度的一般范围是0~10，10表示非常好，0表示非常差。如果超出范围，则表示更加夸张的好或差。

#### 注意事项
- 你展开讲述的内容不要超过5句话。
- 你只能讲述「当下的故事概述」之中的故事，而不能自行添加新的故事情节。
- 除了故事内容，你不应该回复任何其他内容。
- 如果你看不懂「当下的故事概述」，说明这对于主角来说也是一段无法理解的记忆，你需要从主角的视角对这种情形的原因作出猜测，作为讲述内容。
- 如果「当下的故事概述」之中没有内容，那么你只要回复“（空）”即可。
`.trim();

type AgeStory = { age: number, content: any[], output: any };
type StoryItem = { brief: string, output: any };
export function 制作年岁故事输入(ageStory: AgeStory): StoryItem {
  const { age, content, output } = ageStory;
  const ageLine = `这一年你${age}岁。`;
  const lines = ((content??[])as any[]).map(it=>{
    if (it?.type=="TLT") { return `天赋【${it?.name}】发动：${it?.description}`; }
    if (it?.type=="EVT") { return `${it?.description} ${it?.postEvent??""}`; }
  });
  return {brief: `${ageLine}\n${lines.join("\n")}`, output};
};
export function 制作人生故事输入(demoData:{lifeStory: AgeStory[], state: any}) {
  const 属性文本 = [["CHR", "颜值"], ["INT", "智力"], ["STR", "体质"], ["MNY", "家境"], ["SPR", "快乐"]].map(([key, label])=> `${label}:${demoData.state?.[key]}`).join("\n");
  const items = demoData.lifeStory.map(制作年岁故事输入);
  const last = items.pop() as StoryItem;
  const lines = items.map(it=>it.output??it.brief);
  lines.unshift("==========[之前的人生故事]==========");
  lines.push("==========[当下的人生属性]==========");
  lines.push(属性文本);
  lines.push("==========[当下的故事概述]==========");
  lines.push(last?.brief??"");
  return lines.join("\n\n");
};

export async function 生成详细故事<CR, TT>(demoData: any, supplierForm: any, onAfterUpdate?: any) {

  demoData.processing = true;

  demoData.thinking = "";
  demoData.output = "";
  const thinkingSpans = [] as string[];
  const outputSpans = [] as string[];

  const initialResult = {} as CR;

  const llmOps = {
    baseURL: supplierForm?.selectedSupplier?.baseUrl,
    apiKey: supplierForm?.apiKeyDict[supplierForm?.selectedSupplier?.name],
    defaultModel: supplierForm?.selectedModelDict?.[supplierForm?.selectedSupplier?.name]?.name,
  };
  const llmClient = new LLMClient(llmOps);

  const lifeCycleFns: LifeCycleFns<CR, TT> = {
    chunkProcessor: async (_result, delta) => {
      // console.log("delta", delta);
      if (delta.reasoning_content) {
        thinkingSpans.push(delta.reasoning_content);
        demoData.thinking = thinkingSpans.join("");
      }
      if (delta.content) {
        outputSpans.push(delta.content);
        demoData.output = outputSpans.join("");
        const lastItem = demoData?.lifeStory?.[(demoData?.lifeStory?.length??0)-1];
        if (lastItem) {
          lastItem.output = demoData.output;
        }
      }
      return delta as CR;
    },
    resultProcessor: async (result) => {
      // const lastItem = demoData?.lifeStory?.[(demoData?.lifeStory?.length??0)-1];
      // if (lastItem) {
      //   lastItem.output = demoData.output;
      // }
      return result as any;
    },
    onAfterUpdate: async () => {
      await onAfterUpdate?.();
    },
  };


  const generator = llmClient.chatWithLifeCycle(
    人生故事讲述者提示词,
    [{role: "user" as LLMRole.User, content: 制作人生故事输入(demoData)}],

    initialResult,
    {
      max_tokens: 2000,
      // presence_penalty: 0.06,
      // temperature: 0.7,
      temperature: 1,
    },
    lifeCycleFns,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for await (const _chunk of generator) {
    // console.log("_chunk", _chunk);
    // do nothing
  }

  demoData.processing = false;
}

