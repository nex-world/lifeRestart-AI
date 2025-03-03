// @unocss-include

// import _ from "lodash";

import {
  h as vnd, defineComponent,
  resolveDirective,
  withDirectives,
} from 'vue';

import { storeToRefs } from 'pinia';

import Panel from 'primevue/panel';
import Button from 'primevue/button';
import DataView from 'primevue/dataview';
import NoteEditor from '@components/NoteEditor';

import { useToast } from 'primevue/usetoast';
import { useNotesStore } from '@stores/notesStore';

import type { Note } from '@stores/notesStore';


const AppNotesView = defineComponent({
  name: "AppNotesView",
  setup() {

    const toast = useToast();
    const tooltip = resolveDirective("tooltip");

    const notesStore = useNotesStore();
    const { addNote, removeNote, modifyNoteContent } = notesStore;
    const { notes, count: notesCount } = storeToRefs(notesStore);

    return ()=>{
      return vnd(Panel, {
        header: `临时工作笔记（共 ${notesCount.value} 条）`,
        toggleable: true,
        class: "my-3",
      }, {
        default: () => [

          vnd("div", {
            class: [ "flex flex-row flex-items-center flex-wrap gap-2 flex-content-around flex-justify-around", ],
          }, [

            withDirectives(vnd(Button, { label: "新增", onClick: ()=>{
              addNote({content: ""});
            }}),[
              [tooltip, { value: "添加一条新的笔记", showDelay: 250, hideDelay: 500 }, "top", {top: true}],
            ]),

          ]),

          vnd(DataView, {
            value: notes.value,
            dataKey: "id",
            paginator: true,
            rows: 20,
            // 奇怪的提示 $props, $slots, $emit
          }, {
            empty: ()=>{
              return vnd("div", { class: "my-3" }, ["暂无笔记"]);
            },
            list: (slotProps: {items: Note[]})=>{
              return slotProps.items.map((note, idx)=>vnd(NoteEditor, {
                class: "my-3",
                note: note,
                idx: idx,
                key: `note[${idx}][${note.id}]`,
                onDeleteNote: (shadow)=>{
                  // toast.add({ severity: 'success', summary: '删除笔记', detail: `${JSON.stringify(shadow)}`, life: 3000 });
                  removeNote(shadow);
                },
                onModifyNoteContent: ({shadow, content, title, callback})=>{
                  console.log({shadow, content, title, callback});
                  modifyNoteContent(shadow, content, title, (code)=>{
                    if (code === 0) {
                      // toast.add({ severity: 'success', summary: '修改笔记', detail: `修改成功（${code}）`, life: 3000 });
                    } else {
                      toast.add({ severity: 'error', summary: '修改笔记', detail: `修改失败（${code}）\n${JSON.stringify(shadow)}`, life: 3000 });
                    }
                    callback?.(code);
                  });
                },
              }));
            },
          }),

        ]
      });
    };
  }
})

export default AppNotesView;
