// @unocss-include
// import _ from "lodash";
import {
  h as vnd, defineComponent,
  resolveDirective,
  withDirectives,
  // ref,
} from 'vue';
import Button from 'primevue/button';

// type Component = ReturnType<typeof defineComponent>;

const IconButton = defineComponent({
  name: "IconButton",
  props: [
    "label", "tip", "command", "icon", "class", "tooltipProps", "direction", "focus",
  ],
  setup(
    props,
    // {slots}
  ) {

    // /** directives **/ //
    const tooltip = resolveDirective("tooltip");

    return ()=>{
      const {
        label: _label,
        tip: _tip,
        command: _command,
        icon: _icon,
        class: _class,
        tooltipProps: _tooltipProps,
        direction: _direction,
        focus: _focus,
        ...otherProps
      } = props;
      return withDirectives(vnd(Button, {
        label: _label,
        severity: 'secondary', onClick: _command, outlined: true, ...otherProps,
        class: ["p-var-p-button-padding-y!", _class],
      }, { default: () => (vnd("span", {
        class: "p-button-icon p-button-icon-left pi",
        "data-pc-section": "icon",
      }, vnd((_icon??"span"), {class: "icon-svg"}))), }),[
        [tooltip, {
          value: _tip ?? _label,
          hideDelay: 300,
          autoHide: false,
          ..._tooltipProps,
        }, (_direction ?? "bottom"), {
          [_direction ?? "bottom"]: true,
          focus: _focus,
        }],
      ]);
    };
  }
});
export default IconButton;

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function vueIconToolButton(label: string, icon?: Component, command?: ()=>any, props?: any, tooltipProps?: any) {
//   const tooltip = resolveDirective("tooltip");
//   return withDirectives(vnd(Button, {
//     severity: 'secondary', onClick: command, ...props, outlined: true,
//     class: ["p-var-p-button-padding-y!", props?.class],
//   }, { default: () => (vnd("span", {
//     class: "p-button-icon p-button-icon-left pi",
//     "data-pc-section": "icon",
//   }, vnd((icon??"span"), {class: "icon-svg"}))), }),[
//     [tooltip, { value: label }, "top", {
//       bottom: true, autoHide: false, hideDelay: 300,
//       ...tooltipProps,
//     }],
//   ]);
// };
