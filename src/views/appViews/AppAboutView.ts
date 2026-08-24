// @unocss-include

// import _ from "lodash";

import markdownit from 'markdown-it';

import {
  h as vnd, defineComponent,
} from 'vue';
import Panel from 'primevue/panel';
import { appVersion } from '@src/--CONFIGS';
// import { useToast } from 'primevue/usetoast';

const md = markdownit({
  breaks: true,
  linkify: true,
});

const readMeText = `
### 🌟 人生重开模拟器 AI 版

本项目是 **《人生重开模拟器 AI 版》** (Life Restart Simulator AI Edition)，由 [NEXWORLD](https://nexworld.wiki) 项目组基于热门开源游戏《[人生重开模拟器](https://github.com/VickScarlet/lifeRestart)》深度重制而成。

我们不仅保留了原版随机人生的趣味性，更通过引入大语言模型 (LLM) 技术，将纯文字的数值模拟进化为极具沉浸感的叙事体验。

#### ✨ 核心亮点

- **🤖 AI 驱动的沉浸式叙事**：不再只是冷冰冰的数字和预设文本。AI 会根据你的属性、天赋和随机事件，实时生成属于你自己的详尽人生回顾和生涯故事。
- **🎮 经典机制的全新进化**：完美继承原版的天赋抽卡、属性分配等核心玩法，并针对 AI 续写进行了深度优化。
- **🛡️ 隐私与数据掌控**：游戏进度、成就与模型配置均保存在本地浏览器中。我们尊重并保护您的创作隐私，您的故事仅属于您自己。
- **🌐 灵活的模型支持**：支持 DeepSeek、OpenAI 等多种主流 AI 供应商，也可添加兼容接口的自定义供应商。
- **🎨 现代化的技术栈**：基于 Vue 3、PrimeVue 4 和 UnoCSS 构建，提供流畅、美观且响应式的交互体验。

#### 🚀 开发计划 (Roadmap)

- [x] 基于 AI 的生涯故事生成
- [x] 多供应商 API 接入与模型自由切换
- [x] 本地存档系统
- [x] 角色成就系统与图鉴收藏
- [x] 名人模式

#### 🔗 相关链接

- **[NexWorld 开源社区](https://nexworld.wiki)**: 探索更多 AI 驱动的互动叙事与游戏实验。
- **[GitHub 仓库](https://github.com/nex-world/lifeRestart-AI)**: 参与贡献或查看代码。

---

*“你的第二次人生，由 AI 妙笔生花。”*
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

            vnd("div", { class: "text-sm opacity-60 mb-3" }, `当前版本：v${appVersion}`),
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
