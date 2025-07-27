# Telegram 回声机器人

这是一个基于 AdonisJS 和 grammY 构建的 Telegram 回声机器人。机器人会重复用户发送的任何文字消息。

## 功能特性

- 🔄 **回声功能**: 重复用户发送的文字消息
- 🤖 **命令支持**: 支持 `/start` 和 `/help` 命令
- 📝 **日志记录**: 记录所有收到的消息
- 🛠️ **管理接口**: 提供 HTTP API 来管理机器人状态
- 🔧 **优雅关闭**: 应用关闭时自动停止机器人

## 设置步骤

### 1. 创建 Telegram 机器人

1. 在 Telegram 中找到 [@BotFather](https://t.me/botfather)
2. 发送 `/newbot` 命令
3. 按照提示设置机器人名称和用户名
4. 获得机器人 token（格式类似：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

### 2. 配置环境变量

在项目根目录的 `.env` 文件中设置你的机器人 token：

```env
TELEGRAM_BOT_TOKEN=你的机器人token
```

### 3. 启动应用

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## 使用方法

### 与机器人交互

1. 在 Telegram 中找到你的机器人
2. 发送 `/start` 开始使用
3. 发送任何文字消息，机器人会重复它
4. 发送 `/help` 查看帮助信息

### 管理接口

应用提供了 HTTP API 来管理机器人：

- `GET /api/telegram-bot/status` - 获取机器人状态
- `POST /api/telegram-bot/start` - 启动机器人
- `POST /api/telegram-bot/stop` - 停止机器人
- `POST /api/telegram-bot/restart` - 重启机器人

#### 示例请求

```bash
# 获取机器人状态
curl http://localhost:3333/api/telegram-bot/status

# 启动机器人
curl -X POST http://localhost:3333/api/telegram-bot/start

# 停止机器人
curl -X POST http://localhost:3333/api/telegram-bot/stop

# 重启机器人
curl -X POST http://localhost:3333/api/telegram-bot/restart
```

## 项目结构

```
app/
├── controllers/
│   └── telegram_bot_controller.ts    # 机器人管理控制器
└── services/
    └── telegram_bot_service.ts       # 机器人核心服务

providers/
└── telegram_bot_provider.ts          # 机器人生命周期管理

start/
├── env.ts                            # 环境变量配置
└── routes.ts                         # 路由配置
```

## 自定义机器人

你可以通过修改 `app/services/telegram_bot_service.ts` 文件来自定义机器人的行为：

### 添加新命令

```typescript
// 在 setupHandlers() 方法中添加
this.bot.command('weather', (ctx) => {
  ctx.reply('今天天气不错！☀️')
})
```

### 处理不同类型的消息

```typescript
// 处理图片消息
this.bot.on('message:photo', (ctx) => {
  ctx.reply('我收到了一张图片！📸')
})

// 处理语音消息
this.bot.on('message:voice', (ctx) => {
  ctx.reply('我收到了一条语音消息！🎵')
})
```

### 添加内联键盘

```typescript
import { InlineKeyboard } from 'grammy'

this.bot.command('menu', (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('选项 1', 'option_1')
    .text('选项 2', 'option_2')
  
  ctx.reply('请选择一个选项：', { reply_markup: keyboard })
})

// 处理回调查询
this.bot.on('callback_query:data', (ctx) => {
  const data = ctx.callbackQuery.data
  ctx.answerCallbackQuery(`你选择了: ${data}`)
})
```

## 故障排除

### 机器人无法启动

1. 检查 `TELEGRAM_BOT_TOKEN` 是否正确设置
2. 确保 token 格式正确
3. 检查网络连接是否正常
4. 查看应用日志获取详细错误信息

### 机器人不响应消息

1. 确保机器人已启动（检查 `/api/telegram-bot/status`）
2. 检查机器人是否被阻止或删除
3. 查看应用日志是否有错误信息

## 依赖

- [grammY](https://grammy.dev/) - 现代 Telegram Bot 框架
- [AdonisJS](https://adonisjs.com/) - Node.js Web 框架

## 许可证

本项目使用 UNLICENSED 许可证。
