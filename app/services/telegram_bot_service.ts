import { Bot } from 'grammy'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

/**
 * Telegram Bot Service
 * 
 * 这个服务管理Telegram机器人的生命周期和消息处理
 */
export class TelegramBotService {
  private bot: Bot | null = null
  private isRunning = false
  private useWebhook = false
  private webhookUrl: string | null = null
  private webhookSecret: string | null = null

  /**
   * 初始化机器人
   */
  public async initialize(): Promise<void> {
    const token = env.get('TELEGRAM_BOT_TOKEN')

    if (!token) {
      logger.warn('TELEGRAM_BOT_TOKEN 未设置，Telegram机器人将不会启动')
      return
    }

    // 读取webhook配置
    this.useWebhook = env.get('TELEGRAM_USE_WEBHOOK', true)
    this.webhookUrl = new URL('/telegram/webhook', 'https://' + env.get('DOMAIN')).toString()
    this.webhookSecret = env.get('TELEGRAM_WEBHOOK_SECRET') || null

    try {
      this.bot = new Bot(token)

      // 初始化机器人信息（webhook模式必需）
      await this.bot.init()

      this.setupHandlers()
      logger.info('Telegram机器人初始化成功')

      if (this.useWebhook) {
        logger.info('机器人配置为使用 Webhook 模式')
      } else {
        logger.info('机器人配置为使用 Long Polling 模式')
      }
    } catch (error) {
      logger.error('Telegram机器人初始化失败:', error)
      throw error
    }
  }

  /**
   * 设置消息处理器
   */
  private setupHandlers(): void {
    if (!this.bot) return

    // 处理 /start 命令
    this.bot.command('start', (ctx) => {
      const firstName = ctx.from?.first_name || '朋友'
      ctx.reply(`你好 ${firstName}！👋\n\n我是一个回声机器人，我会重复你发送给我的任何消息。\n\n试着给我发送一些文字吧！`)
    })

    // 处理 /help 命令
    this.bot.command('help', (ctx) => {
      ctx.reply(`🤖 回声机器人帮助\n\n可用命令：\n/start - 开始使用机器人\n/help - 显示此帮助信息\n\n只需发送任何文字消息，我就会重复它！`)
    })

    // 处理所有文本消息（回声功能）
    this.bot.on('message:text', (ctx) => {
      const userMessage = ctx.message.text
      const userName = ctx.from?.first_name || '用户'

      // 记录收到的消息
      logger.info(`收到来自 ${userName} 的消息: ${userMessage}`)

      // 回声响应
      ctx.reply(`🔄 你说: "${userMessage}"`)
    })

    // 处理其他类型的消息
    this.bot.on('message', (ctx) => {
      ctx.reply('抱歉，我只能回复文字消息。请发送文字给我！📝')
    })

    // 错误处理
    this.bot.catch((err) => {
      logger.error('机器人处理消息时发生错误:', err)
    })
  }

  /**
   * 启动机器人
   */
  public async start(): Promise<void> {
    if (!this.bot) {
      throw new Error('机器人未初始化，请先调用 initialize()')
    }

    if (this.isRunning) {
      logger.warn('机器人已经在运行中')
      return
    }

    try {
      if (this.useWebhook && this.webhookUrl) {
        // 使用 Webhook 模式
        await this.setupWebhook()
        logger.info('Telegram机器人 Webhook 设置成功')
      } else {
        // 使用 Long Polling 模式
        this.bot.start().catch((error) => {
          logger.error('启动Telegram机器人失败:' + error)
        })
        logger.info('Telegram机器人 Long Polling 启动成功')
      }
      this.isRunning = true
    } catch (error) {
      logger.error('启动Telegram机器人失败:', error)
      throw error
    }
  }

  /**
   * 停止机器人
   */
  public async stop(): Promise<void> {
    if (!this.bot || !this.isRunning) {
      return
    }

    try {
      await this.bot.stop()
      this.isRunning = false
      logger.info('Telegram机器人已停止')
    } catch (error) {
      logger.error('停止Telegram机器人失败:', error)
      throw error
    }
  }

  /**
   * 获取机器人信息
   */
  public async getBotInfo() {
    if (!this.bot) {
      throw new Error('机器人未初始化')
    }

    try {
      const me = await this.bot.api.getMe()
      return me
    } catch (error) {
      logger.error('获取机器人信息失败:', error)
      throw error
    }
  }

  /**
   * 设置 Webhook
   */
  private async setupWebhook(): Promise<void> {
    if (!this.bot || !this.webhookUrl) {
      throw new Error('机器人未初始化或 Webhook URL 未设置')
    }

    try {
      // const webhookOptions: any = {
      //   url: this.webhookUrl,
      //   drop_pending_updates: true,
      // }

      // if (this.webhookSecret) {
      //   webhookOptions.secret_token = this.webhookSecret
      // }

      // await this.bot.api.setWebhook(webhookOptions)
      await this.bot.api.setWebhook(this.webhookUrl)
      logger.info(`Webhook 设置成功: ${this.webhookUrl}`)
    } catch (error) {
      logger.error('设置 Webhook 失败:', error)
      throw error
    }
  }

  /**
   * 删除 Webhook
   */
  public async deleteWebhook(): Promise<void> {
    if (!this.bot) {
      throw new Error('机器人未初始化')
    }

    try {
      await this.bot.api.deleteWebhook({ drop_pending_updates: true })
      logger.info('Webhook 删除成功')
    } catch (error) {
      logger.error('删除 Webhook 失败:', error)
      throw error
    }
  }

  /**
   * 验证 Webhook 密钥
   */
  public verifyWebhookSecret(receivedSecret?: string): boolean {
    // 如果没有设置密钥，则跳过验证
    if (!this.webhookSecret) {
      return true
    }

    // 验证密钥是否匹配
    return receivedSecret === this.webhookSecret
  }

  /**
   * 处理 Telegram 更新
   */
  public async handleUpdate(update: any): Promise<void> {
    if (!this.bot) {
      throw new Error('机器人未初始化')
    }

    try {
      await this.bot.handleUpdate(update)
    } catch (error) {
      logger.error('处理 Telegram 更新失败:' + error)
      throw error
    }
  }

  /**
   * 获取 Webhook 信息
   */
  public async getWebhookInfo() {
    if (!this.bot) {
      throw new Error('机器人未初始化')
    }

    try {
      const info = await this.bot.api.getWebhookInfo()
      return info
    } catch (error) {
      logger.error('获取 Webhook 信息失败:', error)
      throw error
    }
  }

  /**
   * 检查机器人是否正在运行
   */
  public isActive(): boolean {
    return this.isRunning
  }

  /**
   * 检查是否使用 Webhook 模式
   */
  public isUsingWebhook(): boolean {
    return this.useWebhook
  }
}

// 导出单例实例
export const telegramBotService = new TelegramBotService()
