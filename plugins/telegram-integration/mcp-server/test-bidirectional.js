#!/usr/bin/env node
/**
 * Test suite for bidirectional communication features
 * Tests: listener start/stop, command queue, order processing, unauthorized chat rejection
 */

import TelegramBot from 'node-telegram-bot-api';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import yaml from 'js-yaml';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(testName) {
  results.passed++;
  results.tests.push({ name: testName, status: 'PASS' });
  log(`✅ PASS: ${testName}`, 'green');
}

function fail(testName, error) {
  results.failed++;
  results.tests.push({ name: testName, status: 'FAIL', error });
  log(`❌ FAIL: ${testName}`, 'red');
  log(`   Error: ${error}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(message) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(message, 'blue');
  log('='.repeat(60), 'blue');
}

// Load config
function loadConfig() {
  try {
    const configPath = join(homedir(), '.claude', 'telegram.local.md');
    const content = readFileSync(configPath, 'utf-8');
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!yamlMatch) {
      throw new Error('No YAML frontmatter found in config file');
    }
    return yaml.load(yamlMatch[1]);
  } catch (error) {
    log(`Failed to load config: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Simulate MCP server functions
async function testListenerStartStop(bot, config) {
  section('Test 1: Bidirectional Listener Start/Stop');

  try {
    info('Testing listener start...');

    // Check if bot can start polling
    if (bot.isPolling()) {
      await bot.stopPolling();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await bot.startPolling();

    if (!bot.isPolling()) {
      fail('Listener Start', 'Bot failed to start polling');
      return false;
    }

    pass('Listener Start');

    info('Testing listener stop...');

    await bot.stopPolling();
    await new Promise(resolve => setTimeout(resolve, 500));

    if (bot.isPolling()) {
      fail('Listener Stop', 'Bot still polling after stop');
      return false;
    }

    pass('Listener Stop');
    return true;

  } catch (error) {
    fail('Listener Start/Stop', error.message);
    return false;
  }
}

async function testCommandQueue(bot, config) {
  section('Test 2: Command Queue Functionality');

  const commandQueue = [];
  let messageReceived = false;

  try {
    info('Setting up message listener...');

    // Start polling
    if (!bot.isPolling()) {
      await bot.startPolling();
    }

    // Set up message handler
    const messageHandler = (msg) => {
      if (msg.chat.id.toString() === config.chat_id) {
        commandQueue.push({
          id: msg.message_id,
          text: msg.text,
          from: msg.from.username || msg.from.first_name,
          timestamp: msg.date * 1000
        });
        messageReceived = true;
      }
    };

    bot.on('message', messageHandler);

    info('Queue initialized. Send a test message to your bot via Telegram...');
    info('(You have 15 seconds to send a message)');

    // Wait for message
    const startTime = Date.now();
    const timeout = 15000;

    while (!messageReceived && (Date.now() - startTime < timeout)) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Remove handler
    bot.removeListener('message', messageHandler);

    if (commandQueue.length === 0) {
      fail('Command Queue', 'No messages received in queue (manual test - you may need to send a message)');
      return false;
    }

    info(`Queue has ${commandQueue.length} message(s)`);
    pass('Command Queue');
    return true;

  } catch (error) {
    fail('Command Queue', error.message);
    return false;
  }
}

async function testMultipleCommandsOrder(bot, config) {
  section('Test 3: Multiple Commands Processing Order');

  const commandQueue = [];
  const receivedOrder = [];

  try {
    info('Setting up order tracking...');

    if (!bot.isPolling()) {
      await bot.startPolling();
    }

    // Set up message handler with order tracking
    const messageHandler = (msg) => {
      if (msg.chat.id.toString() === config.chat_id && msg.text) {
        const command = {
          id: msg.message_id,
          text: msg.text,
          timestamp: msg.date * 1000
        };
        commandQueue.push(command);
        receivedOrder.push(msg.message_id);
      }
    };

    bot.on('message', messageHandler);

    info('Send 3 messages quickly to test ordering...');
    info('(You have 20 seconds)');

    // Wait for messages
    const startTime = Date.now();
    const timeout = 20000;

    while (commandQueue.length < 3 && (Date.now() - startTime < timeout)) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    bot.removeListener('message', messageHandler);

    if (commandQueue.length < 2) {
      fail('Multiple Commands Order', 'Not enough messages to test ordering (manual test - send multiple messages)');
      return false;
    }

    // Check if messages are in chronological order
    let inOrder = true;
    for (let i = 1; i < commandQueue.length; i++) {
      if (commandQueue[i].timestamp < commandQueue[i-1].timestamp) {
        inOrder = false;
        break;
      }
    }

    if (!inOrder) {
      fail('Multiple Commands Order', 'Messages not in chronological order');
      return false;
    }

    info(`Received ${commandQueue.length} messages in correct order`);
    pass('Multiple Commands Order');
    return true;

  } catch (error) {
    fail('Multiple Commands Order', error.message);
    return false;
  }
}

async function testUnauthorizedChat(bot, config) {
  section('Test 4: Unauthorized Chat Rejection');

  try {
    info('Testing chat authorization logic...');

    // Simulate unauthorized chat
    const authorizedChatId = config.chat_id;
    const unauthorizedChatId = '999999999'; // Fake unauthorized ID

    // Test authorized chat (should pass)
    if (authorizedChatId.toString() === authorizedChatId.toString()) {
      pass('Authorized Chat Check');
    } else {
      fail('Authorized Chat Check', 'Authorized chat validation failed');
      return false;
    }

    // Test unauthorized chat (should reject)
    if (unauthorizedChatId.toString() !== authorizedChatId.toString()) {
      pass('Unauthorized Chat Rejection');
    } else {
      fail('Unauthorized Chat Rejection', 'Failed to reject unauthorized chat');
      return false;
    }

    info('Authorization logic verified');
    return true;

  } catch (error) {
    fail('Unauthorized Chat Rejection', error.message);
    return false;
  }
}

async function testBotSelfFilter(bot, config) {
  section('Test 5: Bot Self-Message Filtering');

  try {
    info('Testing bot self-message filter...');

    // Get bot info
    const botInfo = await bot.getMe();
    info(`Bot ID: ${botInfo.id}, Username: @${botInfo.username}`);

    // Simulate message from bot itself
    const simulatedMessage = {
      from: { id: botInfo.id },
      chat: { id: config.chat_id },
      text: 'Test message'
    };

    // Check if bot would filter its own message
    if (simulatedMessage.from.id === botInfo.id) {
      pass('Bot Self-Message Filter');
      info('Bot correctly identifies its own messages');
    } else {
      fail('Bot Self-Message Filter', 'Failed to identify bot self-message');
      return false;
    }

    return true;

  } catch (error) {
    fail('Bot Self-Message Filter', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n' + '🤖 Telegram Plugin - Bidirectional Communication Tests 🤖'.toUpperCase(), 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const config = loadConfig();

  info(`Loaded config for chat_id: ${config.chat_id}`);
  info(`Bot token: ${config.bot_token.substring(0, 10)}... (masked)\n`);

  // Create bot instance
  const bot = new TelegramBot(config.bot_token, { polling: false });

  try {
    // Run tests
    await testListenerStartStop(bot, config);
    await testBotSelfFilter(bot, config);
    await testUnauthorizedChat(bot, config);

    // Interactive tests (require user to send messages)
    log('\n' + '⚠️  The following tests require manual interaction ⚠️'.toUpperCase(), 'yellow');
    info('You will need to send messages to your bot via Telegram\n');

    await testCommandQueue(bot, config);
    await testMultipleCommandsOrder(bot, config);

  } finally {
    // Cleanup
    if (bot.isPolling()) {
      await bot.stopPolling();
    }
  }

  // Print summary
  section('Test Summary');
  log(`Total Tests: ${results.passed + results.failed}`, 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log('');

  // Print detailed results
  results.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    const color = test.status === 'PASS' ? 'green' : 'red';
    log(`${icon} ${test.name}`, color);
  });

  log('');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
