import { defineStore } from 'pinia';
import { parse, stringify } from 'zipson';
import { ref, computed } from 'vue';

import { darkModeClassName } from '@config';


export const useDarkModeStore = defineStore('darkMode', ()=>{

  // state
  const className = ref(darkModeClassName);
  const isOn = ref(false);

  // getters
  const darkModeClass = computed(() => `.${className.value}`);
  const isDarkMode = computed(() => document.documentElement.classList.contains(darkModeClassName));

  // actions
  const turnOn = () => {
    document.documentElement.classList.add(className.value);
    isOn.value = true;
  }
  const turnOff = () => {
    document.documentElement.classList.remove(className.value);
    isOn.value = false;
  }
  const toggle = () => {
    document.documentElement.classList.toggle(className.value);
    isOn.value = !isOn.value;
  };
  const turn = () => {
    if (isOn.value) {
      turnOn();
    } else {
      turnOff();
    }
  }

  // return
  return {
    className, isOn,
    darkModeClass, isDarkMode,
    turnOn, turnOff, toggle, turn,
  }

}, {
  persist: {
    // https://prazdevs.github.io/pinia-plugin-persistedstate/guide/config.html
    serializer: {
      deserialize: parse,
      serialize: stringify,
    },
    pick: ['isOn'],
  },
});
