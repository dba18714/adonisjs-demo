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
}).prefix('/api/telegram-bot')
