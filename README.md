# 郑淑玉个人作品集首页

首页现采用严格一屏的横版 Bento 结构，重点呈现个人定位、两个 FDE 主项目、身份视角切换与详情页入口。

## 查看页面

直接双击 `index.html` 即可查看。需要使用 Dora 问答时，在本目录运行 `python3 server.py`，再打开 `http://127.0.0.1:8765/`。

## 文件说明

- `index.html`：一屏式首页结构
- `styles.css`：首页与详情占位页的视觉样式
- `app.js`：首页卡片扩张、身份视角切换与 AI 面板
- `project.html`：项目详情页模板
- `explore.html`：项目、方法、经历与个人索引页模板
- `detail.js`：详情页占位内容
- `server.py`：静态页面服务与 Dora 安全连接层
- `AI_INTEGRATION.md`：Dora 本地运行和部署说明

首页文字位于 `index.html`，详情页文字位于 `detail.js`，页面样式集中在 `styles.css`。项目图文和 Demo 地址确认后，再替换当前占位内容。
