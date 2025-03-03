// @unocss-include

// import _ from "lodash";

import {
  h as vnd,
  defineComponent,
  ref,
  // reactive,
  onMounted,
  onUnmounted,
  watch,
} from 'vue';

import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import ProgressSpinner from 'primevue/progressspinner';


function isString(str: unknown): str is string {
  return typeof str === 'string';
}

/**
 * Return typed content and typing status when typing is enabled.
 * Or return content directly.
 */
export const useTypedEffect = (
  content: string | object,
  typingEnabled: boolean,
  typingStep: number,
  typingInterval: number,
) => {
  const prevContent = ref<string | object>('');
  const typingIndex = ref<number>(1);

  const mergedTypingEnabled = typingEnabled && isString(content);

  // Reset typing index when content changed
  watch(() => content, (newContent: string | object) => {
    prevContent.value = newContent;
    if (!mergedTypingEnabled && isString(newContent)) {
      typingIndex.value = newContent.length;
    } else if (isString(newContent) && isString(prevContent.value) && newContent.indexOf(prevContent.value) !== 0) {
      typingIndex.value = 1;
    }
  });

  // Start typing
  onMounted(() => {
    let id: number;
    const startTyping = () => {
      if (mergedTypingEnabled && typingIndex.value < (content as string).length) {
        id = window.setTimeout(() => {
          typingIndex.value += typingStep;
          startTyping();
        }, typingInterval);
      }
    };
    startTyping();

    onUnmounted(() => {
      clearTimeout(id);
    });
  });

  const mergedTypingContent = mergedTypingEnabled ? (content as string).slice(0, typingIndex.value) : content;

  return [mergedTypingContent, mergedTypingEnabled && typingIndex.value < (content as string).length];
};



export default defineComponent({
  name: 'MyBubble',
  props: [
    "avatarProps",
    "loadingProps",
    "placement",
    "typing",
    "loading",
    "onTypingComplete",
    "messageRender",
    "content",

    "prefixCls",
  ],
  // props: {
  //   avatar: [Object, String],
  //   placement: {
  //     type: String,
  //     default: 'start',
  //   },
  //   loading: {
  //     type: Boolean,
  //     default: false,
  //   },
  //   loadingRender: Function,
  //   typing: [Boolean, Object],
  //   content: {
  //     type: String,
  //     default: '',
  //   },
  //   messageRender: Function,
  //   variant: {
  //     type: String,
  //     default: 'filled',
  //   },
  //   shape: String,
  //   onTypingComplete: Function,
  //   header: String,
  //   footer: String,
  // },
  setup(props, {slots}) {

    const [typingEnabled, typingStep, typingInterval, typingSuffix] = props.typing ? [true, props.typing?.step, props.typing?.interval, props.typing?.suffix??"|"] : [false, 0, 0, ''];
    const [typedContent, isTyping] = useTypedEffect(props.content, typingEnabled, typingStep, typingInterval);
    const renderedContent = props.messageRender ? props.messageRender(typedContent) : typedContent;
    const divRef = ref<HTMLElement | null>(null);

    const triggerTypingCompleteRef = ref(false);
    onMounted(() => {
      if (!isTyping && !props.loading) {
        if (!triggerTypingCompleteRef.value) {
          triggerTypingCompleteRef.value = true;
          props.onTypingComplete?.();
        }
      } else {
        triggerTypingCompleteRef.value = false;
      }
    });

    return () => (
      vnd('div', {
        ref: divRef,
        class: [
          'my-bubble',
          '---overflow-x-auto',
          'stack-h w-100% flex-nowrap!',
          props.placement=='end' ? 'justify-content-end! flex-row-reverse!' : 'justify-content-start',
          props?.avatarProps ? 'mt-0.75rem' : null,
        ],
        // ...props,
      }, [

        vnd('div', {
          class: [
            `my-bubble--avatar-wrapper`,
            'flex-basis-auto',
            props.placement=='end' ? 'items-end!' : 'items-start!',
          ],
        }, [
          vnd(Avatar, {
            // shape:"circle",
            size: "large",
            ...props?.avatarProps,
            class: [
              "overflow-hidden",
              props?.avatarProps ? null : "opacity-0 pointer-events-none",
              props?.avatarProps?.class,
            ],
          }),
        ]),

        vnd('div', {
          class: [
            `my-bubble--content-wrapper`,
            'stack-v my-0.25rem flex-basis-auto',
            props.placement=='end' ? 'items-end!' : 'items-start!',
          ],
        }, [
          slots.header && slots.header?.(),

          props.loading ? (vnd(ProgressSpinner, { strokeWidth: 6, animationDuration: ".25s", ...props?.loadingProps, class: "w-28px! h-28px!" })) : vnd(Card, {
            pt: { "body": { class: "p-0.75rem!" } }
          }, { content: () => [
            // renderedContent,
            vnd('div', { class: "markdown-body", innerHTML: renderedContent }),
            isTyping && typingSuffix
          ] }),

          slots.footer && slots.footer?.(),
        ]),

        vnd('div', {
          class: [
            `my-bubble--tail`,
            'w-16rem',
          ],
        }),


      ])
    );
  }
});
