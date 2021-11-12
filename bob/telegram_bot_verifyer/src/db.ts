import { сommaBracketFromObj, readFiles, currentTimestamp } from './utils/db-utils'
import { 
  CreateInvitePayload, 
  Invite,
  VerifyPayload,
  VerifyResponse,
  WriteBotPayload,
  WriteBotResponse
} from './types/db'
import { promisify } from 'util'
import connection from './connection'

export const getLastInvite = (tg_user_id: number) => new Promise<Invite | null>(async (resolve, reject) => {
  const query = promisify(connection.query).bind(connection);

  const selectInviteQuery = `SELECT * FROM invites WHERE tg_user_id=${tg_user_id} AND closed=FALSE ORDER BY id DESC LIMIT 1`

  try{
    const invites = await query(selectInviteQuery)
    if (Array.isArray(invites) && invites.length > 0){
      resolve(invites[0])
    } else{
      resolve(null)
    }
  } catch(e){
    reject(e)
  }
})

export const createInvite = (payload: CreateInvitePayload) => new Promise<CreateInvitePayload>(async (resolve, reject) => {
  const { bot_check_name, bot_chat_id, tg_user_id, tg_user_name } = payload
  const TGUserPayload = { tg_user_id, tg_user_name, create_time: currentTimestamp(), update_time: currentTimestamp() }
  const invitePayload = { bot_check_name, bot_chat_id, tg_user_id, create_time: currentTimestamp(), update_time: currentTimestamp()  }

  const checkTGUserQuery = `SELECT * FROM tg_users WHERE tg_user_id=${tg_user_id}`
  const insertTGUserQuery = `INSERT INTO tg_users ${сommaBracketFromObj(TGUserPayload)} VALUES${сommaBracketFromObj(TGUserPayload, { result: 'value' })}`
  const insertInviteQuery = `INSERT INTO invites ${сommaBracketFromObj(invitePayload)} VALUES${сommaBracketFromObj(invitePayload, { result: 'value' })}`
  const updateInviteQuery = (id: number) => `UPDATE invites SET bot_check_name = '${bot_check_name}' WHERE id = ${id}`

  const query = promisify(connection.query).bind(connection);

  try{
    const users = await query(checkTGUserQuery)
    if (Array.isArray(users) && users.length === 0){
      await query(insertTGUserQuery)
      await query(insertInviteQuery)
    } else {
      const lastInvite = await getLastInvite(tg_user_id)
      if (lastInvite){
        await query(updateInviteQuery(lastInvite.id))
      } else {
        await query(insertInviteQuery)
      }
    }

    resolve(payload)
  } catch(e){
    reject(e)
  }

})

export const writeBot = (payload: WriteBotPayload, bot_check_name: string) => new Promise<WriteBotResponse>(async (resolve, reject) => {
    const query = promisify(connection.query).bind(connection);
    const botPayload = { ...payload, create_time: currentTimestamp(), update_time: currentTimestamp() }
    
    const insertBotQuery = `INSERT INTO bots ${сommaBracketFromObj(botPayload)} VALUES${сommaBracketFromObj(botPayload, { result: 'value' })}`
    const selectBotQuery = `SELECT * FROM bots WHERE bot_name = '${payload.bot_name}'`
    const selectInviteQuery = `SELECT * FROM invites WHERE id=${payload.invite_id}`
    const closeInviteQuery = `UPDATE invites SET closed=true WHERE id=${payload.invite_id}`

    try{
      
        const invite = await query(selectInviteQuery)
        if (Array.isArray(invite) && invite.length > 0){
          await query(insertBotQuery)
          const createdBot = await query(selectBotQuery)

          if (Array.isArray(createdBot) && createdBot.length > 0){
            await query(closeInviteQuery)
            resolve({ ...createdBot[0], bot_chat_id: invite[0].bot_chat_id })
          } else {
            reject({ message: `Ошибка создания бота: selectBotQuery` })
          }
        } else {
          reject({
            message: `Публичного имени ${bot_check_name} нет в проверочном списке бота.\nПолучите новое публичное имя бота и перезайдите с ним в группу./n Для получения полной инструкции введите /help`
          }) 
        }
    } catch(e){
      reject(e)
    }
})

export const verifyBot = (payload: VerifyPayload) => new Promise<VerifyResponse>(async (resolve, reject) => {
  const { bot_name } = payload
  const query = promisify(connection.query).bind(connection);

  const selectInviteQuery = `SELECT * FROM invites WHERE tg_user_id = ${payload.tg_user_id} AND bot_check_name = '${payload.bot_check_name}'`
  const selectBotQuery = `SELECT * FROM bots WHERE bot_name = '${bot_name}'`

  try{
    const bot = await query(selectBotQuery)
    const invite = await query(selectInviteQuery)

    if (Array.isArray(invite) && invite.length > 0){
      if (Array.isArray(bot) && bot.length > 0){
        reject({ message: `Бот ${bot_name} уже верифицирован и привязан к аккаунту freekassa.ru` })
      } else {
        const { bot_chat_id, id } = invite[0]
        resolve({ bot_chat_id, invite_id: id })
      }
    } else{
      reject({ message: `У @${bot_name} установленно неправильное проверочное имя` })
    }
  } catch(e){
    reject(e)
  }
})