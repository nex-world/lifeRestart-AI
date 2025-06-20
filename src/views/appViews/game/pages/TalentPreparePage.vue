<template>
  <div class="stack-h">
    <ToolButton
      label="10连抽!"
      icon="pi pi-refresh"
      class=""
      @click="handleTalentDraw"
    />
  </div>
</template>

<script setup lang="ts">
import ToolButton from '@components/shared/ToolButton';
import type { GamePageProps } from '../types';

interface Props extends Pick<GamePageProps, 'demoData' | 'lifeWrapper' | 'onPageChange'> {}

const props = defineProps<Props>();

const handleTalentDraw = async () => {
  props.onPageChange("天赋抽卡");
  if (props.demoData.inheritedTalent?.id) {
    console.log("demoData.inheritedTalent\n", props.demoData.inheritedTalent);
    props.lifeWrapper.lifeObj?.talentExtend?.(String(props.demoData.inheritedTalent.id));
  }
  props.demoData.talentChoices = props.lifeWrapper.lifeObj?.talentRandom?.() ?? [];
};
</script>
