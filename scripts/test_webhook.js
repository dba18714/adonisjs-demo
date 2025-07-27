#!/usr/bin/env node

/**
 * Webhook 测试脚本
 *
 * 这个脚本可以帮助你测试 webhook 功能
 */

import https from 'https'
import http from 'http'

// 配置
const config = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  appUrl: process.env.APP_URL || 'http://localhost:3333',
}

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 发送 HTTP 请求
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    
    const req = client.request(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve({ status: res.statusCode, data: parsed })
        } catch (e) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })
    
    req.on('error', reject)
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

// 测试应用状态
async function testAppStatus() {
  log('\n🔍 测试应用状态...', 'blue')
  
  try {
    const response = await makeRequest(`${config.appUrl}/api/telegram-bot/status`)
    
    if (response.status === 200) {
      log('✅ 应用运行正常', 'green')
      log(`   机器人状态: ${response.data.data.isActive ? '运行中' : '未运行'}`)
      log(`   使用模式: ${response.data.data.isUsingWebhook ? 'Webhook' : 'Long Polling'}`)
      
      if (response.data.data.botInfo) {
        log(`   机器人名称: ${response.data.data.botInfo.first_name}`)
        log(`   用户名: @${response.data.data.botInfo.username}`)
      }
      
      return true
    } else {
      log('❌ 应用状态异常', 'red')
      return false
    }
  } catch (error) {
    log(`❌ 无法连接到应用: ${error.message}`, 'red')
    return false
  }
}

// 测试 webhook 验证端点
async function testWebhookVerify() {
  log('\n🔍 测试 Webhook 验证端点...', 'blue')
  
  try {
    const response = await makeRequest(`${config.appUrl}/telegram/webhook/verify`)
    
    if (response.status === 200) {
      log('✅ Webhook 验证端点正常', 'green')
      log(`   机器人状态: ${response.data.data.isActive ? '运行中' : '未运行'}`)
      log(`   使用 Webhook: ${response.data.data.isUsingWebhook ? '是' : '否'}`)
      
      if (response.data.data.webhookInfo) {
        const info = response.data.data.webhookInfo
        log(`   当前 Webhook URL: ${info.url || '未设置'}`)
        log(`   待处理更新数: ${info.pending_update_count}`)
      }
      
      return true
    } else {
      log('❌ Webhook 验证端点异常', 'red')
      return false
    }
  } catch (error) {
    log(`❌ 无法访问 Webhook 验证端点: ${error.message}`, 'red')
    return false
  }
}

// 测试 Telegram API
async function testTelegramAPI() {
  log('\n🔍 测试 Telegram API 连接...', 'blue')
  
  if (!config.botToken) {
    log('❌ 未设置 TELEGRAM_BOT_TOKEN', 'red')
    return false
  }
  
  try {
    const url = `https://api.telegram.org/bot${config.botToken}/getMe`
    const response = await makeRequest(url)
    
    if (response.status === 200 && response.data.ok) {
      log('✅ Telegram API 连接正常', 'green')
      log(`   机器人名称: ${response.data.result.first_name}`)
      log(`   用户名: @${response.data.result.username}`)
      return true
    } else {
      log('❌ Telegram API 连接失败', 'red')
      log(`   错误: ${response.data.description || '未知错误'}`)
      return false
    }
  } catch (error) {
    log(`❌ 无法连接到 Telegram API: ${error.message}`, 'red')
    return false
  }
}

// 获取当前 webhook 信息
async function getCurrentWebhookInfo() {
  log('\n🔍 获取当前 Webhook 信息...', 'blue')
  
  if (!config.botToken) {
    log('❌ 未设置 TELEGRAM_BOT_TOKEN', 'red')
    return false
  }
  
  try {
    const url = `https://api.telegram.org/bot${config.botToken}/getWebhookInfo`
    const response = await makeRequest(url)
    
    if (response.status === 200 && response.data.ok) {
      const info = response.data.result
      log('✅ 成功获取 Webhook 信息', 'green')
      log(`   URL: ${info.url || '未设置'}`)
      log(`   自定义证书: ${info.has_custom_certificate ? '是' : '否'}`)
      log(`   待处理更新数: ${info.pending_update_count}`)
      log(`   最后错误日期: ${info.last_error_date ? new Date(info.last_error_date * 1000).toLocaleString() : '无'}`)
      log(`   最后错误信息: ${info.last_error_message || '无'}`)
      return true
    } else {
      log('❌ 获取 Webhook 信息失败', 'red')
      return false
    }
  } catch (error) {
    log(`❌ 无法获取 Webhook 信息: ${error.message}`, 'red')
    return false
  }
}

// 主函数
async function main() {
  log('🚀 开始 Webhook 测试...', 'yellow')
  
  const results = []
  
  // 运行所有测试
  results.push(await testAppStatus())
  results.push(await testWebhookVerify())
  results.push(await testTelegramAPI())
  results.push(await getCurrentWebhookInfo())
  
  // 总结
  log('\n📊 测试结果总结:', 'yellow')
  const passed = results.filter(r => r).length
  const total = results.length
  
  if (passed === total) {
    log(`✅ 所有测试通过 (${passed}/${total})`, 'green')
  } else {
    log(`❌ 部分测试失败 (${passed}/${total})`, 'red')
  }
  
  // 提供建议
  log('\n💡 使用建议:', 'blue')
  log('1. 确保应用正在运行: npm run dev')
  log('2. 检查环境变量配置')
  log('3. 如果使用 webhook，确保 URL 可以从公网访问')
  log('4. 查看应用日志获取详细错误信息')
}

// 运行测试
main().catch(error => {
  log(`❌ 测试过程中发生错误: ${error.message}`, 'red')
  process.exit(1)
})
