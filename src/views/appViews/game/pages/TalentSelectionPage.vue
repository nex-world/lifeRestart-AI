<template>
  <div class="stack-v">
    <div :class="['stack-h', selectedTalents.length == lifeWrapper.lifeObj?.talentSelectLimit ? 'flex-row-reverse!' : null]">
      <ToolButton
        label="随机选择（已选的不会保留）"
        icon="pi pi-arrow-right-arrow-left"
        class=""
        @click="handleRandomSelect"
      />
      <ToolButton
        :label="selectedTalents.length >= (lifeWrapper.lifeObj?.talentSelectLimit ?? 3) ? '下一步' : `请选择${lifeWrapper.lifeObj?.talentSelectLimit ?? 3}个天赋`"
        class=""
        @click="handleNext"
      />
    </div>
    
    <ToolButton
      label="重抽（已选的不会保留）"
      icon="pi pi-refresh"
      class=""
      @click="handleRedraw"
    />

    <ToolButton
      v-for="(talent, idx) in demoData.talentChoices"
      :key="`[${idx}]${talent?.name}`"
      :label="`${talent?.name}（${talent?.description}）${talent?.selected ? '【已选】' : ''}`"
      :class="[
        makeGradeClasses(talent?.grade),
        talent?.selected ? 'border-red-500! text-red-300!' : ''
      ]"
      @click="() => handleTalentToggle(talent)"
    />
  </div>
</template>

<script setup lang="ts">
import _ from "lodash";
import { useToast } from 'primevue/usetoast';
import ToolButton from '@components/shared/ToolButton';
import { makeGradeClasses } from '../utils';
import type { GamePageProps } from '../types';
import type { TalentWithSelection } from '@lib/life-restart/talent';

interface Props extends Pick<GamePageProps, 'demoData' | 'lifeWrapper' | 'selectedTalents' | 'onPageChange'> {}

const props = defineProps<Props>();
const toast = useToast();

const handleRandomSelect = async () => {
  props.demoData.talentChoices.forEach((talent: TalentWithSelection) => talent.selected = false);
  const selected = _.sampleSize(props.demoData.talentChoices, props.lifeWrapper.lifeObj?.talentSelectLimit);
  selected.forEach((talent: TalentWithSelection) => talent.selected = true);
};

const handleNext = async () => {
  if (props.selectedTalents.length != props.lifeWrapper.lifeObj?.talentSelectLimit) {
    toast.add({ severity: "warn", summary: "天赋选择", detail: "请选择正确数量的天赋", life: 1500 });
    return;
  }
  console.log("lifeObj\n", props.lifeWrapper.lifeObj);
  props.onPageChange("调整初始属性");
};

const handleRedraw = async () => {
  props.demoData.talentChoices = props.lifeWrapper.lifeObj?.talentRandom?.() ?? [];
};

const handleTalentToggle = async (talent: TalentWithSelection) => {
  if (props.selectedTalents.length >= (props.lifeWrapper.lifeObj?.talentSelectLimit ?? 3) && !talent.selected) {
    toast.add({ severity: "warn", summary: "天赋选择", detail: "天赋选择数量已达上限", life: 1500 });
    return;
  }
  talent.selected = !talent.selected;
};
</script>
