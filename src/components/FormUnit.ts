// @unocss-include

// import _ from "lodash";

import {
  h as vnd, defineComponent,
  // resolveDirective,
  // withDirectives,
} from 'vue';


const FormUnit = defineComponent({
  name: "FormUnit",
  props: ["label", "help", "id", "fluid", "editing"],
  setup(props, { slots }) {
    return ()=>{
      return vnd("div", {
        class: ["flex flex-col gap-2", props?.fluid ? "w-full" : ""],
      }, [
        props?.label==null ? null :
        vnd("label", {
          class: "color-var-p-text-muted-color font-bold",
          for: props?.id,
        }, props?.label),

        (props?.help==null || !props?.editing) ? null :
        vnd("small", {
          class: "color-var-p-text-muted-color",
          id: `${props?.id}-help`,
        }, props?.help),

        props?.editing ? null :
        slots.default?.({
          id: props?.id,
          "aria-describedby": `${props?.id}-help`,
          fluid: props?.fluid,
        }),

        !props?.editing ? null :
        slots.editor?.({
          id: props?.id,
          "aria-describedby": `${props?.id}-help`,
          fluid: props?.fluid,
        }),
      ]);
    };
  },
});

export default FormUnit;
