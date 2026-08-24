<template>
  <Panel header="自定义供应商" toggleable collapsed class="my-1.5rem! col">
    <div class="stack-v">
      <p class="m-0 text-sm opacity-65">
        可接入兼容 OpenAI Chat Completions 接口的供应商。配置仅保存在当前浏览器。
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <InputText v-model="addForm.name" placeholder="供应商名称 *" fluid />
        <InputText v-model="addForm.baseUrl" placeholder="Base URL，例如 https://api.example.com/v1 *" fluid />
        <InputText v-model="addForm.label" placeholder="显示名称（可选）" fluid />
        <InputText v-model="addForm.defaultModel" placeholder="默认模型，例如 gpt-4o-mini（可选）" fluid />
        <InputText v-model="addForm.modelsUrl" placeholder="模型列表路径，默认 /models" fluid />
      </div>

      <div class="stack-h justify-end!">
        <ToolButton label="添加供应商" icon="pi pi-plus" @click="handleAdd" />
      </div>

      <div v-if="customSuppliers.length === 0" class="py-3 text-center opacity-50">
        暂无自定义供应商
      </div>

      <Card v-for="supplier in customSuppliers" :key="supplier.name">
        <template #title>
          <div class="flex items-center gap-2 text-base">
            <span>{{ supplier.label || supplier.name }}</span>
            <span v-if="supplier.label" class="text-xs opacity-50">({{ supplier.name }})</span>
          </div>
        </template>
        <template #content>
          <div v-if="editingName === supplier.name" class="stack-v">
            <InputText v-model="editForm.baseUrl" placeholder="Base URL *" fluid />
            <InputText v-model="editForm.label" placeholder="显示名称（可选）" fluid />
            <InputText v-model="editForm.defaultModel" placeholder="默认模型（可选）" fluid />
            <InputText v-model="editForm.modelsUrl" placeholder="模型列表路径（可选）" fluid />
          </div>
          <div v-else class="stack-v gap-1! text-sm">
            <div><span class="opacity-55">Base URL：</span><code>{{ supplier.baseUrl }}</code></div>
            <div v-if="supplier.defaultModel"><span class="opacity-55">默认模型：</span>{{ supplier.defaultModel }}</div>
            <div><span class="opacity-55">模型列表：</span>{{ supplier.modelsUrl || '/models' }}</div>
          </div>
        </template>
        <template #footer>
          <div class="stack-h justify-end!">
            <template v-if="editingName === supplier.name">
              <ToolButton label="取消" icon="pi pi-times" @click="cancelEdit" />
              <ToolButton label="保存" icon="pi pi-check" @click="saveEdit(supplier)" />
            </template>
            <template v-else>
              <ToolButton label="编辑" icon="pi pi-pencil" @click="startEdit(supplier)" />
              <ToolButton label="删除" icon="pi pi-trash" @click="requestDelete(supplier)" />
            </template>
          </div>
        </template>
      </Card>
    </div>
  </Panel>

  <Dialog v-model:visible="deleteDialogVisible" modal header="删除自定义供应商" :style="{ width: 'min(28rem, 92vw)' }">
    <p class="m-0">确定删除“{{ pendingDelete?.label || pendingDelete?.name }}”吗？对应的本地 API Key 和模型选择也会一并清理。</p>
    <template #footer>
      <ToolButton label="取消" @click="deleteDialogVisible = false" />
      <ToolButton label="确认删除" icon="pi pi-trash" @click="confirmDelete" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import Panel from 'primevue/panel';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ToolButton from '@components/shared/ToolButton';
import { useSuppliersStore, type CustomSupplier } from '@stores/suppliersStore';

const emit = defineEmits<{
  changed: [payload?: { removedName?: string }];
}>();

const toast = useToast();
const suppliersStore = useSuppliersStore();
const { customSuppliers } = storeToRefs(suppliersStore);

const emptyForm = () => ({ name: '', baseUrl: '', label: '', defaultModel: '', modelsUrl: '' });
const addForm = reactive(emptyForm());
const editForm = reactive(emptyForm());
const editingName = ref('');
const pendingDelete = ref<CustomSupplier | null>(null);
const deleteDialogVisible = ref(false);

function handleAdd() {
  const result = suppliersStore.addSupplier({ ...addForm });
  if (!result) {
    toast.add({ severity: 'warn', summary: '配置不完整', detail: '供应商名称和 Base URL 为必填项', life: 2500 });
    return;
  }
  Object.assign(addForm, emptyForm());
  emit('changed');
  toast.add({ severity: 'success', summary: '供应商已添加', detail: result.name, life: 1800 });
}

function startEdit(supplier: CustomSupplier) {
  editingName.value = supplier.name;
  Object.assign(editForm, {
    name: supplier.name,
    baseUrl: supplier.baseUrl,
    label: supplier.label || '',
    defaultModel: supplier.defaultModel || '',
    modelsUrl: supplier.modelsUrl || '',
  });
}

function cancelEdit() {
  editingName.value = '';
  Object.assign(editForm, emptyForm());
}

function saveEdit(supplier: CustomSupplier) {
  const result = suppliersStore.updateSupplier(supplier.name, editForm);
  if (!result) {
    toast.add({ severity: 'warn', summary: '保存失败', detail: 'Base URL 不能为空', life: 2500 });
    return;
  }
  cancelEdit();
  emit('changed');
  toast.add({ severity: 'success', summary: '供应商已更新', detail: result.name, life: 1800 });
}

function requestDelete(supplier: CustomSupplier) {
  pendingDelete.value = supplier;
  deleteDialogVisible.value = true;
}

function confirmDelete() {
  if (!pendingDelete.value) return;
  const removedName = pendingDelete.value.name;
  suppliersStore.removeSupplier(removedName);
  pendingDelete.value = null;
  deleteDialogVisible.value = false;
  if (editingName.value === removedName) cancelEdit();
  emit('changed', { removedName });
  toast.add({ severity: 'info', summary: '供应商已删除', detail: removedName, life: 1800 });
}
</script>
