/* eslint-disable @typescript-eslint/no-explicit-any */
// @unocss-include

// import _ from 'lodash';
// import clipboard from "clipboard";


import {
  h as vnd, defineComponent,
  // ref,
  reactive,
  computed,
  onMounted,
  watch,
  // onUnmounted,
  // nextTick,
} from 'vue';

import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';

// import Card from 'primevue/card';
import Panel from 'primevue/panel';
import Select from 'primevue/select';
// import Slider from 'primevue/slider';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
// import FloatLabel from 'primevue/floatlabel';
// import ToggleSwitch from 'primevue/toggleswitch';
// import Message from 'primevue/message';
// import Fieldset from 'primevue/fieldset';
import ToolButton from '@components/shared/ToolButton';
import CustomSupplierPanel from './config/CustomSupplierPanel.vue';
import { appVersion } from '@src/--CONFIGS';
import { useSuppliersStore } from '@stores/suppliersStore';
// import Bubble from "@components/chat/Bubble";

// import { useToast } from 'primevue/usetoast';
// import { useConfirm } from "primevue/useconfirm";

// import db_ from '@src/db';
// import { Table } from 'dexie';
// interface Database {
//   records: Table<{ [key: string]: any }, number>;
//   kvs: Table<{ [key: string]: any }, number>;
//   chats: Table<{ [key: string]: any }, number>;
// }
// const db = db_ as unknown as Database;

import {
  // AiFunc,
  // Message,
  type SupplierDict,
} from 'llm-utils';



export const DEFAULT_MODEL = {label:"[[<DEFAULT>]]"};

import {
  save,
  load,
  // getIpAndCountryCode,
  刷新模型列表,
} from '@utils/functions';


/**
 * @file
 */



type ModelDict = {name?: string, label?: string, id?: string|number};





export const tableTextarea = (
  form: any,
  title: string,
  key: string,
  saveTo: string,
  placeholder: string=title,
  props?: any,
) => {
  return [
    vnd("div", { class: "opacity-80 fw-500" }, title),
    vnd(Textarea, { class: "w-full",
      placeholder: placeholder,
      ...props,
      modelValue: form?.[key],
      "onUpdate:modelValue": (value: string) => {
        form[key] = value;
        save(saveTo, form);
      },
    }),
  ];
};





