// @unocss-include

import _ from "lodash";
import { h as vnd, defineComponent, reactive, ref, onDeactivated } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import Panel from 'primevue/panel';
import ToolButton from '@components/shared/ToolButton';

// 导入拆分后的模块
import { useGameLogic } from './game/useGameLogic';
import { useGameUI } from './game/useGameUI';
import { initialDemoData, pageM } from './game/constants';
import type { GameMode, MainAllocationKey } from './game/types';
import type { CelebrityCharacter } from '@lib/life-restart/character';

// 导入页面组件
import RestartPage from './game/pages/RestartPage.vue';
import ModePage from './game/pages/ModePage.vue';
import TalentPreparePage from './game/pages/TalentPreparePage.vue';
import TalentSelectionPage from './game/pages/TalentSelectionPage.vue';
import PropertyAllocationPage from './game/pages/PropertyAllocationPage.vue';
import LifePage from './game/pages/LifePage.vue';
import SummaryPage from './game/pages/SummaryPage.vue';
import CelebritySelectionPage from './game/pages/CelebritySelectionPage.vue';
import AchievementsDialog from './game/AchievementsDialog.vue';

import AppTavernView from './AppTavernView';
import { trackAnalyticsEvent } from '@utils/analytics';

type LifePageInstance = ComponentPublicInstance & {
  storyBoxRef?: HTMLElement | null;
};

