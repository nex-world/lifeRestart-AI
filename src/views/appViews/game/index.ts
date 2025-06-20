// 导出所有游戏相关的模块
export * from './types';
export * from './constants';
export * from './utils';
export { useGameLogic } from './useGameLogic';
export { useGameUI } from './useGameUI';

// 导出页面组件
export { default as RestartPage } from './pages/RestartPage.vue';
export { default as ModePage } from './pages/ModePage.vue';
export { default as TalentPreparePage } from './pages/TalentPreparePage.vue';
export { default as TalentSelectionPage } from './pages/TalentSelectionPage.vue';
export { default as PropertyAllocationPage } from './pages/PropertyAllocationPage.vue';
export { default as LifePage } from './pages/LifePage.vue';
export { default as SummaryPage } from './pages/SummaryPage.vue';
