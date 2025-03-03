// @unocss-include
// import _ from "lodash";
import {
  h as vnd, defineComponent,
  resolveDirective,
  withDirectives,
  // ref,
} from 'vue';
import Button from 'primevue/button';


const ToolButton = defineComponent({
  name: "ToolButton",
  props: [
    "label", "tip", "command", "class", "tooltipProps", "direction", "focus",
  ],
  setup(
    props,
    // {slots}
  ) {
    // /** directives **/ //
    const tooltip = resolveDirective("tooltip");

    // /** render **/ //
    return ()=>{
      const {
        label: _label,
        tip: _tip,
        command: _command,
        class: _class,
        tooltipProps: _tooltipProps,
        direction: _direction,
        focus: _focus,
        ...otherProps
      } = props;
      if (!_tip?.length) {
        return vnd(Button, {
          label: _label,
          severity: 'secondary', onClick: _command, outlined: true, ...otherProps,
          class: ["p-var-p-button-padding-y!", _class],
        });
      }
      return withDirectives(vnd(Button, {
        label: _label,
        severity: 'secondary', onClick: _command, outlined: true, ...otherProps,
        class: ["p-var-p-button-padding-y!", _class],
      }),[
        [tooltip, {
          value: _tip ?? _label,
          showDelay: 300,
          hideDelay: 300,
          // autoHide: false,
          ..._tooltipProps,
        }, (_direction ?? "bottom"), {
          [_direction ?? "bottom"]: true,
          focus: _focus,
        }],
      ]);
    };
  }
});
export default ToolButton;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toolButton(label: string, command?: ()=>any, props?: any, tooltipProps?: any) {
  return vnd(ToolButton, { label: label, command: command, ...props, tooltipProps: tooltipProps });
};
