<template>
  <div class="stack-v">
    <div class="stack-h justify-center! justify-items-center! items-center!">
      <ToolButton
        label="经典模式"
        class=""
        @click="handleClassicMode"
      />
      <span>10连抽天赋，自由分配属性</span>
    </div>
    <div class="stack-h justify-center! justify-items-center! items-center!">
      <ToolButton
        label="名人模式"
        class=""
        @click="handleCelebrityMode"
      />
      <span>前世是古代名人，重开到了现代</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import ToolButton from '@components/shared/ToolButton';
import type { GamePageProps } from '../types';

interface Props extends Pick<GamePageProps, 'onPageChange'> {}

const props = defineProps<Props>();
const toast = useToast();

const handleClassicMode = async () => {
  props.onPageChange("天赋抽卡预备");
};

const handleCelebrityMode = async () => {
  toast.add({ severity: "warn", summary: "开发中", detail: "敬请期待", life: 1500 });
};
</script>
