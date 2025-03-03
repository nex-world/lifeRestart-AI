// @unocss-include

// import _ from "lodash";

import { h as vnd, defineComponent, ref, watch } from 'vue';

// import Panel from 'primevue/panel';
// import Fieldset from 'primevue/fieldset';
// import Button from 'primevue/button';

import Menubar from 'primevue/menubar';


import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
// import TabPanels from 'primevue/tabpanels';
// import TabPanel from 'primevue/tabpanel';

import { useDarkModeStore } from '@stores/darkMode';
// import { useSystemSettingsStore } from '@stores/systemSettingsStore';
import { storeToRefs } from 'pinia';

// import { useToast } from 'primevue/usetoast';

import { RouterView } from 'vue-router';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';



const APP_NAME = "人生重开模拟器AI版";

const AppView = defineComponent({
  name: "AppView",
  setup() {

    const { locale: i18nLocale } = useI18n({ useScope: 'global' });
    console.log({i18nLocale: i18nLocale.value});

    const darkModeStore = useDarkModeStore();
    const { toggle: toggleDarkMode } = darkModeStore;
    const { isOn: isDarkModeOn } = storeToRefs(darkModeStore);

    // const systemSettingsStore = useSystemSettingsStore();
    // const { setLocale } = systemSettingsStore;
    // const { availableLocales, locale } = storeToRefs(systemSettingsStore);

    const items = ref([
      { label: "游戏", name: "app-game", icon: "pi pi-play-circle" },
      { label: "说明", name: "app-about", icon: "pi pi-book" },
      // { label: "笔记", name: "app-notes", icon: "pi pi-clipboard" },
    ]);
    const currentLabelName = ref(items.value[0].label);

    // const toast = useToast();
    const router = useRouter();
    const route = useRoute();

    watch(()=>route.name, ()=>{
      // console.log({route, router});
      currentLabelName.value = `${String(route.name ?? "")}`;
    }, { immediate: true })

    return ()=>{

      return vnd("div", { class: [
        "--bg-var-p-zinc-800 overflow-auto",
        "md:px-0.5rem md:py-0.75rem h-100dvh w-100dvw",
        "stack-v",
        // "mx-auto",
      ] }, [

        vnd(Menubar, {
          // class: "my-6rem!",
          class: [
            "md:max-w-768px md:mx-auto w-100%",
            "border-none! bg-transparent!",
          ],
          breakpoint: "0px",
          model: [

            window?.location?.hostname != "localhost" ? null :
            { label: 'Dev Ref', icon: 'pi pi-external-link', items: [
              { label: 'Dexie', items: [
                { label: 'Dexie', url: 'https://dexie.org', target: '_blank' },
                { label: 'Design', url: 'https://dexie.org/docs/Tutorial/Design', target: '_blank' },
                { label: "Version.stores()", url: "https://dexie.org/docs/Version/Version.stores()", target: "_blank" },
                { label: 'IDB入门', url: 'https://juejin.cn/post/7025592963002531871', target: '_blank' },
                { label: "supported-operations", url: "https://github.com/dexie/Dexie.js#supported-operations", target: "_blank" },
                { label: "Tutorial/Vue", url: "https://dexie.org/docs/Tutorial/Vue", target: "_blank" },
                { label: "liveQuery()", url: "https://dexie.org/docs/liveQuery()", target: "_blank" },
                { label: "version()", url: "https://dexie.org/docs/Dexie/Dexie.version()", target: "_blank" },
              ]},
              { label: 'D3', items: [
                { label: 'd3-dispatch', url: 'https://d3js.org/d3-dispatch', target: '_blank' },
              ]},
              { label: 'vue-icons', url: 'https://vue-icons.kalimah-apps.com/getting-started.html', target: '_blank' },
              { label: 'Prime Icons', url: 'https://primevue.org/icons/', target: '_blank' },
              { label: 'UnoCSS', url: 'https://unocss.dev/interactive/', target: '_blank' },
              { label: 'Vue I18n', url: 'https://vue-i18n.intlify.dev/guide/advanced/composition.html', target: '_blank' },
              { label: 'VueUse', url: 'https://vueuse.org/', target: '_blank' },
              { label: 'Vue Router', url: 'https://router.vuejs.org/zh/guide/', target: '_blank' },
              { label: 'Pinia', url: 'https://pinia.vuejs.org/zh/core-concepts/', target: '_blank' },
              { label: 'Pinia Persisted', url: 'https://prazdevs.github.io/pinia-plugin-persistedstate/guide/config.html', target: '_blank' },
              { label: 'zipson', url: 'https://jgranstrom.github.io/zipson/', target: '_blank' },
              { label: 'vue render func', url: 'https://cn.vuejs.org/guide/extras/render-function.html', target: '_blank' },
              { label: 'vuejs.org', url: 'https://vuejs.org/', target: '_blank' },
              { label: 'vuejs.dev', url: 'https://vuejs.dev/', target: '_blank' },
              { label: 'Dexie.js', url: 'https://dexie.org/docs/Tutorial/Vue', target: '_blank' },
              { label: 'test', url: '#daf/ewf/2efw3?asd:df=w23?df' },
            ]},


            { label: "原作", icon: 'pi pi-globe', url: 'https://liferestart.syaro.io/public/index.html', target: '_blank', },
            { label: "GitHub", icon: 'pi pi-github', url: 'https://github.com/kitools/deepseek-token-counter', target: '_blank', },
            { label: "theme",
              icon: `pi pi-${isDarkModeOn.value ? "moon" : "sun"}`,
              command: () => { toggleDarkMode(); },
            },
            // { label: `${locale!.value} | ${i18nLocale!.value}`,
            //   icon: 'pi pi-language',
            //   items: availableLocales?.value?.map(it=>({
            //     label: it, icon: 'pi pi-flag',
            //     command: () => { setLocale(it, i18nLocale); },
            //   })),
            // },
            // { label: "root", icon: 'pi pi-globe',
            //   command: () => { router.push({ name: "root" }); },
            // },


          ].filter(it=>it!=null),
          pt: {
            rootList: {
              class: "ml-auto!",
            },
          },
        }, {
          start: ()=>vnd("span", { class: "font-bold mx-0.5rem" }, APP_NAME),
        }),

        vnd("div", { class: [
          "--md:rounded-0.5rem --md:border-2 md:max-w-768px md:mx-auto",
          "w-100% --p-0.75rem bg-var-p-panel-background border-var-p-panel-border-color",
          // "grow-1 overflow-auto",
          "bg-transparent! [background:transparent]!",
        ], style: {
          "--p-panel-background": "transparent",
          "--p-tabs-tablist-background": "transparent",
        } }, [
          vnd(Tabs, {
            class: "bg-transparent!",
            value: currentLabelName.value,
            scrollable: true,
          }, {
            default:()=>vnd(TabList, {
              class: "bg-transparent!",
              pt: {
                "tabList": { class: "bg-transparent! [background:transparent]!", },
              },
            }, {
              default:()=>items.value.map(item=>vnd(Tab, {
                class: "bg-transparent!",
                key: item.label,
                value: item.name,
                onClick: ()=>{
                  if (router.hasRoute(item?.name)) {
                    router.push({ name: item.name });
                  }
                  // item?.command?.();
                },
              }, {
                default: () => vnd("span", {
                  class: "inline-flex flex-row flex-items-center gap-2",
                }, [
                  vnd("i", { class: item.icon }),
                  vnd("span", {}, item.label),
                ]),
              })),
            }),
          }),
        ]),

        vnd("div", { class: [
          "md:rounded-0.5rem md:border-3 md:max-w-768px md:mx-auto",
          "w-100% p-0.75rem bg-var-p-panel-background border-var-p-panel-border-color overflow-auto",
          "grow-1",
        ] }, [



          // vnd("div", {class: ["my-2rem"]}),

          vnd(RouterView),

          // vnd("div", {class: ["my-2rem"]}),



          // vnd("div", {class: ["my-4rem"]}),
        ]),



      ]);
    };
  }
})

export default AppView;
