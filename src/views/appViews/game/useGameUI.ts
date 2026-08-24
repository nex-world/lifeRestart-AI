import { ref, reactive, computed, onMounted, onUpdated } from 'vue';
import { load } from '@utils/functions';
import { useSuppliersStore } from '@stores/suppliersStore';
import type { SupplierForm, GameDemoData } from './types';
import type { TalentWithSelection } from '@lib/life-restart/talent';

export function useGameUI(demoData: GameDemoData, lifeWrapper: { lifeObj: any; ready: boolean }) {
  const suppliersStore = useSuppliersStore();
  // UI相关的响应式状态
  const storyBoxRef = ref<HTMLElement | null>(null);
  
  // 供应商表单管理
  const supplierForm = reactive<SupplierForm>({
    selectedSupplier: suppliersStore.allSuppliers[0],
    apiKeyDict: {},
    supplierModelsDict: {},
    selectedModelDict: {},
  });

  // 属性点相关
  const thatPropertyPoints = ref(0);
  
  onUpdated(() => {
    if (!lifeWrapper.ready) return;
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
    supplierForm.selectedSupplier = suppliersStore.allSuppliers.find(
      (supplier) => supplier.name === supplierForm.selectedSupplier?.name
    ) ?? suppliersStore.allSuppliers[0];
  });

  return {
    storyBoxRef,
    supplierForm,
    selectedTalents,
    propertyPoints,
    restPropertyPoints,
  };
}
