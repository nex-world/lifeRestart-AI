<template>
  <Dialog
    :visible="visible"
    modal
    maximizable
    header="成就与图鉴"
    :style="{ width: 'min(52rem, 96vw)' }"
    :content-style="{ maxHeight: '76vh', overflow: 'auto' }"
    @update:visible="(value) => emit('update:visible', value)"
  >
    <div v-if="lifeObj" class="stack-v">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div v-for="item in statisticItems" :key="item.label" class="p-3 rounded-lg border border-surface-200 dark:border-surface-700">
          <div class="text-xs opacity-55">{{ item.label }}</div>
          <div class="text-xl font-semibold mt-1">{{ item.value }}</div>
          <div class="text-xs opacity-55 mt-1">{{ item.detail }}</div>
        </div>
      </div>

      <div class="flex justify-between items-center mt-2">
        <strong>全部成就</strong>
        <span class="text-sm opacity-60">已解锁 {{ achievedCount }} / {{ achievements.length }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div
          v-for="achievement in achievements"
          :key="`${revision}-${achievement.id}`"
          :class="[
            'p-3 rounded-lg border flex gap-3 items-start',
            achievement.isAchieved
              ? 'border-surface-300 dark:border-surface-600'
              : 'border-surface-200 dark:border-surface-800 opacity-55',
          ]"
        >
          <i :class="achievement.isAchieved ? 'pi pi-trophy text-yellow-500 mt-1' : 'pi pi-lock mt-1'" />
          <div class="min-w-0">
            <div class="font-semibold">
              {{ achievement.hide && !achievement.isAchieved ? '???' : achievement.name }}
            </div>
            <div class="text-sm opacity-70 mt-1">
              {{ achievement.hide && !achievement.isAchieved ? '达成后揭晓' : achievement.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="py-8 text-center opacity-60">正在加载成就数据…</div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import type Life from '@lib/life-restart/life';
import { SDT } from './constants';

const props = defineProps<{
  visible: boolean;
  lifeObj: Life | null;
  revision: number;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const achievements = computed(() => {
  void props.revision;
  return props.lifeObj?.achievements ?? [];
});

const achievedCount = computed(() => achievements.value.filter((item) => item.isAchieved).length);

const statisticItems = computed(() => {
  void props.revision;
  const life = props.lifeObj;
  if (!life) return [];
  const pt = life.PropertyTypes;
  const statistics = life.statistics;
  const totalAchievements = life._property.get(pt.TACHV) || 0;
  return [
    {
      label: '重开次数',
      value: statistics[pt.TMS]?.value ?? 0,
      detail: statistics[pt.TMS]?.judge ? SDT(String(statistics[pt.TMS].judge)) : '继续探索不同人生',
    },
    {
      label: '成就',
      value: `${statistics[pt.CACHV]?.value ?? 0} / ${totalAchievements}`,
      detail: formatPercent(totalAchievements ? (statistics[pt.CACHV]?.value ?? 0) / totalAchievements : 0),
    },
    {
      label: '天赋图鉴',
      value: formatPercent(statistics[pt.RTLT]?.value ?? 0),
      detail: '曾经拥有的天赋',
    },
    {
      label: '事件图鉴',
      value: formatPercent(statistics[pt.REVT]?.value ?? 0),
      detail: '曾经经历的事件',
    },
  ];
});

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${Math.floor(value * 100)}%`;
}
</script>
