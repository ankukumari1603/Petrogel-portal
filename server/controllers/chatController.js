import { generateReply } from '../services/chatProvider.js'

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 4000

export async function chat(req, res) {
  const messages = req.body?.messages
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return res.status(400).json({ message: `Send between 1 and ${MAX_MESSAGES} messages.` })
  }

  const validMessages = messages.every((message) =>
    message &&
    ['user', 'assistant'].includes(message.role) &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH,
  )

  if (!validMessages || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ message: 'Messages must contain valid user and assistant text and end with a user message.' })
  }

  try {
    const reply = await generateReply(messages)
    return res.json({ reply })
  } catch (error) {
    console.error(`Gemini chat request failed: ${error.message}`)
    const status = [503, 504].includes(error.statusCode) ? error.statusCode : 502
    const messages = {
      502: 'The assistant is temporarily unavailable. Please try again.',
      503: 'The assistant is not configured. Add GEMINI_API_KEY to the backend environment.',
      504: 'The assistant took too long to respond. Please retry.',
    }
    const message = messages[status]
    return res.status(status).json({ message })
  }
}