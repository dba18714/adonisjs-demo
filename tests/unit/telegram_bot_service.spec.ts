import { test } from '@japa/runner'
import { TelegramBotService } from '#services/telegram_bot_service'

test.group('Telegram Bot Service', () => {
  test('应该能够创建服务实例', ({ assert }) => {
    const service = new TelegramBotService()
    assert.isTrue(service instanceof TelegramBotService)
  })

  test('初始状态应该是未运行', ({ assert }) => {
    const service = new TelegramBotService()
    assert.isFalse(service.isActive())
  })

  test('没有token时初始化应该不会抛出错误', async ({ assert }) => {
    const service = new TelegramBotService()
    
    // 这应该不会抛出错误，只是记录警告
    await assert.doesNotReject(async () => {
      await service.initialize()
    })
  })

  test('未初始化时启动应该抛出错误', async ({ assert }) => {
    const service = new TelegramBotService()
    
    await assert.rejects(async () => {
      await service.start()
    }, '机器人未初始化，请先调用 initialize()')
  })

  test('未初始化时获取机器人信息应该抛出错误', async ({ assert }) => {
    const service = new TelegramBotService()
    
    await assert.rejects(async () => {
      await service.getBotInfo()
    }, '机器人未初始化')
  })
})
