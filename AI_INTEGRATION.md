# Dora 智能体深度融合说明

网页端已按“深度融合”方式接入 Dora：页面保留自己的输入框、快捷问题和对话气泡，由 `server.py` 的 `/api/chat` 安全转发问题，再显示 Dora 的回答。

## 为什么不让网页直接请求 Dora

如果把 Dora 的密钥写进 `app.js`，任何访问者都能在浏览器里看到并复制。因此正式部署时需要一个很轻的中转接口：

`作品集网页 → /api/chat → Dora 智能体`

密钥仅保存在部署平台的环境变量中，网页代码和 GitHub 仓库都不保存密钥。

## 网页已经约定的请求格式

```json
{
  "message": "招聘者的问题",
  "conversationId": null,
  "context": {
    "key": "projects",
    "title": "当前内容标题",
    "summary": "当前页面的公开简介",
    "projectTitle": "当前项目名称",
    "projectMeta": ["公开的项目字段"],
    "page": "/project.html?case=investment"
  },
  "history": [
    { "role": "user", "content": "上一轮问题" },
    { "role": "assistant", "content": "上一轮回答" }
  ]
}
```

网站内部接口返回：

```json
{
  "answer": "Dora 返回的回答",
  "conversationId": "可选的会话编号"
}
```

这是作品集网页与中转接口之间的固定格式。之后无论 Dora 的原始字段如何变化，只修改中转接口，不需要重做前端。

## 已完成的 Dora 配置

- 已识别并绑定已发布智能体：`Olia的作品集问答助手`。
- 已通过真实问题验证 Dora 回答正常。
- 本地密钥保存在 `.agents/.env`，并已加入 `.gitignore`。
- Dora 的智能体编号可公开，密钥不可公开。

## 本地启动

在项目目录运行：

```bash
python3 server.py
```

然后打开 `http://127.0.0.1:8765/`。即使继续双击 HTML，本地页面也会尝试连接同一地址的 Dora 中转服务。

## 当前预览行为

- 服务已启动且配置有效：状态显示“Dora 智能体已连接”，所有气泡由 Dora 实际回答。
- 服务未启动或 Dora 临时不可用：自动使用页面公开信息回应，不影响作品集浏览。

## 部署要求

静态托管不能单独运行 `server.py`。轻量部署时需要选择支持 Python 服务的平台，并在平台后台配置 `.env.example` 中列出的环境变量。不要上传 `.agents/.env`。
