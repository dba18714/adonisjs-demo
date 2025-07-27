/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => 'It works!')

// Telegram Bot 管理路由
router.group(() => {
  router.get('/status', '#controllers/telegram_bot_controller.status')
  router.post('/start', '#controllers/telegram_bot_controller.start')
  router.post('/stop', '#controllers/telegram_bot_controller.stop')
  router.post('/restart', '#controllers/telegram_bot_controller.restart')
  router.delete('/webhook', '#controllers/telegram_bot_controller.deleteWebhook')
  router.get('/webhook/info', '#controllers/telegram_bot_controller.getWebhookInfo')
}).prefix('/api/telegram-bot')

// Telegram Webhook 路由
router.post('/telegram/webhook', '#controllers/telegram_webhook_controller.handle')
router.get('/telegram/webhook/verify', '#controllers/telegram_webhook_controller.verify')
