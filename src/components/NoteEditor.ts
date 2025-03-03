// @unocss-include

// import _ from "lodash";

import {
  h as vnd, defineComponent,
  resolveDirective,
  withDirectives,
  ref,
} from 'vue';

import Panel from 'primevue/panel';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
// import Fluid from 'primevue/fluid';

// import { storeToRefs } from 'pinia';
// import { useToast } from 'primevue/usetoast';

// import type { Note, NoteShadow } from '@stores/notesStore';


const NoteEditor = defineComponent({
  name: "NoteEditor",
  props: ['note', 'idx'],
  emits: ['modifyNoteContent', 'deleteNote'],
  setup(props, {emit}) {

    // const toast = useToast();
    const tooltip = resolveDirective("tooltip");

    const menuRef = ref();
    const toggleMenuRef = (event: Event) => { menuRef.value.toggle(event); };
    const isEditing = ref(false);
    const editingTitle = ref(props?.note?.title);
    const editingContent = ref(props?.note?.content);
    const menuItems = ref([
      { label: "修改", icon: "pi pi-pencil", command: () => {
        isEditing.value = true;
        // toast.add({ severity: 'info', summary: '修改', detail: '修改', life: 1000 });
      } },
      { label: "删除", icon: "pi pi-trash", command: () => {
        emit("deleteNote", { id: props?.note?.id });
        // toast.add({ severity: 'warn', summary: '删除', detail: '删除', life: 1000 });
      } },
    ]);

    return ()=>{
      return vnd(Panel, {
        key: `note[${props?.idx}][${props?.note?.id}]`,
        header: `[${props?.note?.id}] ${props?.note?.title ?? ""}`,
      }, {
        default: () => vnd("div", {}, [

          isEditing.value ? null :
          vnd("pre", {}, props?.note?.content),

          !isEditing.value ? null :
          vnd("div", {
            class: "my-3 flex flex-col flex-wrap gap-2 flex-content-around",
          }, [
            vnd(InputText, {
              fluid: true,
              modelValue: editingTitle.value,
              "onUpdate:modelValue": (value: string) => {
                editingTitle.value = value;
              },
            }),

            vnd(Textarea, {
              fluid: true,
              rows: 4,
              modelValue: editingContent.value,
              "onUpdate:modelValue": (value: string) => {
                editingContent.value = value;
              },
            }),
          ]),

          !isEditing.value ? null :
          vnd("div", {
            class: "mt-3 flex flex-row flex-wrap gap-2 flex-content-around",
          }, [
            vnd(Button, {
              class: "ml-auto",
              label: "保存",
              severity: "secondary",
              size: "small",
              onClick: () => {
                emit("modifyNoteContent", {
                  shadow: { id: props?.note?.id },
                  content: editingContent.value,
                  title: editingTitle.value,
                  callback: (code: number) => {
                    if (code === 0) {
                      isEditing.value = false;
                    }
                  },
                });
              },
            }),
            vnd(Button, {
              label: "取消",
              severity: "secondary",
              size: "small",
              onClick: () => {
                isEditing.value = false;
                // toast.add({ severity: 'info', summary: '取消', detail: '取消', life: 1000 });
              },
            }),
          ]),

        ]),
        icons: () => [
          withDirectives(vnd(Button, {
            icon: "pi pi-pencil",
            severity: "secondary",
            rounded: true,
            text: true,
            onClick: ()=>{
              isEditing.value = true;
              // toast.add({ severity: 'info', summary: '修改', detail: '修改', life: 1000 });
            },
          }), [
            [tooltip, { value: "修改", showDelay: 250, hideDelay: 500 }, "top", {top: true}],
          ]),
          withDirectives(vnd(Button, {
            icon: "pi pi-trash",
            severity: "secondary",
            rounded: true,
            text: true,
            onClick: ()=>{
              emit("deleteNote", { id: props?.note?.id });
              // toast.add({ severity: 'warn', summary: '删除', detail: '删除', life: 1000 });
            },
          }), [
            [tooltip, { value: "删除", showDelay: 250, hideDelay: 500 }, "top", {top: true}],
          ]),
          withDirectives(vnd(Button, {
            icon: "pi pi-cog",
            severity: "secondary",
            rounded: true,
            text: true,
            onClick: toggleMenuRef,
          }), [
            [tooltip, { value: "操作", showDelay: 250, hideDelay: 500 }, "top", {top: true}],
          ]),
          vnd(Menu, {
            ref: menuRef,
            id: `menu-of-note[${props?.idx}][${props?.note?.id}]`,
            model: menuItems.value,
            popup: true,
          }),
        ],
      });
    };
  }
})

export default NoteEditor;
