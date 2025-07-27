import type { HttpContext } from '@adonisjs/core/http'
import { telegramBotService } from '#services/telegram_bot_service'
import logger from '@adonisjs/core/services/logger'

/**
 * Telegram Webhook Controller
 * 
 * 处理来自 Telegram 的 webhook 请求
 */
export default class TelegramWebhookController {
  /**
   * 处理 Telegram webhook 请求
   */
  async handle({ request, response }: HttpContext) {
    try {
      // 检查机器人是否已初始化
      if (!telegramBotService.isActive()) {
        logger.warn('收到 webhook 请求但机器人未运行')
        return response.status(503).json({
          success: false,
          message: '机器人服务不可用'
        })
      }

      // 检查是否使用 webhook 模式
      if (!telegramBotService.isUsingWebhook()) {
        logger.warn('收到 webhook 请求但机器人未配置为 webhook 模式')
        return response.status(400).json({
          success: false,
          message: '机器人未配置为 webhook 模式'
        })
      }

      // 获取请求体
      const update = request.body()

      // 验证 webhook 密钥（如果设置了）
      const secretToken = request.header('X-Telegram-Bot-Api-Secret-Token')
      if (!telegramBotService.verifyWebhookSecret(secretToken)) {
        logger.warn('Webhook 密钥验证失败')
        return response.status(401).json({
          success: false,
          message: '未授权的请求'
        })
      }

      // 处理更新
      await telegramBotService.handleUpdate(update)
      
      logger.info('Webhook 请求处理成功')
    } catch (error) {
      logger.error('处理 webhook 请求失败:', error)
      return response.status(500).json({
        success: false,
        message: '处理 webhook 请求失败',
        error: error.message
      })
    }
  }

  /**
   * 验证 webhook 端点（用于测试）
   */
  async verify({ response }: HttpContext) {
    try {
      const isActive = telegramBotService.isActive()
      const isUsingWebhook = telegramBotService.isUsingWebhook()
      
      let webhookInfo = null
      if (isActive) {
        try {
          webhookInfo = await telegramBotService.getWebhookInfo()
        } catch (error) {
          // 忽略获取 webhook 信息的错误
        }
      }

      return response.json({
        success: true,
        data: {
          isActive,
          isUsingWebhook,
          webhookInfo,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: '验证 webhook 失败',
        error: error.message
      })
    }
  }
}
