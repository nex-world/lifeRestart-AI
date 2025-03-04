// @unocss-include

import _ from "lodash";

import {
  h as vnd, defineComponent,
  ref,
  reactive,
  markRaw,
  computed,
  onMounted,
  onUnmounted,
  watch,
  // nextTick,
} from 'vue';

// import Textarea from 'primevue/textarea';
// import InputNumber from 'primevue/inputnumber';
import Tag from 'primevue/tag';
import Panel from 'primevue/panel';
import Message from 'primevue/message';
import ToolButton from '@components/shared/ToolButton';
import { useToast } from 'primevue/usetoast';

import {
  save,
  load,
} from '@utils/functions';

import Life from '@lib/life-restart/life';
import { defaultConfig } from '@lib/life-restart/defaultConfig';
import { i18n } from '@lib/life-restart';

const DDDD = true;

const SD = i18n["zh-cn"];
function SDT(ss: string) {
  return SD[ss as keyof (typeof SD)] ?? ss;
}
const PropSD = {
  SUM: "总评",
  HAGE: "享年",

  HCHR: "颜值",
  HINT: "智力",
  HSTR: "体质",
  HMNY: "家境",

  HSPR: "快乐",
};
function PropSDT(ss: string) {
  return PropSD[ss as keyof (typeof PropSD)] ?? ss;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;


async function loadGameJsonFile(key: string) {
  const val = (await import(`../../data/${key}.json`)).default;
  return _.cloneDeep(val);
}

const pageMap = { "": "立即重开", };
const pageM = (ss: string) => pageMap?.[ss as keyof (typeof pageMap)] ?? ss;


const initialDemoData = {
  processing: false,
  page: "",

  autoPlay: false,
  autoFunctionIdx: null as number|null,

  talentChoices: [] as Any[],

  usedPropertyPoints: 0,

  allocation: {
    CHR: 0,
    INT: 0,
    STR: 0,
    MNY: 0,

    TLT: [] as Any[],

    EXT: null as number|string|null,
  },

  state: {} as Any,

  summary: [] as Any[],

  lifeStory: [] as Any[],

  lifeEnded: false,

  inheritedTalent: null as Any,
};
type MainAllocationKey = "CHR"|"INT"|"STR"|"MNY";

function makeGradeClasses(grade?: number) {
  return [
    grade==0?"bg-gray-600! text-gray-100!":null,
    grade==1?"bg-blue-600! text-blue-100!":null,
    grade==2?"bg-purple-600! text-purple-100!":null,
    grade==3?"bg-orange-600! text-orange-100!":null,
  ];
}






const AppGameView = defineComponent({
  name: "AppGameView",
  setup() {

    const toast = useToast();

    const storyBoxRef = ref<HTMLElement|null>(null);

    // /** data **/ //
    const demoData = reactive(_.cloneDeep(initialDemoData));
    const selectedTalents = computed(() => demoData.talentChoices.filter((talent: Any) => talent.selected));
    const pageV = computed(() => pageM(demoData.page));
    const propertyPoints = computed(() => lifeWrapper.lifeObj?.getPropertyPoints?.() ?? lifeWrapper.lifeObj?._defaultPropertyPoints ?? 0);
    const restPropertyPoints = computed(() => propertyPoints.value - demoData.usedPropertyPoints);

    const lifeWrapper = markRaw({
      lifeObj: null as Life|Any,
    });

    onMounted(async () => {
      const lifeObj = new Life();
      await lifeObj.initial(loadGameJsonFile);
      lifeObj.config(defaultConfig);

      lifeWrapper.lifeObj = lifeObj;
      console.log("lifeWrapper.lifeObj\n", lifeWrapper.lifeObj);
      console.log("lifeWrapper.lifeObj?.lastExtendTalent\n", lifeWrapper.lifeObj?.lastExtendTalent);
      /** @TODO 检查一下 lastExtendTalent 如果是 undefined 则要修正 */
    });
    onUnmounted(async () => {
      lifeWrapper.lifeObj = null;
    });
    watch(()=>demoData.inheritedTalent, async (newVal, _oldVal)=>{
      save("demoData.inheritedTalent", newVal);
    });
    onMounted(async () => {
      const inheritedTalent = await load("demoData.inheritedTalent");
      if (inheritedTalent) {
        console.log("inheritedTalent\n", inheritedTalent);
        demoData.inheritedTalent = inheritedTalent;
      }
    });

    function computeOKVal (key: MainAllocationKey, val: number) {
      const oldVal = demoData.allocation[key];

      const delta = val - oldVal;
      const effectiveDelta = Math.min(delta, restPropertyPoints.value);

      const newVal = oldVal + effectiveDelta;
      const effectiveBigNewVal = Math.min(newVal, lifeWrapper.lifeObj?.propertyAllocateLimit?.[1]);
      const effectiveNewVal = Math.max(effectiveBigNewVal, lifeWrapper.lifeObj?.propertyAllocateLimit?.[0]);

      const finalDelta = effectiveNewVal - oldVal;

      console.log({
        min: lifeWrapper.lifeObj?.propertyAllocateLimit?.[0]??0,
        max: lifeWrapper.lifeObj?.propertyAllocateLimit?.[1]??propertyPoints.value??20,
        val,
        oldVal,
        delta,
        effectiveDelta,
        newVal,
        effectiveBigNewVal,
        effectiveNewVal,
        finalDelta,
      });

      return {val: effectiveNewVal, delta: finalDelta};
    }

    function clearData() {
      const inheritedTalent = demoData.inheritedTalent;
      // lifeWrapper.lifeObj?.talentExtend?.(String(inheritedTalent?.id));
      Object.assign(demoData, _.cloneDeep(initialDemoData));
      demoData.inheritedTalent = inheritedTalent;
    }

    function updateData() {
      const properties = lifeWrapper.lifeObj?._property?.getProperties?.();
      Object.assign(demoData.state, properties);

      demoData.state.AGE = lifeWrapper.lifeObj?._property?.get?.("AGE");
      demoData.state.LIF = lifeWrapper.lifeObj?._property?.get?.("LIF");
      demoData.state.TLT = lifeWrapper.lifeObj?._property?.get?.("TLT");
      demoData.state.EVT = lifeWrapper.lifeObj?._property?.get?.("EVT");

      // demoData.lifeStory = demoData.state.EVT.map((it: Any) => {
      //   return lifeWrapper.lifeObj?._event?.get?.(it as string);
      // });

      console.log("properties\n", properties);
      console.log("demoData.state\n", demoData.state);
      // console.log("demoData.lifeStory\n", demoData.lifeStory);
    }
    function start() {
      demoData.allocation.TLT = selectedTalents.value.map(it=>it?.id);
      lifeWrapper.lifeObj?.start?.(demoData.allocation);
      updateData();
    }
    function step() {

      if (demoData.lifeEnded) {
        stopAuto();
        toast.add({ severity: "info", summary: "人生结束", detail: "人生结束了", life: 1500 });
        return;
      }

      const { age, content, isEnd } = lifeWrapper.lifeObj?.next?.()??{};
      console.log({ age, content, isEnd });

      demoData.lifeStory.push({ age, content, isEnd });

      storyBoxRef.value?.scrollTo?.({ top: storyBoxRef?.value?.scrollHeight, behavior: "smooth" });

      if (isEnd) {
        demoData.lifeEnded = true;
        makeLifeSummary();
      }

      updateData();
    }
    function startAuto() {
      demoData.autoPlay = true;
      const interval = setInterval(() => {
        if (demoData.autoPlay) {
          step();
        } else {
          clearInterval(interval);
        }
      }, 250);
      demoData.autoFunctionIdx = interval;
    }
    function stopAuto() {
      demoData.autoPlay = false;
      clearInterval(demoData.autoFunctionIdx as number);
      demoData.autoFunctionIdx = null;
    }
    function toggleAuto() {
      if (demoData.autoPlay) {
        stopAuto();
      } else {
        startAuto();
      }
    }
    function makeLifeSummary() {
      const summary = lifeWrapper.lifeObj?.summary;
      console.log("summary\n", summary);
      demoData.summary = [];
      for (let ii=0; ii<7; ii++) {
        demoData.summary.push(summary?.[ii]);
      }
      console.log("demoData.summary\n", demoData.summary);
    }






    return ()=>{
      return vnd("div", {
      }, [

        vnd(Panel, { header: pageV.value??"游戏", class: "my-1.5rem! col" }, {
          default: () => vnd("div", {class: "stack-v"}, [

            pageV.value=="立即重开"
            ?[
              vnd("div", {class: "stack-h"}, [
                vnd(ToolButton, { label: "立即重开", icon: "pi pi-refresh", class: "",
                  onClick: async () => {
                    lifeWrapper.lifeObj?.remake?.([]);
                    demoData.page = "选择模式";
                  },
                }),
              ]),
            ]:pageV.value=="选择模式"
            ?[
              vnd("div", {class: "stack-h justify-center! justify-items-center! items-center!"}, [
                vnd(ToolButton, { label: "经典模式", class: "",
                  onClick: async () => {
                    demoData.page = "天赋抽卡预备";
                  },
                }),
                "10连抽天赋，自由分配属性",
              ]),
              vnd("div", {class: "stack-h justify-center! justify-items-center! items-center!"}, [
                vnd(ToolButton, { label: "名人模式", class: "",
                  onClick: async () => {
                    // demoData.page = "名人模式";
                    toast.add({ severity: "warn", summary: "开发中", detail: "敬请期待", life: 1500 });
                  },
                }),
                "前世是古代名人，重开到了现代",
              ]),
            ]:pageV.value=="天赋抽卡预备"?[
              vnd("div", {class: "stack-h"}, [
                vnd(ToolButton, { label: "10连抽!", icon: "pi pi-refresh", class: "",
                  onClick: async () => {
                    demoData.page = "天赋抽卡";
                    if (demoData.inheritedTalent?.id) {
                      console.log("demoData.inheritedTalent\n", demoData.inheritedTalent);
                      lifeWrapper.lifeObj?.talentExtend?.(String(demoData.inheritedTalent?.id));
                    }
                    demoData.talentChoices = lifeWrapper.lifeObj?.talentRandom?.() ?? [];
                  },
                }),
              ]),
            ]:pageV.value=="天赋抽卡"?[

              vnd("div", {class: ["stack-h", selectedTalents.value.length==lifeWrapper.lifeObj?.talentSelectLimit?"flex-row-reverse!":null]}, [
                vnd(ToolButton, { label: "随机选择（已选的不会保留）", icon: "pi pi-arrow-right-arrow-left", class: "",
                  onClick: async () => {
                    demoData.talentChoices.forEach((talent: Any) => talent.selected = false);
                    const selected = _.sampleSize(demoData.talentChoices, lifeWrapper.lifeObj?.talentSelectLimit);
                    selected.forEach((talent: Any) => talent.selected = true);
                  },
                }),
                vnd(ToolButton, {
                  label: selectedTalents.value.length >= lifeWrapper.lifeObj?.talentSelectLimit ? "下一步" : `请选择${lifeWrapper.lifeObj?.talentSelectLimit}个天赋`,
                  class: "",
                  onClick: async () => {
                    if (selectedTalents.value.length != lifeWrapper.lifeObj?.talentSelectLimit) {
                      toast.add({ severity: "warn", summary: "天赋选择", detail: "请选择正确数量的天赋", life: 1500 });
                      return;
                    }
                    // lifeWrapper.lifeObj?.start?.({});
                    // const contents = lifeWrapper.lifeObj?.doTalent(selectedTalents.value.map(it=>it?.id));
                    console.log("lifeObj\n", lifeWrapper.lifeObj);
                    // console.log("contents\n", contents);
                    demoData.page = "调整初始属性";
                  },
                }),
              ]),
              vnd(ToolButton, { label: "重抽（已选的不会保留）", icon: "pi pi-refresh", class: "",
                onClick: async () => {
                  demoData.talentChoices = lifeWrapper.lifeObj?.talentRandom?.() ?? [];
                },
              }),

              demoData.talentChoices.map((talent: Any, idx: number)=>vnd(ToolButton, {
                key: `[${idx}]${talent?.name}`,
                label: `${talent?.name}（${talent?.description}）${talent?.selected?"【已选】":""}`,
                class: [
                  makeGradeClasses(talent?.grade),
                  talent?.selected?"border-red-500! text-red-100!":"",
                ],
                onClick: async () => {
                  if (selectedTalents.value.length >= lifeWrapper.lifeObj?.talentSelectLimit && !talent.selected) {
                    toast.add({ severity: "warn", summary: "天赋选择", detail: "天赋选择数量已达上限", life: 1500 });
                    return;
                  }
                  talent.selected = !talent.selected;
                },
              })),

            ]:pageV.value=="调整初始属性"?[

              vnd("div", {class: ["stack-h", restPropertyPoints.value==0?"flex-row-reverse!":null]}, [
                vnd(ToolButton, { label: "随机分配", icon: "pi pi-asterisk", class: "",
                  onClick: async () => {
                    demoData.usedPropertyPoints = 0;
                    demoData.allocation.CHR = 0;
                    demoData.allocation.INT = 0;
                    demoData.allocation.STR = 0;
                    demoData.allocation.MNY = 0;
                    const totalPoints = propertyPoints.value??20;  // 20
                    // 将 totalPoints 随机分配到 demoData.allocation 中
                    const keys = Object.keys(demoData.allocation);  // ["CHR", "INT", "STR", "MNY"]
                    for (let i = 0; i < totalPoints; i++) {
                      const key = _.sample(keys) as string;
                      if (demoData.allocation[key as MainAllocationKey] >= lifeWrapper.lifeObj?.propertyAllocateLimit?.[1]) {
                        i -= 1;
                        continue;
                      }
                      demoData.allocation[key as MainAllocationKey] += 1;
                      demoData.usedPropertyPoints += 1;
                    }
                  },
                }),
                vnd(ToolButton, {
                  label: "开始新人生",
                  class: "",
                  onClick: async () => {
                    if (restPropertyPoints.value != 0) {
                      toast.add({ severity: "warn", summary: "属性点分配", detail: `你还有${restPropertyPoints.value}个属性点没有分配完！`, life: 1500 });
                      return;
                    }
                    demoData.page = "新的人生";
                    start();
                  },
                }),
              ]),

              `剩余属性点：${restPropertyPoints.value}`,
              // InputNumber

              [["CHR", "颜值"], ["INT", "智力"], ["STR", "体质"], ["MNY", "家境"]].map(([key, label], idx)=>vnd("div", {class: "stack-h justify-center! justify-items-center! items-center!", key: `[${idx}]${key}`}, [

                `${label}：`,
                vnd(ToolButton, { icon: "pi pi-minus", class: "",
                  onClick: async () => {
                    const min = lifeWrapper.lifeObj?.propertyAllocateLimit?.[0]??0;
                    const targetVal = Math.max(min, demoData.allocation[key as MainAllocationKey] - 1);
                    const {val: newVal, delta} = computeOKVal(key as MainAllocationKey, targetVal);
                    demoData.usedPropertyPoints += delta;
                    demoData.allocation[key as MainAllocationKey] = newVal;
                  },
                }),
                `${demoData.allocation[key as MainAllocationKey]}`,
                vnd(ToolButton, { icon: "pi pi-plus", class: "",
                  onClick: async () => {
                    const max = lifeWrapper.lifeObj?.propertyAllocateLimit?.[1]??propertyPoints.value??20;
                    const targetVal = Math.min(max, demoData.allocation[key as MainAllocationKey] + 1);
                    const {val: newVal, delta} = computeOKVal(key as MainAllocationKey, targetVal);
                    demoData.usedPropertyPoints += delta;
                    demoData.allocation[key as MainAllocationKey] = newVal;
                  },
                }),

              ])),

              "已选天赋：",
              selectedTalents.value.map((talent: Any, idx)=>vnd(ToolButton, {
                key: `[${idx}]${talent?.name}`,
                label: `${talent?.name}（${talent?.description}）`,
                class: [
                  makeGradeClasses(talent?.grade),
                ],
              })),

            ]:pageV.value=="新的人生"?[

              vnd("div", {class: "stack-h"}, [
                vnd(ToolButton, { label: "人生总结", icon: "pi pi-list-check", class: [!demoData.lifeEnded?"hidden!":null], onClick: async () => {
                  demoData.page = "人生总结";
                }, }),
                vnd(ToolButton, { label: demoData.autoPlay?"停止":"自动", icon: "pi pi-arrow-circle-right", class: [demoData.lifeEnded?"hidden!":null], onClick: async () => { toggleAuto(); }, }),
                vnd(ToolButton, { label: "下一年", icon: "pi pi-arrow-right", class: [demoData.lifeEnded?"hidden!":null], onClick: async () => { step(); }, }),
              ]),

              vnd("div", {class: "stack-h"}, [
                [["CHR", "颜值"], ["INT", "智力"], ["STR", "体质"], ["MNY", "家境"], ["SPR", "快乐"]].map(([key, label], idx)=>vnd("div", {class: "p-panel stack-v p-0.25rem justify-center! items-center!", key: `[${idx}]${key}`}, [
                  vnd("div", {}, label),
                  vnd("div", {}, demoData.state[key]),
                ])),
              ]),


              vnd("div", {
                id: "life-story-box",
                ref: storyBoxRef,
                class: "p-panel p-0.5rem max-h-50svh w-full overflow-auto",
              }, [
                demoData.lifeStory.map((thing: Any, idx: number)=>vnd("div", {
                  key: `[${idx}]${thing?.age}`,
                  onClick: ()=>{ console.log(thing); },
                  class: "stack-v mt-0.5rem mb-0.25rem",
                }, [
                  vnd("div", {}, `${thing?.age}岁`),
                  (thing?.content??[]).map((it: Any, idx: number)=>vnd("div", {
                    key: `[${idx}]${it?.name}`,
                  }, [
                    it?.type!="TLT"?null:
                    vnd(Message, {severity: "secondary", class: [makeGradeClasses(it?.grade)]}, {default:()=>`天赋【${it?.name}】发动：${it?.description}`}),
                    it?.type!="EVT"?null:
                    vnd(Message, {severity: "secondary", class: [makeGradeClasses(it?.grade)]}, {default:()=>`${it?.description} ${it?.postEvent??""}`}),
                  ])),
                ]))
              ]),

            ]:pageV.value=="人生总结"?[

              vnd("div", {class: "stack-h"}, [
                vnd(ToolButton, { label: "再次重开", icon: "pi pi-refresh", class: "",
                  onClick: async () => {
                    const found = (selectedTalents.value??[]).find((it: Any) => it?.name==demoData.inheritedTalent?.name);
                    if (!found) {
                      demoData.inheritedTalent = null;
                      lifeWrapper.lifeObj?.talentExtend?.(null);
                    }
                    console.log("demoData.summary\n", demoData.summary);
                    clearData();
                    demoData.page = "";
                  },
                }),
              ]),

              demoData.summary.map((it: Any, idx: number)=>vnd(Tag, {
                key: `[${idx}]${it?.prop}`,
                class: makeGradeClasses(it?.grade),
              }, {
                default: () => `${PropSDT(it?.prop??"")}：${it?.value??""} ${SDT(it?.judge??"")}`,
              })),

              "天赋：你可以选择一个，下辈子还能抽到",
              selectedTalents.value.map((talent: Any, idx)=>vnd(ToolButton, {
                key: `[${idx}]${talent?.name}`,
                label: `${talent?.name}（${talent?.description}）${demoData.inheritedTalent?.name==talent?.name?"【已选】":""}`,
                class: [
                  makeGradeClasses(talent?.grade),
                  demoData.inheritedTalent?.name==talent?.name?"border-red-500! text-red-100!":"",
                ],
                onClick: async () => {
                  if (demoData.inheritedTalent?.name==talent?.name) {
                    demoData.inheritedTalent = null;
                    lifeWrapper.lifeObj?.talentExtend?.(null);
                    return;
                  }
                  demoData.inheritedTalent = talent;
                  lifeWrapper.lifeObj?.talentExtend?.(String(talent?.id));
                },
              })),

            ]:

            vnd("div", {class: "stack-h"}, []),
          ]),
        }),

        DDDD?null:
        vnd(Panel, { header: "其他", toggleable: true, class: "my-1.5rem! col" }, {
          default: () => vnd("div", {class: "stack-v"}, [

            vnd("div", {class: "stack-h"}, [
              vnd(ToolButton, { tip: "成就相关操作", label: "成就", icon: "pi pi-trophy", class: "",
                onClick: async () => {
                  toast.add({ severity: "warn", summary: "开发中", detail: "敬请期待", life: 1500 });
                },
              }),
              vnd(ToolButton, { tip: "排行榜相关操作", label: "排行榜", icon: "pi pi-sort-amount-up", class: "",
                onClick: async () => {
                  toast.add({ severity: "info", summary: "排行榜", detail: "别卷了，没有排行榜", life: 3000 });
                },
              }),
            // ]),
            // vnd("div", {class: "stack-h"}, [
              vnd(ToolButton, { tip: "存档相关操作", label: "存档", icon: "pi pi-save", class: "",
                onClick: async () => {
                  toast.add({ severity: "warn", summary: "开发中", detail: "敬请期待", life: 1500 });
                },
              }),
            ]),

          ]),
        }),


      ]);
    };
  }
})

export default AppGameView;
