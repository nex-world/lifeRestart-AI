import _ from "lodash";
import { shallowReactive, ref, onMounted, onUnmounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Life from '@lib/life-restart/life';
import { defaultConfig } from '@lib/life-restart/defaultConfig';
import { save, load, sleep, 生成详细故事 } from '@utils/functions';
import { loadGameJsonFile } from './utils';
import { initialDemoData } from './constants';
import type { GameDemoData, MainAllocationKey, SupplierForm } from './types';
import type { TalentWithSelection } from '@lib/life-restart/talent';
import type { AchievementData } from '@lib/life-restart/achievement';
import type { CelebrityCharacter } from '@lib/life-restart/character';
import { useSuppliersStore } from '@stores/suppliersStore';
import {
  classifyAiFailure,
  getAiOperationMetadata,
  trackAchievementUnlocked,
  trackAnalyticsEvent,
} from '@utils/analytics';

export function useGameLogic() {
  const toast = useToast();
  const suppliersStore = useSuppliersStore();

  // 游戏对象包装器
  const lifeWrapper = shallowReactive({
    lifeObj: null as Life | null,
    ready: false,
  });
  const achievementRevision = ref(0);

  const handleAchievement = (achievement: AchievementData) => {
    trackAchievementUnlocked(achievement);
    achievementRevision.value += 1;
    toast.add({
      severity: "success",
      summary: `解锁成就：${achievement.name}`,
      detail: achievement.description,
      life: 5000,
    });
  };

  // 初始化游戏对象
  onMounted(async () => {
    const lifeObj = new Life();
    await lifeObj.initial(loadGameJsonFile);
    lifeObj.config(defaultConfig);
    lifeObj.$$on("achievement", handleAchievement);
    lifeWrapper.lifeObj = lifeObj;
    lifeWrapper.ready = true;
  });

  // 清理游戏对象
  onUnmounted(async () => {
    lifeWrapper.lifeObj?.$$off("achievement", handleAchievement);
    lifeWrapper.lifeObj = null;
    lifeWrapper.ready = false;
  });

  /**
   * 计算属性分配的有效值
   */
  function computeOKVal(
    key: MainAllocationKey,
    val: number,
    demoData: GameDemoData,
    restPropertyPoints: number
  ): {val: number, delta: number} {
    const oldVal = demoData.allocation[key];
    const delta = val - oldVal;
    const effectiveDelta = Math.min(delta, restPropertyPoints);
    const newVal = oldVal + effectiveDelta;
    const effectiveBigNewVal = Math.min(newVal, lifeWrapper.lifeObj?.propertyAllocateLimit?.[1] ?? 10);
    const effectiveNewVal = Math.max(effectiveBigNewVal, lifeWrapper.lifeObj?.propertyAllocateLimit?.[0] ?? 0);
    const finalDelta = effectiveNewVal - oldVal;

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

  function prepareClassic(demoData: GameDemoData, selectedTalents: TalentWithSelection[]): void {
    const talentIds = selectedTalents.map((talent) => String(talent.id));
    demoData.gameMode = "classic";
    demoData.selectedCharacter = null;
    demoData.allocation.TLT = talentIds;
    lifeWrapper.lifeObj?.remake(talentIds);
  }

  function drawCelebrityChoices(demoData: GameDemoData): void {
    demoData.gameMode = "celebrity";
    demoData.selectedCharacter = null;
    demoData.characterChoices = lifeWrapper.lifeObj?.characterRandom?.().normal ?? [];
  }

  function prepareCelebrity(demoData: GameDemoData, character: CelebrityCharacter): void {
    const talents = character.talent.map((talent) => ({ ...talent, selected: true }));
    const talentIds = talents.map((talent) => String(talent.id));
    demoData.gameMode = "celebrity";
    demoData.selectedCharacter = character;
    demoData.talentChoices = talents;
    demoData.usedPropertyPoints = 0;
    demoData.allocation.CHR = Number(character.property.CHR ?? 0);
    demoData.allocation.INT = Number(character.property.INT ?? 0);
    demoData.allocation.STR = Number(character.property.STR ?? 0);
    demoData.allocation.MNY = Number(character.property.MNY ?? 0);
    demoData.allocation.TLT = talentIds;
    demoData.allocation.EXT = null;
    lifeWrapper.lifeObj?.remake(talentIds);
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

  }

  /**
   * 开始游戏
   */
  function start(demoData: GameDemoData, selectedTalents: TalentWithSelection[]): void {
    if (demoData.gameMode === "classic") prepareClassic(demoData, selectedTalents);
    const allocation = {
      CHR: demoData.allocation.CHR,
      INT: demoData.allocation.INT,
      STR: demoData.allocation.STR,
      MNY: demoData.allocation.MNY,
    };
    lifeWrapper.lifeObj?.start?.(allocation);
    updateData(demoData);
  }

  function completeRun(demoData: GameDemoData): void {
    if (demoData.runCounted || !lifeWrapper.lifeObj) return;
    lifeWrapper.lifeObj.times += 1;
    demoData.runCounted = true;
    achievementRevision.value += 1;
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
    demoData.lifeStory.push({ age: age ?? 0, content: content ?? [], isEnd });
    updateData(demoData);

    if (demoData.useAI && demoData.lifeStory?.length > 2) {
      const aiMetadata = getAiOperationMetadata(
        supplierForm,
        suppliersStore.customSupplierNames,
      );
      try {
        await 生成详细故事(demoData, supplierForm, () => { scrollToTheBottom(storyBoxRef); });
        trackAnalyticsEvent({
          eventType: "ai.operation.succeeded",
          metadata: aiMetadata,
        });
      } catch (error) {
        trackAnalyticsEvent({
          eventType: "ai.operation.failed",
          metadata: {
            ...aiMetadata,
            failureType: classifyAiFailure(error),
          },
        });
        demoData.useAI = false;
        await stopAuto();
        toast.add({
          severity: "error",
          summary: "AI 讲述失败，已自动关闭",
          detail: error instanceof Error ? error.message : "你仍可继续进行原版人生模拟",
          life: 5000,
        });
      }
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
    const life = lifeWrapper.lifeObj;
    if (!life) return;
    const summary = life.summary;
    const pt = life.PropertyTypes;
    demoData.summary = [pt.SUM, pt.HAGE, pt.HCHR, pt.HINT, pt.HSTR, pt.HMNY, pt.HSPR]
      .map((type) => summary[type])
      .filter(Boolean);
    achievementRevision.value += 1;
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
        demoData.inheritedTalent = inheritedTalent;
      }
    });
  }

  return {
    lifeWrapper,
    achievementRevision,
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
    prepareClassic,
    drawCelebrityChoices,
    prepareCelebrity,
    completeRun,
    saveGame,
    loadGame,
  };

  async function saveGame(demoData: GameDemoData) {
    try {
      await save("manualSave_demoData", demoData);
      toast.add({ severity: "success", summary: "存档成功", detail: "游戏进度已保存到本地", life: 1500 });
    } catch (e) {
      console.error(e);
      toast.add({ severity: "error", summary: "存档失败", detail: "保存过程中发生错误", life: 1500 });
    }
  }

  async function loadGame(demoData: GameDemoData) {
    try {
      const savedData = await load("manualSave_demoData");
      if (savedData) {
        Object.assign(demoData, savedData);
        // 如果游戏正在进行中，尝试恢复 lifeObj 状态（虽然随机性可能导致后续不一致，但至少能维持当前显示）
        if (demoData.page === "新的人生" && !demoData.lifeEnded) {
          if (lifeWrapper.lifeObj) {
            lifeWrapper.lifeObj.start(demoData.allocation);
            // 快速推进到当前岁数
            const targetAge = demoData.lifeStory[demoData.lifeStory.length - 1]?.age ?? -1;
            let currentAge = -1;
            let safety = 0;
            while (currentAge < targetAge && safety < 200) {
              const res = lifeWrapper.lifeObj.next();
              currentAge = res.age;
              safety++;
            }
          }
        }
        toast.add({ severity: "success", summary: "读档成功", detail: "已恢复游戏进度", life: 1500 });
      } else {
        toast.add({ severity: "warn", summary: "读档失败", detail: "未找到存档数据", life: 1500 });
      }
    } catch (e) {
      console.error(e);
      toast.add({ severity: "error", summary: "读档失败", detail: "读取过程中发生错误", life: 1500 });
    }
  }
}
