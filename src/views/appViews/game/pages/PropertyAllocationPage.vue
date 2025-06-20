<template>
  <div class="stack-v">
    <div :class="['stack-h', restPropertyPoints == 0 ? 'flex-row-reverse!' : null]">
      <ToolButton
        label="随机分配"
        icon="pi pi-asterisk"
        class=""
        @click="handleRandomAllocation"
      />
      <ToolButton
        label="开始新人生"
        class=""
        @click="handleStartLife"
      />
    </div>

    <div>剩余属性点：{{ restPropertyPoints ?? 0 }}</div>

    <div
      v-for="([key, label], idx) in PROPERTY_KEYS"
      :key="`[${idx}]${key}`"
      class="stack-h justify-center! justify-items-center! items-center!"
    >
      <span>{{ label }}：</span>
      <ToolButton
        icon="pi pi-minus"
        class=""
        @click="() => handlePropertyChange(key, -1)"
      />
      <span>{{ demoData.allocation[key] }}</span>
      <ToolButton
        icon="pi pi-plus"
        class=""
        @click="() => handlePropertyChange(key, 1)"
      />
    </div>

    <div>已选天赋：</div>
    <ToolButton
      v-for="(talent, idx) in selectedTalents"
      :key="`[${idx}]${talent?.name}`"
      :label="`${talent?.name}（${talent?.description}）`"
      :class="makeGradeClasses(talent?.grade)"
    />
  </div>
</template>

<script setup lang="ts">
import _ from "lodash";
import { useToast } from 'primevue/usetoast';
import ToolButton from '@components/shared/ToolButton';
import { makeGradeClasses } from '../utils';
import { PROPERTY_KEYS } from '../constants';
import type { GamePageProps, MainAllocationKey } from '../types';

interface Props extends Pick<GamePageProps, 'demoData' | 'lifeWrapper' | 'selectedTalents' | 'propertyPoints' | 'restPropertyPoints' | 'onPageChange' | 'onComputeOKVal'> {}

const props = defineProps<Props>();
const toast = useToast();

const handleRandomAllocation = async () => {
  props.demoData.usedPropertyPoints = 0;
  props.demoData.allocation.CHR = 0;
  props.demoData.allocation.INT = 0;
  props.demoData.allocation.STR = 0;
  props.demoData.allocation.MNY = 0;
  
  const totalPoints = props.propertyPoints ?? 20;
  const keys = Object.keys(props.demoData.allocation);
  
  for (let i = 0; i < totalPoints; i++) {
    const key = _.sample(keys) as string;
    if (props.demoData.allocation[key as MainAllocationKey] >= (props.lifeWrapper.lifeObj?.propertyAllocateLimit?.[1] ?? 10)) {
      i -= 1;
      continue;
    }
    props.demoData.allocation[key as MainAllocationKey] += 1;
    props.demoData.usedPropertyPoints += 1;
  }
};

const handleStartLife = async () => {
  if (props.restPropertyPoints != 0) {
    toast.add({ 
      severity: "warn", 
      summary: "属性点分配", 
      detail: `你还有${props.restPropertyPoints}个属性点没有分配完！`, 
      life: 1500 
    });
    return;
  }
  props.onPageChange("新的人生");
  // start() 函数会在父组件中调用
};

const handlePropertyChange = (key: MainAllocationKey, delta: number) => {
  const currentVal = props.demoData.allocation[key];
  const targetVal = currentVal + delta;
  
  if (delta > 0) {
    const max = props.lifeWrapper.lifeObj?.propertyAllocateLimit?.[1] ?? props.propertyPoints ?? 20;
    const finalTargetVal = Math.min(max, targetVal);
    const { val: newVal, delta: actualDelta } = props.onComputeOKVal(key, finalTargetVal);
    props.demoData.usedPropertyPoints += actualDelta;
    props.demoData.allocation[key] = newVal;
  } else {
    const min = props.lifeWrapper.lifeObj?.propertyAllocateLimit?.[0] ?? 0;
    const finalTargetVal = Math.max(min, targetVal);
    const { val: newVal, delta: actualDelta } = props.onComputeOKVal(key, finalTargetVal);
    props.demoData.usedPropertyPoints += actualDelta;
    props.demoData.allocation[key] = newVal;
  }
};
</script>
