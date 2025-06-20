import _ from "lodash";
import { markRaw, onMounted, onUnmounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Life from '@lib/life-restart/life';
import { defaultConfig } from '@lib/life-restart/defaultConfig';
import { save, load, sleep, 生成详细故事 } from '@utils/functions';
import { loadGameJsonFile } from './utils';
import { initialDemoData } from './constants';
import type { GameDemoData, MainAllocationKey, SupplierForm } from './types';
import type { TalentWithSelection } from '@lib/life-restart/talent';

export function useGameLogic() {
  const toast = useToast();

  // 游戏对象包装器
  const lifeWrapper = markRaw({
    lifeObj: null as Life | null,
  });

  // 初始化游戏对象
  onMounted(async () => {
    const lifeObj = new Life();
    await lifeObj.initial(loadGameJsonFile);
    lifeObj.config(defaultConfig);
    lifeWrapper.lifeObj = lifeObj;
    console.log("lifeWrapper.lifeObj\n", lifeWrapper.lifeObj);
    console.log("lifeWrapper.lifeObj?.lastExtendTalent\n", lifeWrapper.lifeObj?.lastExtendTalent);
  });

  // 清理游戏对象
  onUnmounted(async () => {
    lifeWrapper.lifeObj = null;
  });

  /**
   * 计算属性分配的有效值
   */
  function computeOKVal(
    key: MainAllocationKey,
    val: number,
    demoData: GameDemoData,
    propertyPoints: number,
    restPropertyPoints: number
  ): {val: number, delta: number} {
    const oldVal = demoData.allocation[key];
    const delta = val - oldVal;
    const effectiveDelta = Math.min(delta, restPropertyPoints);
    const newVal = oldVal + effectiveDelta;
    const effectiveBigNewVal = Math.min(newVal, lifeWrapper.lifeObj?.propertyAllocateLimit?.[1] ?? 10);
    const effectiveNewVal = Math.max(effectiveBigNewVal, lifeWrapper.lifeObj?.propertyAllocateLimit?.[0] ?? 0);
    const finalDelta = effectiveNewVal - oldVal;

    console.log({
      min: lifeWrapper.lifeObj?.propertyAllocateLimit?.[0]??0,
      max: lifeWrapper.lifeObj?.propertyAllocateLimit?.[1]??propertyPoints??20,
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

  /**
   * 清空游戏数据
   */
  function clearData(demoData: GameDemoData): void {
    const inheritedTalent = demoData.inheritedTalent;
    Object.assign(demoData, _.cloneDeep(initialDemoData));
    demoData.inheritedTalent = inheritedTalent;
  }

  /**
   * 更新游戏数据
   */
  function updateData(demoData: GameDemoData): void {
    const properties = lifeWrapper.lifeObj?._property?.getProperties?.();
    Object.assign(demoData.state, properties);

    demoData.state.AGE = lifeWrapper.lifeObj?._property?.get?.("AGE");
    demoData.state.LIF = lifeWrapper.lifeObj?._property?.get?.("LIF");
    demoData.state.TLT = lifeWrapper.lifeObj?._property?.get?.("TLT");
    demoData.state.EVT = lifeWrapper.lifeObj?._property?.get?.("EVT");

    console.log("properties\n", properties);
    console.log("demoData.state\n", demoData.state);
  }

  /**
   * 开始游戏
   */
  function start(demoData: GameDemoData, selectedTalents: TalentWithSelection[]): void {
    demoData.allocation.TLT = selectedTalents.map((it: TalentWithSelection) => it?.id);
    lifeWrapper.lifeObj?.start?.(demoData.allocation);
    updateData(demoData);
  }

  /**
   * 滚动到底部
   */
  function scrollToTheBottom(storyBoxRef: { value: HTMLElement | null }): void {
    const storyBox = storyBoxRef.value;
    if (!storyBox) return;
    const isNearBottom = storyBox.scrollHeight - storyBox.scrollTop - storyBox.clientHeight < 400;
    if (isNearBottom) {
      requestAnimationFrame(() => {
        storyBox.scrollTo({ top: storyBox.scrollHeight, behavior: "smooth" });
      });
    }
  }

  /**
   * 单步执行
   */
  async function step(
    demoData: GameDemoData,
    supplierForm: SupplierForm,
    storyBoxRef: { value: HTMLElement | null },
    stopAuto: () => Promise<void>,
    makeLifeSummary: () => void
  ): Promise<void> {
    scrollToTheBottom(storyBoxRef);

    if (demoData.lifeEnded) {
      await stopAuto();
      toast.add({ severity: "info", summary: "人生结束", detail: "人生结束了", life: 1500 });
      return;
    }

    const { age, content, isEnd } = lifeWrapper.lifeObj?.next?.()??{};
    console.log({ age, content, isEnd });

    demoData.lifeStory.push({ age: age ?? 0, content: content ?? [], isEnd });
    updateData(demoData);

    if (demoData.useAI && demoData.lifeStory?.length > 2) {
      await 生成详细故事(demoData, supplierForm, () => { scrollToTheBottom(storyBoxRef); });
    }

    if (isEnd) {
      demoData.lifeEnded = true;
      makeLifeSummary();
      await stopAuto();
    }
    await sleep(10);
    scrollToTheBottom(storyBoxRef);
  }

  /**
   * 开始自动播放
   */
  async function startAuto(
    demoData: GameDemoData,
    stepFn: () => Promise<void>
  ): Promise<void> {
    demoData.autoPlay = true;
    while (demoData.autoPlay) {
      await stepFn();
      await sleep(700);
    }
  }

  /**
   * 停止自动播放
   */
  async function stopAuto(demoData: GameDemoData): Promise<void> {
    demoData.autoPlay = false;
  }

  /**
   * 切换自动播放状态
   */
  function toggleAuto(
    demoData: GameDemoData,
    startAutoFn: () => Promise<void>,
    stopAutoFn: () => Promise<void>
  ): void {
    if (demoData.autoPlay) {
      stopAutoFn();
    } else {
      startAutoFn();
    }
  }

  /**
   * 生成人生总结
   */
  function makeLifeSummary(demoData: GameDemoData): void {
    const summary = lifeWrapper.lifeObj?.summary;
    console.log("summary\n", summary);
    demoData.summary = [];
    for (let ii = 0; ii < 7; ii++) {
      demoData.summary.push(summary?.[ii]);
    }
    console.log("demoData.summary\n", demoData.summary);
  }

  /**
   * 设置继承天赋的监听器
   */
  function setupInheritedTalentWatcher(demoData: GameDemoData) {
    watch(() => demoData.inheritedTalent, async (newVal, _oldVal) => {
      await save("demoData.inheritedTalent", newVal);
    });

    onMounted(async () => {
      const inheritedTalent = await load("demoData.inheritedTalent");
      if (inheritedTalent) {
        console.log("inheritedTalent\n", inheritedTalent);
        demoData.inheritedTalent = inheritedTalent;
      }
    });
  }

  return {
    lifeWrapper,
    computeOKVal,
    clearData,
    updateData,
    start,
    scrollToTheBottom,
    step,
    startAuto,
    stopAuto,
    toggleAuto,
    makeLifeSummary,
    setupInheritedTalentWatcher,
  };
}