const AppConfigView = defineComponent({
  name: "AppConfigView",
  setup() {

    const toast = useToast();
    const suppliersStore = useSuppliersStore();
    const { allSuppliers } = storeToRefs(suppliersStore);

    // /** hooks **/ //

    // /** data **/ //
    // const appData = reactive({
    //   ipAndCountryCode: {} as {ip?: string, code?: string},
    // });

    const supplierForm = reactive({
      selectedSupplier: allSuppliers.value[0] as SupplierDict,
      apiKeyDict: {} as Record<string, string>,
      supplierModelsDict: {} as Record<string, ModelDict[]>,
      selectedModelDict: {} as Record<string, ModelDict>,
    });

    // /** computed **/ //

    const selectedModel = computed(()=>{
      const defaultModel = {name: supplierForm.selectedSupplier?.defaultModel};
      if (supplierForm.selectedModelDict[supplierForm.selectedSupplier?.name]?.name==DEFAULT_MODEL.label) {
        return defaultModel;
      }
      return supplierForm.selectedModelDict[supplierForm.selectedSupplier.name]??defaultModel;
    });
    // const selectedModelName = computed(()=>{ return selectedModel.value?.name??DEFAULT_MODEL.label; });
    const availableModels = computed(()=>{
      return supplierForm.supplierModelsDict[supplierForm.selectedSupplier?.name]??[];
    });
    const availableModelOptions = computed(()=>{
      const names = [
        supplierForm.selectedSupplier?.defaultModel,
        ...availableModels.value.map((model)=>model?.label??model?.name??model?.id),
      ].filter((name)=>name!=null && String(name).trim().length>0).map(String);
      return Array.from(new Set(names)).map((name)=>({name}));
    });


    // /** methods **/ //

    const persistForm = () => { void save("supplierForm", supplierForm); };

    const reconcileSelectedSupplier = (preferredName?: string) => {
      const currentName = preferredName ?? supplierForm.selectedSupplier?.name;
      supplierForm.selectedSupplier = allSuppliers.value.find((supplier)=>supplier.name===currentName) ?? allSuppliers.value[0];
    };

    const refreshModels = async () => {
      try {
        const models = await 刷新模型列表(supplierForm.selectedSupplier, supplierForm);
        toast.add({
          severity: models.length ? "success" : "warn",
          summary: models.length ? "模型列表已刷新" : "未获得模型列表",
          detail: models.length ? `共 ${models.length} 个模型` : "可继续使用供应商默认模型",
          life: 2500,
        });
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "刷新失败",
          detail: error instanceof Error ? error.message : "无法获取模型列表",
          life: 4000,
        });
      }
    };

    const handleSuppliersChanged = (payload?: {removedName?: string}) => {
      if (payload?.removedName) {
        delete supplierForm.apiKeyDict[payload.removedName];
        delete supplierForm.supplierModelsDict[payload.removedName];
        delete supplierForm.selectedModelDict[payload.removedName];
      }
      reconcileSelectedSupplier();
      persistForm();
    };


    // /** lifecycle **/ //
    onMounted(async ()=>{
      // appData.ipAndCountryCode = await getIpAndCountryCode();

      const supplierForm_ = await load("supplierForm");
      if (supplierForm_!=null) { Object.assign(supplierForm, supplierForm_); }
      reconcileSelectedSupplier(supplierForm_?.selectedSupplier?.name);

    });

    watch(allSuppliers, ()=>reconcileSelectedSupplier(), {deep: true});



    return ()=>{
      return [

        vnd(Panel, { header: "应用信息", class: "my-1.5rem! col" }, {
          default: () => vnd("div", {class: "text-sm opacity-70"}, `版本 v${appVersion}`),
        }),

        vnd(Panel, { header: "模型配置", toggleable: true, class: "my-1.5rem! col" }, {
          default: () => vnd("div", {class: "stack-v"}, [

            vnd(Select, {
              name: "supplier",
              options: allSuppliers.value,
              optionLabel: "name",
              placeholder: "选择供应商",
              fluid: true,
              modelValue: supplierForm.selectedSupplier,
              "onUpdate:modelValue": (value: SupplierDict) => {
                supplierForm.selectedSupplier = value;
                persistForm();
              },
            }),

            vnd(InputText, {
              type: "password",
              name: "apiKey",
              placeholder: "API Key",
              fluid: true,
              modelValue: supplierForm.apiKeyDict[supplierForm.selectedSupplier?.name],
              "onUpdate:modelValue": (value: string) => {
                supplierForm.apiKeyDict[supplierForm.selectedSupplier.name] = value;
                save("supplierForm", supplierForm);
              },
            }),

            vnd("div", {class: "stack-h w-full"}, [
              vnd(Select, {
                name: "model",
                options: availableModelOptions.value,
                optionLabel: "name",
                placeholder: "选择模型",
                class: "grow-1",
                modelValue: selectedModel.value,
                "onUpdate:modelValue": (value: ModelDict) => {
                  supplierForm.selectedModelDict[supplierForm.selectedSupplier.name] = value;
                  save("supplierForm", supplierForm);
                },
              }),
              vnd(ToolButton, { icon: "pi pi-refresh", label: "刷新模型", command: refreshModels }),
            ]),

            vnd("div", {class: "text-xs opacity-55"}, "API Key 与供应商配置只保存在当前浏览器，并由浏览器直接请求相应模型服务。"),

          ]),
        }),

        vnd(CustomSupplierPanel, { onChanged: handleSuppliersChanged }),

      ];
    };
  }
})

export default AppConfigView;
