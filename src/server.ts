import { format } from 'date-fns/format'
import 'dotenv/config'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import cleanString from './libs/cleanString'
import { ensurePaths } from './libs/file'
import printAsYMLItem from './libs/printAsYMLItem'
import { slug } from './libs/slug'
import socket from './libs/socket'
import model from './model'
import type { arraySchemaType } from './parser/array'
import { arrayParser } from './parser/array'
import { baseParser } from './parser/base'
import chatPrompt from './prompts/chatPrompt'
import generateSectionPrompt from './prompts/generateSectionContent'
import summaryPrompt from './prompts/generateSummary'
import tocPrompt from './prompts/generateTOC'
import titleGeneratorPromp from './prompts/titleGenerator'
import type { ROLE_KEYS } from './prompts/userChoice'
import { ROLE_PROMPT } from './prompts/userChoice'
import type { BaseInputs, Blog, Content } from './types'
import { INCOMING_EVENTS, OUTGOING_EVENTS } from './types'

export type { arraySchemaType }
export type TitlesArray = arraySchemaType

const GENERATE_FOLDER = path.join(os.homedir(), 'opt', 'generated')
const EXPORT_MD_FOLDER = path.join(os.homedir(), 'opt', 'obsidian', 'rootstack')
const blog: Blog = {
  title: '',
  summary: '',
  keywords: [],
  tags: [],
  slug: '',
  toc: [],
}

const innerState: { context: string; role: string } = {
  context: '',
  role: '',
}

performance.mark('general-started')
socket.on(INCOMING_EVENTS.connection, async client => {
  client.emit(OUTGOING_EVENTS.accepted)

  const arePathsOk = await ensurePaths([GENERATE_FOLDER, EXPORT_MD_FOLDER])
  if (!arePathsOk) process.exit(2)

  client.on(INCOMING_EVENTS.userBaseInputs, async inputs => {
    client.emit(OUTGOING_EVENTS.startTitle, true)
    blog.title = inputs.title
    innerState.context = inputs.context
    innerState.role = ROLE_PROMPT[inputs.role as ROLE_KEYS]
    const titleSuggestions = await onUserBaseInputs(inputs)
    client.emit(OUTGOING_EVENTS.confirmTitle, titleSuggestions)
  })

  client.on(INCOMING_EVENTS.confirmedTitle, async title => {
    client.emit(OUTGOING_EVENTS.startSummary)
    blog.title = title
    await onUserTitle(blog)
    client.emit(OUTGOING_EVENTS.confirmSummary, blog)
  })

  client.on(INCOMING_EVENTS.confirmedSummary, async blog => {
    client.emit(OUTGOING_EVENTS.startTOC, true)
    await onSummaryConfirmed(blog)
    client.emit(OUTGOING_EVENTS.confirmTOC, blog)
  })

  client.on(INCOMING_EVENTS.confirmedTOC, async blog => {
    client.emit(OUTGOING_EVENTS.startGenerating, true)
    const promises = await onTOCConfirmed(blog)

    const fileName = `${blog.slug}.md`
    const mdFilePath = path.join(GENERATE_FOLDER, fileName)

    const documentParams = {
      author: printAsYMLItem('default'),
      title: cleanString(blog.title),
      summary: cleanString(blog.summary),
      created: format(new Date(), 'yyyy-MM-dd'),
      tags: blog.tags?.map(printAsYMLItem),
      keywords: blog.keywords?.map(printAsYMLItem),
    }

    type StatusKey = keyof typeof documentParams

    const documentParamsText = Object.keys(documentParams)
      .map(key => {
        return `${key}: ${documentParams[key as StatusKey]}`
      })
      .join('\n')

    fs.writeFileSync(mdFilePath, `---\n${documentParamsText}\n---\n\n`, 'utf-8')
    fs.appendFileSync(mdFilePath, `# ${blog.title} \n\n`, 'utf-8')
    fs.appendFileSync(mdFilePath, `## tl;dr\n\t${blog.summary} \n\n`, 'utf-8')

    Promise.all(promises).then(async results => {
      performance.mark('content-finished')

      for (const result of results) {
        const content = `${result.content}\n\n`
        fs.appendFileSync(mdFilePath, content, 'utf-8')
      }

      performance.mark('general-finished')

      const target = path.join(EXPORT_MD_FOLDER, fileName)
      fs.copyFileSync(mdFilePath, target)
      const fullFile = fs.readFileSync(mdFilePath)

      client.emit(OUTGOING_EVENTS.contentGenerated, {
        blog: fullFile.toString(),
        filePath: mdFilePath,
      })
    })
  })
  client.on(INCOMING_EVENTS.chatIn, async (userInput: string) => {
    const chatChain = chatPrompt.pipe(model)
    const response = await chatChain.invoke({ question: userInput })

    client.emit(OUTGOING_EVENTS.chatOut, response.content.toString())
  })
})

async function onUserBaseInputs({
  title: userSuggestedTitle,
  context,
  role: roleKey,
}: BaseInputs): Promise<TitlesArray> {
  const role = ROLE_PROMPT[roleKey as ROLE_KEYS]
  performance.mark('title-started')
  const titleSuggestions = await generateBlogTitle(context, role, userSuggestedTitle)
  performance.mark('title-finished')

  return titleSuggestions
}

async function onUserTitle(blog: Blog) {
  const slugTitle = slug(blog.title)
  const partialedSummaryPrompt = await summaryPrompt.partial({
    format_instructions: baseParser.getFormatInstructions(),
    context: innerState.context,
    role: innerState.role,
  })

  const summaryChain = partialedSummaryPrompt.pipe(model).pipe(baseParser)
  performance.mark('summary-started')
  const summaryResult = await summaryChain.invoke({ title: blog.title })
  performance.mark('summary-finished')

  blog.summary = summaryResult.summary ?? ''
  blog.keywords = summaryResult.keywords ?? []
  blog.tags = summaryResult.tags ?? []
  blog.slug = slugTitle

  return blog
}

async function onSummaryConfirmed(blog: Blog) {
  const partialedTocPrompt = await tocPrompt.partial({
    format_instructions: arrayParser.getFormatInstructions(),
    context: innerState.context,
    role: innerState.role,
  })

  const tocChain = partialedTocPrompt.pipe(model).pipe(arrayParser)
  performance.mark('toc-started')
  const tocResult = await tocChain.invoke({
    title: blog.title,
    summary: blog.summary,
  })

  performance.mark('toc-finished')
  blog.toc = tocResult

  return blog
}

async function onTOCConfirmed(blog: Blog) {
  const partialedContentPrompt = await generateSectionPrompt.partial({
    context: innerState.context,
    role: innerState.role,
  })

  const contentChain = partialedContentPrompt.pipe(model)
  // performance.mark("content-started");
  const promises = blog.toc.map((section: Content) => {
    const promise = contentChain.invoke({
      title: section.title,
      summary: section.summary,
      keywords: section.keywords,
    })

    promise.then((content): void => {
      section.content = content.content.toString()
    })

    return promise
  })

  return promises
}

async function generateBlogTitle(context: string, role: string, title: string): Promise<arraySchemaType> {
  // get post title
  const partialedTitlePrompt = await titleGeneratorPromp.partial({
    format_instructions: arrayParser.getFormatInstructions(),
    context,
    role,
  })

  // start extracting titles
  const titleChain = partialedTitlePrompt.pipe(model).pipe(arrayParser)

  const titleSuggestions = await titleChain.invoke({ title })

  return titleSuggestions
}

socket.listen(4200)
