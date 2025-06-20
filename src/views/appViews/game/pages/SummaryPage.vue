<template>
  <div class="stack-v">
    <div class="stack-h">
      <ToolButton
        label="再次重开"
        icon="pi pi-refresh"
        class=""
        @click="handleRestart"
      />
    </div>

    <Tag
      v-for="(it, idx) in demoData.summary"
      :key="`[${idx}]${it?.prop}`"
      :class="makeGradeClasses(Number(it?.grade))"
    >
      {{ PropSDT(it?.prop ?? '') }}：{{ it?.value ?? '' }} {{ SDT(it?.judge ?? '') }}
    </Tag>

    <div>天赋：你可以选择一个，下辈子还能抽到</div>
    <ToolButton
      v-for="(talent, idx) in selectedTalents"
      :key="`[${idx}]${talent?.name}`"
      :label="`${talent?.name}（${talent?.description}）${demoData.inheritedTalent?.name == talent?.name ? '【已选】' : ''}`"
      :class="[
        makeGradeClasses(talent?.grade),
        demoData.inheritedTalent?.name == talent?.name ? 'border-red-500! text-red-300!' : ''
      ]"
      @click="() => handleTalentSelect(talent)"
    />
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag';
import ToolButton from '@components/shared/ToolButton';
import { makeGradeClasses } from '../utils';
import { SDT, PropSDT } from '../constants';
import type { GamePageProps } from '../types';
import type { TalentWithSelection } from '@lib/life-restart/talent';

interface Props extends Pick<GamePageProps, 'demoData' | 'lifeWrapper' | 'selectedTalents' | 'onPageChange' | 'onClearData'> {}

const props = defineProps<Props>();

const handleRestart = async () => {
  const found = (props.selectedTalents ?? []).find((it: TalentWithSelection) => 
    it?.name == props.demoData.inheritedTalent?.name
  );
  if (!found) {
    props.demoData.inheritedTalent = null;
    props.lifeWrapper.lifeObj?.talentExtend?.("");
  }
  console.log("demoData.summary\n", props.demoData.summary);
  props.onClearData();
  props.onPageChange("");
};

const handleTalentSelect = async (talent: TalentWithSelection) => {
  if (props.demoData.inheritedTalent?.name == talent?.name) {
    props.demoData.inheritedTalent = null;
    props.lifeWrapper.lifeObj?.talentExtend?.("");
    return;
  }
  props.demoData.inheritedTalent = talent;
  props.lifeWrapper.lifeObj?.talentExtend?.(String(talent?.id));
};
</script>
