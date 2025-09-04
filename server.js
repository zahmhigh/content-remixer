import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Mock API endpoint for development
app.post('/api/remix', async (req, res) => {
  const { text, type } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    // For development, return a mock response
    // In production, you would integrate with OpenAI API here
    const mockResponses = {
      improve: `Here's an improved version of your text:\n\n${text}\n\nThis version has been enhanced for clarity, flow, and impact while maintaining your original message.`,
      summarize: `Summary:\n\n${text.split(' ').slice(0, 20).join(' ')}...\n\nThis captures the key points in a more concise format.`,
      expand: `Here's an expanded version of your text:\n\n${text}\n\nI've added more detail, examples, and context to provide a more comprehensive explanation of the topic.`,
      casual: `Here's a more casual version:\n\n"Hey! So basically, ${text.toLowerCase()}"\n\nThis version is more conversational and relaxed.`,
      formal: `Here's a more formal version:\n\n"${text.charAt(0).toUpperCase() + text.slice(1)}"\n\nThis version maintains a professional tone and structure.`
    }

    const remixedText = mockResponses[type] || mockResponses.improve

    res.json({ remixedText })
  } catch (error) {
    console.error('Error processing remix request:', error)
    res.status(500).json({ error: 'Failed to process remix request' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
