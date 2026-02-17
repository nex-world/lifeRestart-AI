// @unocss-include

import _ from "lodash";
import { h as vnd, defineComponent, reactive } from 'vue';
import Panel from 'primevue/panel';
import ToolButton from '@components/shared/ToolButton';
import { useToast } from 'primevue/usetoast';

// 导入拆分后的模块
import { useGameLogic } from './game/useGameLogic';
import { useGameUI } from './game/useGameUI';
import { initialDemoData, pageM, DDDD } from './game/constants';

// 导入页面组件
import RestartPage from './game/pages/RestartPage.vue';
import ModePage from './game/pages/ModePage.vue';
import TalentPreparePage from './game/pages/TalentPreparePage.vue';
import TalentSelectionPage from './game/pages/TalentSelectionPage.vue';
import PropertyAllocationPage from './game/pages/PropertyAllocationPage.vue';
import LifePage from './game/pages/LifePage.vue';
import SummaryPage from './game/pages/SummaryPage.vue';

import AppTavernView from './AppTavernView';


const AppGameView = defineComponent({
  name: "AppGameView",
  setup() {
    const toast = useToast();

    // 游戏数据
    const demoData = reactive(_.cloneDeep(initialDemoData));

    // 初始化游戏逻辑钩子
    const gameLogic = useGameLogic();
    gameLogic.setupInheritedTalentWatcher(demoData);

    // 初始化UI钩子
    const gameUI = useGameUI(demoData, gameLogic.lifeWrapper);

    // 页面切换处理
    const handlePageChange = (page: string) => {
      demoData.page = page;
      if (page === "新的人生") {
        gameLogic.start(demoData, gameUI.selectedTalents.value);
      }
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
    const handleComputeOKVal = (key: any, val: number) => {
      return gameLogic.computeOKVal(
        key,
        val,
        demoData,
        gameUI.propertyPoints.value,
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
            onPageChange: handlePageChange,
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
            ref: (el: any) => {
              if (el?.storyBoxRef) {
                gameUI.storyBoxRef.value = el.storyBoxRef;
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
        vnd(AppTavernView),

        DDDD ? null :
        vnd(Panel, { header: "其他", toggleable: true, class: "my-1.5rem! col" }, {
          default: () => vnd("div", { class: "stack-v" }, [
            vnd("div", { class: "stack-h" }, [
              vnd(ToolButton, {
                tip: "成就相关操作", label: "成就", icon: "pi pi-trophy", class: "",
                onClick: async () => {
                  toast.add({ severity: "warn", summary: "开发中", detail: "敬请期待", life: 1500 });
                },
              }),
              vnd(ToolButton, {
                tip: "排行榜相关操作", label: "排行榜", icon: "pi pi-sort-amount-up", class: "",
                onClick: async () => {
                  toast.add({ severity: "info", summary: "排行榜", detail: "别卷了，没有排行榜", life: 3000 });
                },
              }),
              vnd(ToolButton, {
                tip: "存档相关操作", label: "存档", icon: "pi pi-save", class: "",
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
});

export default AppGameView;
