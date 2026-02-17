<template>
  <div class="stack-v w-full">
    <div class="stack-h w-full">
      <ToolButton
        label="人生总结"
        icon="pi pi-list-check"
        :class="[!demoData.lifeEnded ? 'hidden!' : 'ml-4rem']"
        @click="handleShowSummary"
      />
      <ToolButton
        label="下一年"
        icon="pi pi-arrow-right"
        :class="[demoData.lifeEnded ? 'hidden!' : null]"
        :disabled="demoData.processing"
        @click="onStep"
      />
      <ToolButton
        :label="demoData.autoPlay ? '停止' : '自动'"
        :icon="demoData.autoPlay ? 'pi pi-stop-circle' : 'pi pi-arrow-circle-right'"
        :class="[demoData.lifeEnded ? 'hidden!' : null]"
        :disabled="demoData.processing && !demoData.autoPlay"
        @click="onToggleAuto"
      />
    </div>

    <div class="stack-h">
      <ToolButton
        :label="`AI讲述：${demoData.useAI ? '已开启' : '已关闭'}`"
        icon="pi pi-sparkles"
        :class="[demoData.lifeEnded ? 'hidden!' : null]"
        @click="handleToggleAI"
      />
    </div>

    <div class="stack-h">
      <div
        v-for="([key, label], idx) in PROPERTY_DISPLAY_KEYS"
        :key="`[${idx}]${key}`"
        class="p-panel stack-v p-0.25rem justify-center! items-center!"
      >
        <div>{{ label }}</div>
        <div>{{ String(demoData.state[key] ?? '') }}</div>
      </div>
    </div>

    <div
      id="life-story-box"
      ref="storyBoxRef"
      class="p-panel p-0.5rem max-h-50svh w-full overflow-auto"
    >
      <div
        v-for="(thing, idx) in demoData.lifeStory"
        :key="`[${idx}]${thing?.age}`"
        class="stack-v mt-0.5rem mb-0.25rem"
        @click="() => console.log(thing)"
      >
        <div>{{ thing?.age }}岁</div>
        <div
          v-for="(it, contentIdx) in thing?.content ?? []"
          :key="`[${contentIdx}]${it?.name}`"
        >
          <Message
            v-if="it?.type === 'TLT'"
            severity="secondary"
            :class="makeGradeClasses(it?.grade)"
          >
            天赋【{{ it?.name }}】发动：{{ it?.description }}
          </Message>
          <Message
            v-if="it?.type === 'EVT'"
            severity="secondary"
            :class="makeGradeClasses(it?.grade)"
          >
            {{ it?.description }} {{ it?.postEvent ?? '' }}
          </Message>
        </div>
        <Message
          v-if="thing?.output"
          severity="secondary"
          class=""
        >
          {{ thing?.output }}
        </Message>
      </div>

      <ProgressSpinner
        v-if="demoData.processing"
        :style="{
          strokeWidth: '1rem',
          width: '2.5rem',
          height: '2.5rem',
        }"
        class="my-spinner my-0.5rem!"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import ToolButton from '@components/shared/ToolButton';
import { load } from '@utils/functions';
import { makeGradeClasses } from '../utils';
import { PROPERTY_DISPLAY_KEYS } from '../constants';
import type { GamePageProps } from '../types';

interface Props extends Pick<GamePageProps, 'demoData' | 'onPageChange' | 'onStep' | 'onToggleAuto'> {}

const props = defineProps<Props>();
const storyBoxRef = ref<HTMLElement | null>(null);
const toast = useToast();

const handleShowSummary = async () => {
  props.onPageChange("人生总结");
};

const handleToggleAI = async () => {
  if (!props.demoData.useAI) {
    const supplierForm = await load("supplierForm");
    const apiKey = supplierForm?.apiKeyDict?.[supplierForm?.selectedSupplier?.name];
    const model = supplierForm?.selectedModelDict?.[supplierForm?.selectedSupplier?.name]?.name;

    if (!apiKey || !model || model === '[[<DEFAULT>]]') {
      toast.add({
        severity: 'warn',
        summary: '配置提醒',
        detail: '需要先配置 LLM 才能开启 AI 讲述，但不开启 AI 讲述也可以进行游戏',
        life: 5000,
      });
      return;
    }
  }
  props.demoData.useAI = !props.demoData.useAI;
};

// 暴露 storyBoxRef 给父组件使用
defineExpose({
  storyBoxRef
});
</script>
