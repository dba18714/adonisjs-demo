import type { HttpContext } from '@adonisjs/core/http'
import { telegramBotService } from '#services/telegram_bot_service'

/**
 * Telegram Bot Controller
 * 
 * 提供HTTP接口来管理和监控Telegram机器人
 */
export default class TelegramBotController {
  /**
   * 获取机器人状态
   */
  async status({ response }: HttpContext) {
    try {
      const isActive = telegramBotService.isActive()
      const isUsingWebhook = telegramBotService.isUsingWebhook()
      let botInfo = null
      let webhookInfo = null

      if (isActive) {
        try {
          botInfo = await telegramBotService.getBotInfo()
          if (isUsingWebhook) {
            webhookInfo = await telegramBotService.getWebhookInfo()
          }
        } catch (error) {
          // 如果获取机器人信息失败，仍然返回状态
        }
      }

      return response.json({
        success: true,
        data: {
          isActive,
          isUsingWebhook,
          botInfo,
          webhookInfo,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: '获取机器人状态失败',
        error: error.message
      })
    }
  }

  /**
   * 启动机器人
   */
  async start({ response }: HttpContext) {
    try {
      if (telegramBotService.isActive()) {
        return response.json({
          success: true,
          message: '机器人已经在运行中'
        })
      }

      await telegramBotService.initialize()
      await telegramBotService.start()

      return response.json({
        success: true,
        message: '机器人启动成功'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: '启动机器人失败',
        error: error.message
      })
    }
  }

  /**
   * 停止机器人
   */
  async stop({ response }: HttpContext) {
    try {
      if (!telegramBotService.isActive()) {
        return response.json({
          success: true,
          message: '机器人已经停止'
        })
      }

      await telegramBotService.stop()

      return response.json({
        success: true,
        message: '机器人停止成功'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: '停止机器人失败',
        error: error.message
      })
    }
  }

  /**
   * 重启机器人
   */
  async restart({ response }: HttpContext) {
    try {
      // 先停止
      if (telegramBotService.isActive()) {
        await telegramBotService.stop()
      }

      // 等待一秒
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 重新启动
      await telegramBotService.initialize()
      await telegramBotService.start()

      return response.json({
        success: true,
        message: '机器人重启成功'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: '重启机器人失败',
        error: error.message
      })
    }
  }

  /**
   * 删除 Webhook
   */
  async deleteWebhook({ response }: HttpContext) {
    try {
      await telegramBotService.deleteWebhook()

      return response.json({
        success: true,
        message: 'Webhook 删除成功'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: '删除 Webhook 失败',
        error: error.message
      })
    }
  }

  /**
   * 获取 Webhook 信息
   */
  async getWebhookInfo({ response }: HttpContext) {
    try {
      const webhookInfo = await telegramBotService.getWebhookInfo()

      return response.json({
        success: true,
        data: webhookInfo
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: '获取 Webhook 信息失败',
        error: error.message
      })
    }
  }
}
