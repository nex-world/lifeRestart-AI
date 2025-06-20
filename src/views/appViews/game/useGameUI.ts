import { ref, reactive, computed, onMounted, onUpdated } from 'vue';
import { suppliers } from "llm-utils";
import { load } from '@utils/functions';
import type { SupplierForm, GameDemoData } from './types';
import type { TalentWithSelection } from '@lib/life-restart/talent';

export function useGameUI(demoData: GameDemoData, lifeWrapper: { lifeObj: any }) {
  // UI相关的响应式状态
  const storyBoxRef = ref<HTMLElement | null>(null);
  
  // 供应商表单管理
  const supplierForm = reactive<SupplierForm>({
    selectedSupplier: suppliers[0],
    apiKeyDict: {},
    supplierModelsDict: {},
    selectedModelDict: {},
  });

  // 属性点相关
  const thatPropertyPoints = ref(0);
  
  onUpdated(() => {
    thatPropertyPoints.value = lifeWrapper.lifeObj?.getPropertyPoints?.() ?? lifeWrapper.lifeObj?._defaultPropertyPoints ?? 0;
  });

  // 计算属性
  const selectedTalents = computed(() => 
    demoData.talentChoices.filter((talent: TalentWithSelection) => talent.selected)
  );
  
  const propertyPoints = computed(() => thatPropertyPoints.value);
  
  const restPropertyPoints = computed(() => 
    (propertyPoints.value ?? 0) - (demoData.usedPropertyPoints ?? 0)
  );

  // 初始化供应商表单
  onMounted(async () => {
    const supplierForm_ = await load("supplierForm");
    if (supplierForm_ != null) { 
      Object.assign(supplierForm, supplierForm_); 
    }
    console.log(supplierForm);
  });

  return {
    storyBoxRef,
    supplierForm,
    selectedTalents,
    propertyPoints,
    restPropertyPoints,
  };
}
