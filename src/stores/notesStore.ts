import _ from 'lodash';
import { defineStore } from 'pinia';
import { parse, stringify } from 'zipson';


export interface Note {
  content: string;
  title?: string;
  id?: number;
  timestamp?: number;
};

export interface NoteShadow {
  content?: string;
  title?: string;
  id?: number;
  timestamp?: number;
};

export const useNotesStore = defineStore('notesStore', {
  state: () => ({
    notes: [] as Note[],
  }),
  getters: {
    count: (state) => state.notes.length,
    maxId: (state) => _.maxBy(state.notes, 'id')?.id ?? 0,
  },
  actions: {
    addNote(note: Note) {
      note.id = this.maxId + 1;
      note.timestamp = Date.now();
      this.notes.unshift(note);
    },
    addNoteByContent(content: string, title?: string) {
      const note: Note = {
        content,
        title,
        id: this.maxId + 1,
        timestamp: Date.now(),
      };
      this.notes.unshift(note);
    },
    removeNote(shadow: NoteShadow) {
      _.remove(this.notes, shadow);
    },
    modifyNoteContent(shadow: NoteShadow, content: string, title?: string, callback?: (code: number) => void) {
      console.log({ shadow, title, content });
      const note = this.notes.find((it) => _.isMatch(it, shadow));
      if (note) {
        const noteIdx = this.notes.indexOf(note);
        const newNote = { ..._.cloneDeep(note), content, title };
        this.notes.splice(noteIdx, 1, newNote);
        callback?.(0);
      } else {
        callback?.(-1);
      }
    },
  },
  persist: {
    // https://prazdevs.github.io/pinia-plugin-persistedstate/guide/config.html
    serializer: {
      deserialize: parse,
      serialize: stringify,
    },
    // pick: ['notes'],
  },
});
