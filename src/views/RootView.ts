// @unocss-include

// import _ from "lodash";
import { h as vnd, defineComponent } from 'vue';
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const RootView = defineComponent({
  name: "RootView",
  setup() {

    const router = useRouter();

    return ()=>{

      return vnd("div", { class: "container" }, [

        vnd("div", {class: ["my-4rem"]}),

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
              vnd(Button, { label: "go home", onClick: ()=>{
                router.push({name: "home"});
              }}),
            ]),

          ]
        }),

      ]);
    };
  }
})

export default RootView;
