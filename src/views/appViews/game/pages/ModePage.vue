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
import ToolButton from '@components/shared/ToolButton';
import type { GameMode } from '../types';

interface Props {
  onModeSelect: (mode: GameMode) => void;
}

const props = defineProps<Props>();

const handleClassicMode = async () => {
  props.onModeSelect("classic");
};

const handleCelebrityMode = async () => {
  props.onModeSelect("celebrity");
};
</script>
