// @unocss-include

// import _ from "lodash";

import {
  h as vnd, defineComponent,
  // resolveDirective, withDirectives
} from 'vue';

import Panel from 'primevue/panel';
// import Fieldset from 'primevue/fieldset';
import Button from 'primevue/button';
// import ScrollPanel from 'primevue/scrollpanel';
// import Dialog from 'primevue/dialog';

// import { useDarkModeStore } from '@stores/darkMode';
// import { storeToRefs } from 'pinia';
// import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const HomeView = defineComponent({
  name: "HomeView",
  setup() {

    const router = useRouter();
    // const darkModeStore = useDarkModeStore();
    // const { toggle: toggleDarkMode } = darkModeStore;
    // const { isOn: isDarkModeOn } = storeToRefs(darkModeStore);

    // const toast = useToast();
    // const tooltip = resolveDirective("tooltip");
    // // const ripple = resolveDirective("ripple");

    return ()=>{

      return vnd("div", { class: "container" }, [

        // vnd("div", {
        //   class: ["my-box-normal", "my-3"],
        // }, [
        // ]),

        vnd("div", {class: ["my-4rem"]}),

        // vnd(Fieldset, {
        //   legend: "HELLO",
        //   toggleable: true,
        //   class: "my-3",
        // }, {
        //   default:()=>[

        //     vnd("div", {
        //       class: [ "flex flex-row flex-items-center flex-wrap gap-2 flex-content-around flex-justify-around", ],
        //     }, [
        //       withDirectives(vnd(Button, {
        //         // class: "p-ripple",
        //         icon: `pi pi-${isDarkModeOn.value ? "moon" : "sun"}`,
        //         "aria-label": "Toggle Dark Mode",
        //         onClick: ()=>{
        //           toggleDarkMode();
        //         },
        //         severity: "secondary", outlined: true,
        //       }), [
        //         [tooltip, { value: "Toggle Dark Mode", showDelay: 250, hideDelay: 500 }, "bottom", {bottom: true}],
        //         // [ripple],
        //       ]),
        //       vnd(Button, {
        //         label: "Show", onClick: ()=>{
        //           toast.add({ severity: 'info', summary: 'Info', detail: 'Hello', life: 3000 });
        //         },
        //         severity: "secondary",
        //       }),
        //       vnd(Button, {
        //         label: "Show", onClick: ()=>{
        //           toast.add({ severity: 'info', summary: 'Info', detail: 'Hello', life: 3000 });
        //         },
        //         severity: "contrast",
        //       }),
        //     ]),

        //   ]
        // }),

        vnd(Panel, {
          header: "HELLO",
          toggleable: true,
          class: "my-3",
        }, {
          default:()=>[

            vnd("div", {
              class: [ "flex flex-row flex-items-center flex-wrap gap-2 flex-content-around flex-justify-around", ],
            }, [
              vnd(Button, { label: "go app", onClick: ()=>{
                router.push({name: "app"});
              }}),
              vnd(Button, { label: "go root", onClick: ()=>{
                router.push({name: "root"});
              }}),
            ]),

          ]
        }),

        // vnd(Dialog, {
        //   visible: true,
        //   modal: true,
        //   // unstyled: true,
        //   style: { width: "80vw" },
        //   // closable: false,
        //   // showHeader: false,
        //   maximizable: false,
        //   closeOnEscape: false,
        // }, {
        //   // closeicon: ()=>vnd("span", {}, "X"),
        //   // maximizeicon: ()=>vnd("span", {}, "M"),
        //   // header: ()=>vnd("h5", "EEE"),
        //   default:()=>["HELLO"],
        // }),

      ]);
    };
  }
})

export default HomeView;
