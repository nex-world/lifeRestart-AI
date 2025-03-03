
// import "@styles/bootstrap-custom.scss";

import axios from "axios";
import clipboard from "clipboard";
import Dexie from "dexie";
import * as jschardet from "jschardet";
import json5 from "json5";
import localforage from "localforage";
import lodash from "lodash";
import md5 from "blueimp-md5";
import {nanoid} from "nanoid";
import pako from "pako";
import { saveAs } from "file-saver";
import yaml from "yaml";
import zipson from "zipson";

declare global {
  interface Window {
    toolPack?: {
      [key: string]: unknown;
    };

    _?: typeof lodash;
    axios?: typeof axios;
    clipboard?: typeof clipboard;
    Dexie?: typeof Dexie;
    jschardet?: typeof jschardet;
    json5?: typeof json5;
    JSON5?: typeof json5;
    localforage?: typeof localforage;
    lodash?: typeof lodash;
    Lodash?: typeof lodash;
    md5?: typeof md5;
    nanoid?: typeof nanoid;
    pako?: typeof pako;
    saveAs?: typeof saveAs;
    yaml?: typeof yaml;
    zipson?: typeof zipson;
  }
}

window.toolPack = {
  _: lodash,
  axios,
  clipboard,
  Dexie,
  jschardet,
  json5,
  JSON5: json5,
  localforage,
  lodash,
  Lodash: lodash,
  md5,
  nanoid,
  pako,
  saveAs,
  yaml,
  zipson,
};

window._ = lodash;
window.axios = axios;
window.clipboard = clipboard;
window.Dexie = Dexie;
window.jschardet = jschardet;
window.json5 = json5;
window.JSON5 = json5;
window.localforage = localforage;
window.lodash = lodash;
window.Lodash = lodash;
window.md5 = md5;
window.nanoid = nanoid;
window.pako = pako;
window.saveAs = saveAs;
window.yaml = yaml;
window.zipson = zipson;

import { h as vnd, defineComponent } from 'vue';

import 'virtual:uno.css';
import '@styles/style.styl';
// import './index.css';

// import { RouterView } from 'vue-router';
import RootLayout from '@layouts/RootLayout';

const App = defineComponent({
  setup() {
    return ()=>{
      return vnd(RootLayout);
    };
  }
});

export default App;
