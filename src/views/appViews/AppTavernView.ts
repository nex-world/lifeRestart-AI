// @unocss-include

import markdownit from 'markdown-it';

import {
  h as vnd, defineComponent,
} from 'vue';
import Panel from 'primevue/panel';

const md = markdownit({
  html: true,
  breaks: true,
  linkify: true,
});

const tavernContent = `
如果您喜欢《人生重开模拟器》这种富有叙事感的体验，那么您一定会对 **NexTavern** 感兴趣。

这是由 NEXWORLD 团队打造的下一代 AI 角色扮演与互动叙事平台。

- **智能群聊**：把多个角色拉进同一个房间，观察他们如何互动、争吵或协作。
- **AI辅助创作**：通过对话引导，从一个模糊的想法快速生成丰满的角色设定和挑战关卡。
- **挑战模式**：不再是漫无目的的聊天。设定目标（如说服守卫、套取情报），通过策略和属性达成结局。
- **DnD 跑团体验**：内置完整的 D20 检定系统。力量、敏捷、智力... 让骰子决定你的命运。
- **隐私至上**：所有数据存储在您的浏览器本地，您的故事仅属于您自己。

<div style="display: flex; justify-content: center; width: 100%; margin: 1.5rem 0;">
<a href="https://nexworld.wiki/tavern/" style="display: inline-block; margin: 12px auto; padding: 12px 24px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4); transition: transform 0.2s;">立即启动 NexTavern</a>
</div>

##### 相关链接

- **[立即启动 NexTavern](https://nexworld.wiki/tavern)**: 开启你的 AI 角色扮演之旅。
- **[NEXWORLD 官方网站](https://nexworld.wiki)**: 访问 NEXWORLD 团队官网，探索更多玩法。
- **[产品深度解析](https://nexworld.wiki/blog/why-nextavern-is-different)**: 了解为什么 NexTavern 能让你真正「玩」起来。

---

*“告别无聊的 AI 对话，开启属于你的无限可能。”*
`.trim();

const AppTavernView = defineComponent({
  name: "AppTavernView",
  setup() {
    return ()=>{
      return vnd(Panel, {
        header: `NexTavern`,
        class: "my-3",
      }, {
        default: () => [
          vnd("div", { class: [ "stack-v" ] }, [
            vnd("div", { class: "markdown-body",
              innerHTML: md.render(tavernContent.trim()),
            }), 
          ]),
        ]
      });
    };
  }
})

export default AppTavernView;
