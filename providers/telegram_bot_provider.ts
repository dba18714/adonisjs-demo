import type { ApplicationService } from '@adonisjs/core/types'
import { telegramBotService } from '#services/telegram_bot_service'
import env from '#start/env'

/**
 * Telegram Bot Provider
 * 
 * 这个Provider负责在应用启动时初始化和启动Telegram机器人
 * 并在应用关闭时优雅地停止机器人
 */
export default class TelegramBotProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * 注册服务到容器
   */
  register() {
    // 注册服务到容器（可选，如果需要依赖注入的话）
    // this.app.container.singleton('telegramBot', () => telegramBotService)
  }

  /**
   * 应用启动时的钩子
   */
  async boot() {
    // 在这里可以进行一些初始化工作
  }

  /**
   * 应用完全启动后的钩子
   */
  async start() {
    // 在测试环境中不启动机器人
    if (env.get('NODE_ENV') === 'test') {
      return
    }

    try {
      await telegramBotService.initialize()
      await telegramBotService.start()
    } catch (error) {
      // 如果机器人启动失败，记录错误但不阻止应用启动
      console.error('Telegram机器人启动失败:', error)
    }
  }

  /**
   * 应用关闭时的钩子
   */
  async shutdown() {
    try {
      await telegramBotService.stop()
    } catch (error) {
      console.error('停止Telegram机器人时发生错误:', error)
    }
  }
}
