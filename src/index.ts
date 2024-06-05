import prompts from 'prompts'
import { io, type Socket } from 'socket.io-client'
import type { arraySchemaType } from './parser/array'
import {
  PROMPT_USER_CHAT_CONTINUE,
  PROMPT_USER_CHAT_INPUT,
  PROMPT_USER_CHOICES,
  getTitleChoisePrompt,
} from './tui/prompt'
import type { BaseInputs, Blog } from './types'
import { INCOMING_EVENTS, OUTGOING_EVENTS } from './types'

import type { ClientToServerEvents, ServerToClientEvents } from './libs/socket'
import { startAnimation, stopAnimation } from './libs/textWaitAnimation'

// please note that the types are reversed
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('ws://localhost:4200')

socket.on('connect', () => {
  console.log(socket.id) // x8WIv7-mJelg7on_ALbx
})

let waitBar: NodeJS.Timeout | null = null
async function askUser(list: prompts.PromptObject<string>[]) {
  return await prompts(list)
}

socket.on(OUTGOING_EVENTS.accepted, async () => {
  const userResponse = await askUser(PROMPT_USER_CHOICES)
  const { context, title, role } = userResponse

  const base: BaseInputs = {
    title,
    context,
    role,
  }
  socket.emit(INCOMING_EVENTS.userBaseInputs, base)

  waitBar = startAnimation('titles')
})

socket.on(OUTGOING_EVENTS.confirmTitle, async (titles: arraySchemaType) => {
  stopAnimation(waitBar)

  console.log('\n')
  const titleResponse = await askUser(getTitleChoisePrompt(titles))
  const selectedTitle = titles[titleResponse.titleIndex]

  const title = selectedTitle.title ? selectedTitle.title : 'post title'

  socket.emit(INCOMING_EVENTS.confirmedTitle, title)
  waitBar = startAnimation('summary')
})

socket.on(OUTGOING_EVENTS.confirmSummary, async (blog: Blog) => {
  stopAnimation(waitBar)
  socket.emit(INCOMING_EVENTS.confirmedSummary, blog)
  waitBar = startAnimation('table  of content')
})

socket.on(OUTGOING_EVENTS.confirmTOC, async (blog: Blog) => {
  stopAnimation(waitBar)
  socket.emit(INCOMING_EVENTS.confirmedTOC, blog)
  waitBar = startAnimation('content')
})

socket.on(OUTGOING_EVENTS.contentGenerated, async ({ blog, filePath }) => {
  stopAnimation(waitBar)

  console.log({ blog })
  console.log(`file: ${filePath}`)
  console.log('Goodbye!!')

  socket.disconnect()
  process.exit(0)

  // console.log("start chatting....\n\n");
  // socket.emit(
  //   "chatIn",
  //   "Hellow, i want to chat with yout about this blog post.",
  // );
  // waitBar = startAnimation("chat");
})

socket.on('chatOut', async response => {
  stopAnimation(waitBar)
  console.log('\nAsistant :')
  console.log(response, '\n')

  const chat_continue = await askUser(PROMPT_USER_CHAT_CONTINUE)

  if (chat_continue.continue !== 'yes') {
    console.log('Goodbye!!')
    socket.disconnect()
    process.exit(0)
  }

  const chat_ask_again = await askUser(PROMPT_USER_CHAT_INPUT)

  socket.emit('chatIn', chat_ask_again.question ?? '')
  waitBar = startAnimation('chat')
})
