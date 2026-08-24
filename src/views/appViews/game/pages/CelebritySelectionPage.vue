<template>
  <div class="stack-v w-full">
    <div class="stack-h justify-between! items-center!">
      <p class="m-0 text-sm opacity-65">从三位名人中选择一位，以其属性和天赋重开到现代。</p>
      <ToolButton label="换一批" icon="pi pi-refresh" @click="onRefresh" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card v-for="character in characters" :key="character.id || character.name" class="h-full">
        <template #title>{{ character.name || '神秘人物' }}</template>
        <template #content>
          <div class="stack-v h-full">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div v-for="([key, label]) in PROPERTY_KEYS" :key="key" class="p-2 rounded bg-black/5 dark:bg-white/5">
                <span class="opacity-55">{{ label }}</span>
                <strong class="float-right">{{ formatProperty(character.property[key]) }}</strong>
              </div>
            </div>

            <div class="text-sm font-semibold mt-1">自带天赋</div>
            <Tag
              v-for="talent in character.talent"
              :key="talent.id"
              :class="makeGradeClasses(Number(talent.grade))"
              class="white-space-normal! h-auto! justify-start!"
            >
              {{ talent.name }}：{{ talent.description }}
            </Tag>
          </div>
        </template>
        <template #footer>
          <ToolButton class="w-full" label="以此身份开始" icon="pi pi-play" @click="() => onSelect(character)" />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import ToolButton from '@components/shared/ToolButton';
import { PROPERTY_KEYS } from '../constants';
import { makeGradeClasses } from '../utils';
import type { CelebrityCharacter } from '@lib/life-restart/character';

defineProps<{
  characters: CelebrityCharacter[];
  onRefresh: () => void;
  onSelect: (character: CelebrityCharacter) => void;
}>();

function formatProperty(value: string | number | undefined) {
  if (typeof value === 'number' && Math.abs(value - Math.PI) < 0.0000001) return 'π';
  return value ?? 0;
}
</script>
