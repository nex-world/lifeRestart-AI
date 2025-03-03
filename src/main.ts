import { createApp } from "vue";
// import './style.css'
import App from "./App";

import "@unocss/reset/normalize.css";
import "@unocss/reset/sanitize/sanitize.css";
import "@unocss/reset/sanitize/assets.css";
import "@unocss/reset/tailwind-compat.css";
// import '@styles/bootstrap.scss'
import "primeicons/primeicons.css";

// import "github-markdown.css";

import PrimeVue from "primevue/config";
import IndigoThemePreset from "@utils/IndigoThemePreset";
// import Ripple from 'primevue/ripple';
import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";
import DialogService from 'primevue/dialogservice';
import ConfirmationService from 'primevue/confirmationservice';

import { darkModeClassName } from "@config";
import router from "@router";
import { store } from "@store";

import { i18n } from "@locale";


const app = createApp(App);
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: IndigoThemePreset,
    options: {
      prefix: "p",
      darkModeSelector: `.${darkModeClassName}`,
      cssLayer: false,
    },
  },
});
app.use(router);
app.use(store);
app.use(ToastService);
app.use(DialogService);
app.use(ConfirmationService);
app.use(i18n);
app.directive("tooltip", Tooltip);
// app.directive('ripple', Ripple);
app.mount("#app");
