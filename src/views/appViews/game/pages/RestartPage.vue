<template>
  <div class="flex flex-col items-center justify-center flex-1 pt-10rem pb-16rem min-h-full w-full select-none relative bg-transparent!">
    <!-- 标题部分 -->
    <div class="flex flex-col items-center gap-2 mb-12 opacity-50">
      <h2 class="text-10px tracking-0.8em text-slate-500 dark:text-slate-400 font-200 ml-0.8em uppercase">
        System Reboot
      </h2>
      <div class="h-1px w-12 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
    </div>

    <!-- 按钮区域 -->
    <div class="relative group inline-flex justify-center">
      <!-- 转角装饰 -->
      <div class="absolute -top-4 -left-4 w-4 h-4 border-t-1 border-l-1 border-slate-300 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
      <div class="absolute -bottom-4 -right-4 w-4 h-4 border-b-1 border-r-1 border-slate-300 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>

      <ToolButton
        label="重 开 新 人 生"
        icon="pi pi-power-off"
        class="restart-btn-fixed !relative !rounded-none !bg-white/50 dark:!bg-white/5 !backdrop-blur-sm !border-1 !border-slate-200 dark:!border-white/10 !text-slate-600 dark:!text-slate-400 !text-sm !font-300 !tracking-0.5em !transition-all !duration-500 hover:!border-slate-900 dark:hover:!border-white/40 hover:!text-slate-900 dark:hover:!text-white hover:!bg-white/90 dark:hover:!bg-white/10 active:!scale-98"
        @click="handleRestart"
      />
      
      <!-- 底部微流光 -->
      <div class="absolute -bottom-1 left-4 right-4 h-1px bg-transparent group-hover:bg-gradient-to-r from-transparent via-slate-400 dark:via-cyan-500 to-transparent transition-all duration-700 pointer-events-none"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ToolButton from '@components/shared/ToolButton';
import type { GamePageProps } from '../types';

interface Props extends Pick<GamePageProps, 'lifeWrapper' | 'onPageChange'> {}

const props = defineProps<Props>();

const handleRestart = async () => {
  props.lifeWrapper.lifeObj?.remake?.([]);
  props.onPageChange("选择模式");
};
</script>

<style scoped>
:deep(.p-button-label) {
  margin-left: 0.5em; 
}
:deep(.p-button-icon) {
  font-size: 0.8rem;
  margin-right: 0.8rem;
  opacity: 0.6;
}
.group:hover :deep(.p-button-icon) {
  opacity: 1;
}

.restart-btn-fixed {
  padding: 1.2rem 2rem !important; /* 对应 py-6 (1.5rem) 和 px-16 (4rem) */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}
.restart-btn-fixed:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}
</style>