const AppGameView = defineComponent({
  name: "AppGameView",
  setup() {
    // 游戏数据
    const demoData = reactive(_.cloneDeep(initialDemoData));
    const achievementsVisible = ref(false);
    onDeactivated(() => { achievementsVisible.value = false; });

    // 初始化游戏逻辑钩子
    const gameLogic = useGameLogic();
    gameLogic.setupInheritedTalentWatcher(demoData);

    // 初始化UI钩子
    const gameUI = useGameUI(demoData, gameLogic.lifeWrapper);

    // 页面切换处理
    const handlePageChange = (page: string) => {
      if (page === "调整初始属性") {
        gameLogic.prepareClassic(demoData, gameUI.selectedTalents.value);
      }
      demoData.page = page;
      if (page === "新的人生") {
        gameLogic.start(demoData, gameUI.selectedTalents.value);
      }
    };

    const handleModeSelect = (mode: GameMode) => {
      trackAnalyticsEvent({
        eventType: "game.mode.selected",
        metadata: { mode },
      });
      demoData.gameMode = mode;
      if (mode === "classic") {
        handlePageChange("天赋抽卡预备");
        return;
      }
      gameLogic.drawCelebrityChoices(demoData);
      handlePageChange("选择名人");
    };

    const handleCharacterSelect = (character: CelebrityCharacter) => {
      gameLogic.prepareCelebrity(demoData, character);
      handlePageChange("新的人生");
    };

    // 游戏步骤处理
    const handleStep = async () => {
      await gameLogic.step(
        demoData,
        gameUI.supplierForm,
        gameUI.storyBoxRef,
        () => gameLogic.stopAuto(demoData),
        () => gameLogic.makeLifeSummary(demoData)
      );
    };

    // 自动播放切换
    const handleToggleAuto = () => {
      gameLogic.toggleAuto(
        demoData,
        () => gameLogic.startAuto(demoData, handleStep),
        () => gameLogic.stopAuto(demoData)
      );
    };

    // 清空数据
    const handleClearData = () => {
      gameLogic.clearData(demoData);
    };

    // 属性分配计算
    const handleComputeOKVal = (key: MainAllocationKey, val: number) => {
      return gameLogic.computeOKVal(
        key,
        val,
        demoData,
        gameUI.restPropertyPoints.value
      );
    };

    const pageV = () => pageM(demoData.page);

    // 渲染页面内容
    const renderPageContent = () => {
      const currentPage = pageV();
      const commonProps = {
        demoData,
        lifeWrapper: gameLogic.lifeWrapper,
        selectedTalents: gameUI.selectedTalents.value,
        propertyPoints: gameUI.propertyPoints.value,
        restPropertyPoints: gameUI.restPropertyPoints.value,
        onPageChange: handlePageChange,
        onStep: handleStep,
        onToggleAuto: handleToggleAuto,
        onClearData: handleClearData,
        onComputeOKVal: handleComputeOKVal,
      };

      switch (currentPage) {
        case "立即重开":
          return vnd(RestartPage, {
            lifeWrapper: gameLogic.lifeWrapper,
            onPageChange: handlePageChange,
          });
        case "选择模式":
          return vnd(ModePage, {
            onModeSelect: handleModeSelect,
          });
        case "选择名人":
          return vnd(CelebritySelectionPage, {
            characters: demoData.characterChoices,
            onRefresh: () => gameLogic.drawCelebrityChoices(demoData),
            onSelect: handleCharacterSelect,
          });
        case "天赋抽卡预备":
          return vnd(TalentPreparePage, {
            demoData,
            lifeWrapper: gameLogic.lifeWrapper,
            onPageChange: handlePageChange,
          });
        case "天赋抽卡":
          return vnd(TalentSelectionPage, {
            demoData,
            lifeWrapper: gameLogic.lifeWrapper,
            selectedTalents: gameUI.selectedTalents.value,
            onPageChange: handlePageChange,
          });
        case "调整初始属性":
          return vnd(PropertyAllocationPage, commonProps);
        case "新的人生":
          return vnd(LifePage, {
            demoData,
            onPageChange: handlePageChange,
            onStep: handleStep,
            onToggleAuto: handleToggleAuto,
            ref: (el: Element | ComponentPublicInstance | null) => {
              if (el && "storyBoxRef" in el) {
                const storyBoxRef = (el as LifePageInstance).storyBoxRef;
                if (storyBoxRef) gameUI.storyBoxRef.value = storyBoxRef;
              }
            },
          });
        case "人生总结":
          return vnd(SummaryPage, {
            demoData,
            lifeWrapper: gameLogic.lifeWrapper,
            selectedTalents: gameUI.selectedTalents.value,
            onPageChange: handlePageChange,
            onClearData: handleClearData,
            onCompleteRun: () => gameLogic.completeRun(demoData),
          });
        default:
          return vnd("div", { class: "stack-h" }, []);
      }
    };

    return () => {
      return vnd("div", {}, [
        vnd(Panel, { header: pageV() ?? "游戏", class: "my-1.5rem! min-h-60vh! col" }, {
          default: () => vnd("div", { class: "stack-v" }, [
            renderPageContent()
          ]),
        }),

        vnd(Panel, { header: "存档", toggleable: true, class: "my-1.5rem! col" }, {
          default: () => vnd("div", { class: "stack-v" }, [
            vnd("div", { class: "stack-h" }, [
              vnd(ToolButton, {
                label: "存档(测试中)", icon: "pi pi-save", class: "",
                command: async () => {
                  await gameLogic.saveGame(demoData);
                },
              }),
              vnd(ToolButton, {
                label: "读档(测试中)", icon: "pi pi-undo", class: "",
                command: async () => {
                  await gameLogic.loadGame(demoData);
                },
              }),
            ]),
          ]),
        }),

        vnd(AppTavernView),

        vnd(Panel, { header: "其他", toggleable: true, class: "my-1.5rem! col" }, {
          default: () => vnd("div", { class: "stack-v" }, [
            vnd("div", { class: "stack-h" }, [
              vnd(ToolButton, {
                label: "成就", icon: "pi pi-trophy", class: "",
                command: () => { achievementsVisible.value = true; },
              }),
            ]),
          ]),
        }),

        vnd(AchievementsDialog, {
          visible: achievementsVisible.value,
          lifeObj: gameLogic.lifeWrapper.lifeObj,
          revision: gameLogic.achievementRevision.value,
          "onUpdate:visible": (value: boolean) => { achievementsVisible.value = value; },
        }),
      ]);
    };
  }
});

export default AppGameView;
