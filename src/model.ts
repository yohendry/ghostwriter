import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { ConversationChain } from 'langchain/chains'
import { BufferMemory } from 'langchain/memory'

const url = process.env.OLLAMA_URL
const modelName = process.env.OLLAMA_MODEL

if (!url) throw new Error('NO OLLAMA_URL env')
if (!modelName) throw new Error('NO OLLAMA_MODEL env')

const llmMemory = new BufferMemory({ memoryKey: 'chat_history' })

const model = new ChatOllama({
  baseUrl: url, // Default value
  model: modelName, // Default value
})

const llmChat = new ConversationChain({ llm: model, memory: llmMemory })

export { llmChat }

export default model
