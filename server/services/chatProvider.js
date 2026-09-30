const MODEL = 'gemini-3.5-flash'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
const SYSTEM_INSTRUCTION = `You are the PetroGel Assistant. Answer general questions helpfully. For questions about PetroGel or the PETROGEL Plant & QC Management Portal, use only the verified context below. Do not invent company facts, policies, products, services, or portal capabilities. If the context does not contain the answer, say that you do not have enough verified information. You cannot access MongoDB, live portal data, employee or customer records, or perform portal actions; never imply otherwise.

Verified context:
- The PETROGEL Plant & QC Management Portal is documented as a web application for managing plant operations and quality-control workflows.
- Documented areas include production management, quality control and testing, inventory, products and formulations, customer requirements, reports, alerts and notifications, user management, audit trail, workflow sign-off, and system settings.`

function providerError(message, statusCode = 502) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export async function generateReply(messages) {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) throw providerError('GEMINI_API_KEY is not configured.', 503)

  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: messages.map(({ role, content }) => ({
          role: role === 'assistant' ? 'model' : 'user',
          parts: [{ text: content }],
        })),
        generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(30000),
    })
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw providerError('Gemini request timed out.', 504)
    }
    throw providerError('Gemini could not be reached.')
  }

  if (!response.ok) throw providerError(`Gemini returned HTTP ${response.status}.`)

  let payload
  try {
    payload = await response.json()
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw providerError('Gemini request timed out.', 504)
    }
    throw providerError('Gemini returned an invalid response.')
  }

  const reply = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim()
  if (!reply) throw providerError('Gemini did not return a response.')
  return reply
}