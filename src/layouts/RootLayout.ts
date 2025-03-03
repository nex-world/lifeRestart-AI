
import { h as vnd, defineComponent, watchEffect } from 'vue';
import { RouterView } from 'vue-router';

import { useDarkModeStore } from '@stores/darkMode';
import { useSystemSettingsStore } from '@stores/systemSettingsStore';


import Toast from 'primevue/toast';
import ConfirmPopup from 'primevue/confirmpopup';
import DynamicDialog from 'primevue/dynamicdialog';



const RootLayout = defineComponent({
  setup() {
    const darkModeStore = useDarkModeStore();
    const { turn: recoverDarkMode } = darkModeStore;
    const systemSettingsStore = useSystemSettingsStore();
    const { setLocale } = systemSettingsStore;

    watchEffect(()=>{
      recoverDarkMode();
      setLocale();
    });

    return ()=>[
      vnd(RouterView),
      vnd(Toast),
      vnd(ConfirmPopup),
      vnd(DynamicDialog),
    ];
  },
});

export default RootLayout;

