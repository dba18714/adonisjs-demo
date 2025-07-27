# Telegram Bot Webhook 配置指南

## 什么是 Webhook？

Webhook 是一种更高效的接收 Telegram 消息的方式。与 Long Polling（轮询）不同，Webhook 让 Telegram 服务器直接向你的应用发送消息，减少延迟和服务器负载。

## Long Polling vs Webhook

### Long Polling（默认模式）
- ✅ 配置简单，无需公网 IP
- ✅ 适合开发和测试
- ❌ 延迟较高
- ❌ 服务器资源消耗较大

### Webhook（推荐生产环境）
- ✅ 实时响应，延迟极低
- ✅ 服务器资源消耗小
- ✅ 更稳定可靠
- ❌ 需要公网 IP 和 HTTPS
- ❌ 配置相对复杂

## Webhook 配置步骤

### 1. 准备服务器环境

你需要：
- 一个有公网 IP 的服务器
- 域名（推荐）
- SSL 证书（HTTPS 必需）

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# 启用 Webhook 模式
TELEGRAM_USE_WEBHOOK=true

# 设置 Webhook URL（必需）
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/telegram/webhook

# 设置 Webhook 密钥（可选但推荐）
TELEGRAM_WEBHOOK_SECRET=your_random_secret_string_here
```

### 3. 生成安全密钥（推荐）

```bash
# 生成随机密钥
openssl rand -hex 32
```

### 4. 启动应用

```bash
npm run build
cd build
npm ci --omit="dev"
node bin/server.js
```

### 5. 验证配置

检查 webhook 状态：
```bash
curl https://yourdomain.com/telegram/webhook/verify
```

查看机器人状态：
```bash
curl https://yourdomain.com/api/telegram-bot/status
```

## 使用 ngrok 进行本地测试

如果你想在本地测试 webhook，可以使用 ngrok：

### 1. 安装 ngrok

```bash
# macOS
brew install ngrok

# 或下载：https://ngrok.com/download
```

### 2. 启动应用

```bash
npm run dev
```

### 3. 启动 ngrok

```bash
ngrok http 3333
```

### 4. 配置 webhook

复制 ngrok 提供的 HTTPS URL，更新 `.env`：

```env
TELEGRAM_USE_WEBHOOK=true
TELEGRAM_WEBHOOK_URL=https://abc123.ngrok.io/telegram/webhook
TELEGRAM_WEBHOOK_SECRET=your_secret_here
```

### 5. 重启应用

```bash
# 停止应用后重新启动
npm run dev
```

## 生产环境部署

### 使用 Nginx 反向代理

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start bin/server.js --name "telegram-bot"

# 设置开机自启
pm2 startup
pm2 save
```

## API 接口

### 管理接口

- `GET /api/telegram-bot/status` - 获取机器人和 webhook 状态
- `DELETE /api/telegram-bot/webhook` - 删除 webhook
- `GET /api/telegram-bot/webhook/info` - 获取 webhook 信息

### Webhook 接口

- `POST /telegram/webhook` - 接收 Telegram 消息
- `GET /telegram/webhook/verify` - 验证 webhook 配置

## 故障排除

### 常见问题

1. **Webhook 设置失败**
   ```
   错误：Webhook URL 无法访问
   解决：确保 URL 可以从公网访问，使用 HTTPS
   ```

2. **SSL 证书问题**
   ```
   错误：SSL 证书无效
   解决：使用有效的 SSL 证书，可以使用 Let's Encrypt
   ```

3. **端口问题**
   ```
   错误：连接被拒绝
   解决：确保防火墙开放了相应端口（通常是 443）
   ```

### 调试命令

```bash
# 检查 webhook 状态
curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"

# 删除 webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"

# 手动设置 webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://yourdomain.com/telegram/webhook"}'
```

### 日志监控

```bash
# 查看应用日志
pm2 logs telegram-bot

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 安全建议

1. **使用 HTTPS**：Telegram 要求 webhook URL 必须使用 HTTPS
2. **设置密钥**：使用 `TELEGRAM_WEBHOOK_SECRET` 验证请求来源
3. **限制访问**：在防火墙中限制只允许 Telegram 服务器访问
4. **监控日志**：定期检查访问日志，发现异常请求

## 性能优化

1. **使用 CDN**：如果有静态资源，使用 CDN 加速
2. **数据库连接池**：如果使用数据库，配置连接池
3. **缓存**：对频繁访问的数据使用缓存
4. **负载均衡**：高并发时使用负载均衡

## 监控和告警

建议设置以下监控：

1. **应用状态监控**：确保应用正常运行
2. **Webhook 状态监控**：定期检查 webhook 是否正常
3. **错误率监控**：监控错误日志
4. **响应时间监控**：确保响应时间在合理范围内
