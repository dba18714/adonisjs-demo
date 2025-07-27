# Telegram 回声机器人使用示例

## 快速开始

### 1. 获取 Telegram Bot Token

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 按照提示设置机器人名称和用户名
4. 复制获得的 token

### 2. 配置环境变量

编辑 `.env` 文件，将 `YOUR_BOT_TOKEN_HERE` 替换为你的实际 token：

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 3. 启动应用

```bash
npm run dev
```

### 4. 测试机器人

1. 在 Telegram 中找到你的机器人
2. 发送 `/start` 开始对话
3. 发送任何文字消息，机器人会重复它

## API 测试示例

### 检查机器人状态

```bash
curl http://localhost:3333/api/telegram-bot/status
```

响应示例：
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "botInfo": {
      "id": 123456789,
      "is_bot": true,
      "first_name": "Echo Bot",
      "username": "your_echo_bot"
    },
    "timestamp": "2025-07-27T21:52:36.802Z"
  }
}
```

### 手动启动机器人

```bash
curl -X POST http://localhost:3333/api/telegram-bot/start
```

### 停止机器人

```bash
curl -X POST http://localhost:3333/api/telegram-bot/stop
```

### 重启机器人

```bash
curl -X POST http://localhost:3333/api/telegram-bot/restart
```

## 机器人命令

- `/start` - 开始使用机器人
- `/help` - 显示帮助信息
- 发送任何文字消息 - 机器人会重复你的消息

## 故障排除

### 常见错误

1. **GrammyError: Call to 'deleteWebhook' failed! (404: Not Found)**
   - 这是正常的，表示机器人之前没有设置 webhook
   - 不影响机器人正常工作

2. **机器人不响应**
   - 检查 token 是否正确
   - 确保机器人状态为 active
   - 查看应用日志

3. **Token 无效**
   - 确保从 @BotFather 获得的 token 格式正确
   - Token 格式应该是：`数字:字母数字字符串`

### 日志查看

应用会记录所有机器人相关的活动：

```bash
# 启动应用时会看到
[INFO] Telegram机器人初始化成功
[INFO] Telegram机器人启动成功

# 收到消息时会看到
[INFO] 收到来自 用户名 的消息: 你好
```

## 生产环境部署

### 1. 构建应用

```bash
npm run build
```

### 2. 安装生产依赖

```bash
cd build
npm ci --omit="dev"
```

### 3. 启动生产服务器

```bash
node bin/server.js
```

### 4. 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start bin/server.js --name "telegram-bot"

# 查看状态
pm2 status

# 查看日志
pm2 logs telegram-bot
```

## 扩展功能

你可以通过修改 `app/services/telegram_bot_service.ts` 来添加更多功能：

### 添加新命令

```typescript
this.bot.command('weather', (ctx) => {
  ctx.reply('今天天气很好！☀️')
})
```

### 处理图片消息

```typescript
this.bot.on('message:photo', (ctx) => {
  ctx.reply('我收到了一张漂亮的图片！📸')
})
```

### 添加内联键盘

```typescript
import { InlineKeyboard } from 'grammy'

this.bot.command('menu', (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('选项 1', 'option_1')
    .text('选项 2', 'option_2')
  
  ctx.reply('请选择：', { reply_markup: keyboard })
})
```
