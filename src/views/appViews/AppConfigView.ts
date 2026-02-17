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
  // onUnmounted,
  // nextTick,
} from 'vue';

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

import { suppliers } from 'ai-util';


import {
  // AiFunc,
  // Message,
  type SupplierDict,
} from 'ai-util';



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

    // /** hooks **/ //

    // /** data **/ //
    // const appData = reactive({
    //   ipAndCountryCode: {} as {ip?: string, code?: string},
    // });

    const supplierForm = reactive({
      selectedSupplier: suppliers[0] as SupplierDict,
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
      return [
        {name: DEFAULT_MODEL.label},
        ...availableModels.value.map((model)=>({name: model?.label??model?.name??model?.id})),
      ];
    });


    // /** methods **/ //


    // /** lifecycle **/ //
    onMounted(async ()=>{
      // appData.ipAndCountryCode = await getIpAndCountryCode();

      const supplierForm_ = await load("supplierForm");
      if (supplierForm_!=null) { Object.assign(supplierForm, supplierForm_); }

    });



    return ()=>{
      return [

        vnd(Panel, { header: "模型配置", toggleable: true, class: "my-1.5rem! col" }, {
          default: () => vnd("div", {class: "stack-v"}, [

            vnd(Select, {
              name: "supplier",
              options: suppliers,
              optionLabel: "name",
              placeholder: "选择供应商",
              fluid: true,
              modelValue: supplierForm.selectedSupplier,
              "onUpdate:modelValue": (value: SupplierDict) => { supplierForm.selectedSupplier = value; },
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
              vnd(ToolButton, { icon: "pi pi-trash", label: "刷新", command: ()=>{
                刷新模型列表(supplierForm.selectedSupplier, supplierForm);
              }}),
            ]),

            vnd(ToolButton, { size: "small", icon: "pi pi-trash", label: "debug", command: ()=>{
              console.log({supplierForm, selectedModel: selectedModel.value});
            }}),

          ]),
        }),

      ];
    };
  }
})

export default AppConfigView;
