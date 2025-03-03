// @unocss-include

// import _ from "lodash";
import { h as vnd, defineComponent } from 'vue';
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const NotFoundView = defineComponent({
  name: "NotFoundView",
  setup() {

    const router = useRouter();

    return ()=>{

      return vnd("div", { class: "container" }, [

        vnd("div", {class: ["my-4rem"]}),

        vnd(Panel, {
          header: "404",
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
              vnd(Button, { label: "go root", onClick: ()=>{
                router.push({name: "root"});
              }}),
            ]),

          ]
        }),

      ]);
    };
  }
})

export default NotFoundView;
