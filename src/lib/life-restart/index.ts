
export { default as Achievement } from "./achievement";
export { default as Character } from "./character";
export { default as Event } from "./event";
export { default as Property } from "./property";
export { default as Talent } from "./talent";

export { default as Life } from "./life";

export { defaultConfig } from "./defaultConfig";

export { type Any } from "./types";

import zhCn from "./i18n/zh-cn";
import enUs from "./i18n/en-us";

export const i18n = {
  "zh-cn": zhCn,
  "en-us": enUs,
};
