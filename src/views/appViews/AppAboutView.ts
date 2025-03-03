// @unocss-include

// import _ from "lodash";

import markdownit from 'markdown-it';

import {
  h as vnd, defineComponent,
} from 'vue';
import Panel from 'primevue/panel';
// import { useToast } from 'primevue/usetoast';

const md = markdownit({
  breaks: true,
  linkify: true,
});

const readMeText = `
### 人生重开模拟器AI版

本项目是《人生重开模拟器AI版》(Life Restart Simulator AI Edition)，由 [NEXWORLD](https://github.com/nex-world) 项目组基于知名小游戏《[人生重开模拟器](https://github.com/VickScarlet/lifeRestart)》修改重制而成。我们在原版基础上，创新性地集成了大语言模型(LLM)人工智能技术，通过AI自动生成详细、丰富、个性化的人生故事和生涯发展轨迹。

#### 核心特点

- 🎲 随机人生模拟
- 🤖 AI驱动的故事生成
- 📝 个性化生涯发展
- 🌟 多样化人生轨迹

目前本项目仍在积极开发中。欢迎关注我们的更新，体验不一样的人生重开之旅！

#### 相关推荐

- [**NexWorld**](https://nexworld.wiki) : AI 驱动的图文冒险游戏。

`;
// <!--本项目是《人生重开模拟器AI版》，基于知名小游戏《[人生重开模拟器](https://github.com/VickScarlet/lifeRestart)》修改重制而成。在其基础上，增加了通过 AI（LLM）来生成生涯详细故事的功能。目前本项目仍在开发中。欢迎关注。-->

const AppAboutView = defineComponent({
  name: "AppAboutView",
  setup() {

    // const toast = useToast();

    return ()=>{
      return vnd(Panel, {
        header: `说明`,
        class: "my-3",
      }, {
        default: () => [
          vnd("div", { class: [ "stack-v" ] }, [

            vnd("div", { class: "markdown-body",
              innerHTML: md.render(readMeText.trim()),
            }), 

          ]),
        ]
      });
    };
  }
})

export default AppAboutView;
