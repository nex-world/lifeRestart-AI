<template>
  <div class="stack-h">
    <ToolButton
      label="立即重开"
      icon="pi pi-refresh"
      class=""
      @click="handleRestart"
    />
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
