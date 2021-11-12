import TelegramBot from 'node-telegram-bot-api'
import {
  createInvite,
  verifyBot,
  getLastInvite,
  writeBot,
} from './db'
import {
  randBotName,
  successMSG,
  getInstructionOptions,
} from './utils/common-utils'
import { t } from './translation'
import axios from 'axios'

console.log('__dirname', __dirname)

require('dotenv').config({ path: `__dirname/.env` })

// const url = `https://int.freekassa.ru/notify/telegram`

const banTimeMS = 3000
const token = process.env.BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })
const url = `https://int.free-kassa.org/telegram/auth/verify-telegram-bot`

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data
  const msg = callbackQuery.message

  let text

  if (action.includes('rename_')) {
    let arr = action.split('_')
    text = t(arr[1], 'HOW_TO_RENAME_BOT_INSTRUCTIONS', { botName: arr[2] })
  } else if (action.includes('add_')) {
    let arr = action.split('_')
    text = t(arr[1], 'HOW_TO_ADD_BOT_INSTRUCTIONS', { inviteUrl: process.env.BOT_GROUP_INVITE_URL })
  }

  if (text) {
    bot.sendMessage(msg.chat.id, text)
  }
})

bot.on('message', (msg) => {
  const chatId = msg.chat.id
  const lng = msg.from.language_code
  console.log('msg', msg)

  if (msg.chat?.type === 'private' && msg.from.is_bot === false) {
    const bot_check_name = randBotName(10).toUpperCase()

    if ((msg.text || '').includes('/help')) {
      return false
    } else {
      createInvite({
        tg_user_id: msg.from.id,
        bot_chat_id: msg.chat.id,
        tg_user_name: msg.from.first_name,
        bot_check_name
      })
        .then(res => {
          bot.sendMessage(chatId, t(lng, 'VERIFICATION_INSTRUCTIONS', {
            botName: bot_check_name,
            inviteUrl: process.env.BOT_GROUP_INVITE_URL
          }), {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: getInstructionOptions(bot_check_name, lng) }
          })
        })
        .catch(e => {
          bot.sendMessage(chatId, `Ошибка инициализации проверки бота: ${e.message}`)
        })
    }
  } else if (
    msg.new_chat_members &&
    msg.new_chat_members.length > 0 &&
    msg.chat.type === 'group' &&
    msg.chat.id === +process.env.BOT_GROUP_ID
  ) {

    const validateBots = msg.new_chat_members.map(member => {
      if (member.is_bot) {
        return verifyBot({
          bot_name: member.username,
          tg_user_id: msg.from.id,
          bot_check_name: member.first_name,
        })
          .then(({ bot_chat_id, invite_id }) => {
            const link = `https://t.me/${member.username}`
            axios.post<{ id: number, code: number, tmp_id: string }>(url, { link }, {
              headers: { 'bot-token': process.env.FK_API_TOKEN }
            })
              .then((fkResponse) => {
                const { code, id } = fkResponse.data
                const userUrl = `https://free-kassa.org/auth/registration?bot_confirm=true&tmp_id=${id}`

                writeBot({
                  tg_user_id: msg.from.id,
                  bot_name: member.username,
                  tg_bot_id: member.id,
                  code,
                  invite_id
                }, member.first_name)
                  .then(res => {
                    if (res.bot_chat_id) {
                      // Get code from FK registration
                      bot.sendMessage(bot_chat_id, successMSG({ bot_name: member.username, code, userUrl }))
                      //@ts-ignore
                      bot.kickChatMember(msg.chat.id, msg.from.id)
                      //@ts-ignore
                      bot.kickChatMember(msg.chat.id, member.id, { until_date: Date.now() + banTimeMS })
                    }
                  })
                  .catch(e => {
                    //@ts-ignore
                    // bot.kickChatMember(msg.chat.id, msg.from.id, { until_date: Date.now() + banTimeMS })
                    bot.sendMessage(bot_chat_id, `Ошибка записи бота в базу: ${e.message}`)
                  })
              })
              .catch(e => {
                console.log('e', e)
                console.log('fk_request_errror', e.message);
                console.log('code', e.code);
                //@ts-ignore
                bot.kickChatMember(msg.chat.id, msg.from.id, { until_date: Date.now() + banTimeMS })
                //@ts-ignore
                bot.kickChatMember(msg.chat.id, member.id, { until_date: Date.now() + banTimeMS })
                bot.sendMessage(bot_chat_id, `
                Не можем получить проверочный код для @${member.username}! 
                Ошибка: ${e.message} ${e?.response?.data?.msg || ''}`)
              })
          })
          .catch((e) => {
            getLastInvite(msg.from.id)
              .then(invite => {
                if (invite) {
                  bot.sendMessage(invite.bot_chat_id, `Ошибка инициализации создани бота: ${e.message}`)
                } else {
                  bot.sendMessage(msg.chat.id, `Невозможно найти инвайт, для получения инвайта вступите в бота @${process.env.BOT_USERNAME}`)
                }
              })

            //@ts-ignore
            bot.kickChatMember(msg.chat.id, member.id, { until_date: Date.now() + banTimeMS })
          })
      } else {
        return getLastInvite(msg.from.id)
          .then(invite => {
            if (invite) {
              bot.sendMessage(invite.bot_chat_id, `Добавьте своего бота в группу для верификации.\n Введите /help для получения полной инструкции.`)
            } else {
              bot.sendMessage(msg.chat.id, `Невозможно найти инвайт, для получения инвайта вступите в бота @${process.env.BOT_USERNAME}`)
            }
          })
      }
    })
      .filter(p => p !== null)

    Promise.all(validateBots)
  } else if (msg.from.is_bot === false) {
    //@ts-ignore
    bot.kickChatMember(msg.chat.id, msg.from.id, { until_date: Date.now() + banTimeMS })
    //Kick all chat members?
  }
})
