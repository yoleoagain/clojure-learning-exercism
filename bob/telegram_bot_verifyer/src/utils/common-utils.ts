import { checkLng, t } from '../translation'

require('dotenv').config()

export function randBotName (length){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = '',
      charactersLength = characters.length

    for (var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

   return result;
}

export function escapedMsg (v: string){
  return v.replace(/\[/g, '\\[')
    .replace(/\`/g, '\\`')
    .replace(/\./g, '\.');
}

export const getInstructionOptions = (check_bot_name: string, l: string) => {
  const lng = checkLng(l)
  return [
    [{ text: t(lng, 'HOW_TO_RENAME_BOT'), callback_data: `rename_${lng}_${check_bot_name}` }],
    [{ text: t(lng, 'HOW_TO_ADD_BOT'), callback_data: `add_${lng}_${check_bot_name}` }],
  ]
}

export const successMSG = ({ bot_name, code, userUrl } : {
  bot_name: string, code: number, userUrl?: string
}) => `@${bot_name} успешно верифицирован ваш код - ${code}.${userUrl ? `\nВведите код на странице по ссылке ${userUrl}` : ''}`
