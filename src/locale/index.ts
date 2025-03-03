
import { createI18n } from "vue-i18n";

export const i18n = createI18n({
  legacy: false,
  locale: "zh",
  fallbackLocale: "en",
  messages: {
    en: {
      message: {
        hello: "hello world",
      },
    },
    "zh": {
      message: {
        hello: "你好，世界",
      },
    },
  },
});

