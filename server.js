import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Anthropic from '@anthropic-ai/sdk'
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
dotenv.config()

// Configuration
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

// Database setup
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, 'tweets.db')

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message)
  } else {
    console.log('Connected to SQLite database')
  }
})

// Create tweets table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS saved_tweets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    tweet_type TEXT DEFAULT 'unique'
  )`)
})

// Initialize Express app
const app = express()

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Middleware
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV 
  })
})

// Remix type configurations
const REMIX_TYPES = {
  improve: {
    prompt: (text) => `Please improve the following text for clarity, flow, and impact while maintaining the original message and tone:\n\n${text}`,
    description: 'Enhance clarity, flow, and impact of existing text while maintaining your voice'
  },
  summarize: {
    prompt: (text) => `Please provide a concise summary of the following text, capturing the key points:\n\n${text}`,
    description: 'Condense your long content into key points and essential information'
  },
  expand: {
    prompt: (text) => `Please expand the following text with more detail, examples, and context to provide a more comprehensive explanation:\n\n${text}`,
    description: 'Develop your ideas or notes into fuller, more detailed content'
  },
  casual: {
    prompt: (text) => `Please rewrite the following text in a more casual, conversational tone:\n\n${text}`,
    description: 'Convert formal or stiff text into relaxed, conversational language'
  },
  formal: {
    prompt: (text) => `Please rewrite the following text in a more formal, professional tone:\n\n${text}`,
    description: 'Transform casual content into professional, polished writing'
  },
  tweets: {
    prompt: (text) => `Please convert the following content into a series of engaging tweets. Each tweet should be under 280 characters and include relevant hashtags. Number each tweet and make them flow naturally as a thread. If the content is too long, focus on the most important points:\n\n${text}`,
    description: 'Break down your pasted into a series of connected, tweet-sized posts'
  },
  uniqueTweets: {
    prompt: (text) => `Please generate 5-8 stand-alone, unique tweets from the following content. Each tweet should be under 280 characters and maintain the original tone, style, and voice of the content. Each tweet should be independent and not require context from other tweets. Do not use hashtags in the tweets. Make each tweet engaging and shareable on its own:\n\n${text}`,
    description: 'Create original, engaging tweets from your input content or ideas'
  }
}

// Validation helpers
const validateRequest = (req, res) => {
  const { text, type } = req.body

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Text is required and must be a non-empty string' 
    })
  }

  if (text.length > 10000) {
    return res.status(400).json({ 
      error: 'Text is too long. Maximum 10,000 characters allowed.' 
    })
  }

  if (type && !REMIX_TYPES[type]) {
    return res.status(400).json({ 
      error: `Invalid remix type. Available types: ${Object.keys(REMIX_TYPES).join(', ')}` 
    })
  }

  return { text: text.trim(), type: type || 'improve' }
}

const validateApiKey = (res) => {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_claude_api_key_here') {
    return res.status(500).json({ 
      error: 'Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file.' 
    })
  }
  return true
}

// Main remix endpoint
app.post('/api/remix', async (req, res) => {
  try {
    // Validate request
    const validation = validateRequest(req, res)
    if (validation.error) return

    const { text, type } = validation

    // Validate API key
    if (!validateApiKey(res)) return

    // Get remix configuration
    const remixConfig = REMIX_TYPES[type]
    const prompt = remixConfig.prompt(text)

    console.log(`Processing ${type} remix for text of length: ${text.length}`)

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const remixedText = response.content[0].text

    console.log(`Successfully processed ${type} remix`)

    res.json({ 
      remixedText,
      originalLength: text.length,
      remixedLength: remixedText.length,
      type: type,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error processing remix request:', error)
    
    // Handle specific error types
    if (error.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your ANTHROPIC_API_KEY.' 
      })
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      })
    }

    res.status(500).json({ 
      error: 'Failed to process remix request. Please try again later.',
      ...(NODE_ENV === 'development' && { details: error.message })
    })
  }
})

// Get available remix types
app.get('/api/remix-types', (req, res) => {
  const types = Object.entries(REMIX_TYPES).map(([key, config]) => ({
    type: key,
    description: config.description
  }))
  
  res.json({ types })
})

// Save a tweet to the database
app.post('/api/save-tweet', (req, res) => {
  const { content, tweetType = 'unique' } = req.body

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Tweet content is required and must be a non-empty string' 
    })
  }

  if (content.length > 280) {
    return res.status(400).json({ 
      error: 'Tweet content is too long. Maximum 280 characters allowed.' 
    })
  }

  const stmt = db.prepare('INSERT INTO saved_tweets (content, tweet_type) VALUES (?, ?)')
  
  stmt.run([content.trim(), tweetType], function(err) {
    if (err) {
      console.error('Error saving tweet:', err)
      return res.status(500).json({ error: 'Failed to save tweet' })
    }
    
    res.json({ 
      success: true, 
      id: this.lastID,
      message: 'Tweet saved successfully' 
    })
  })
  
  stmt.finalize()
})

// Get all saved tweets
app.get('/api/saved-tweets', (req, res) => {
  db.all('SELECT * FROM saved_tweets ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error retrieving tweets:', err)
      return res.status(500).json({ error: 'Failed to retrieve tweets' })
    }
    
    res.json({ tweets: rows })
  })
})

// Delete a saved tweet
app.delete('/api/saved-tweets/:id', (req, res) => {
  const { id } = req.params
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Valid tweet ID is required' })
  }

  db.run('DELETE FROM saved_tweets WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting tweet:', err)
      return res.status(500).json({ error: 'Failed to delete tweet' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tweet not found' })
    }
    
    res.json({ 
      success: true, 
      message: 'Tweet deleted successfully' 
    })
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'POST /api/remix',
      'GET /api/remix-types',
      'POST /api/save-tweet',
      'GET /api/saved-tweets',
      'DELETE /api/saved-tweets/:id'
    ]
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ 
    error: 'Internal server error',
    ...(NODE_ENV === 'development' && { details: error.message })
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Remixer server running on port ${PORT}`)
  console.log(`📝 Environment: ${NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
})
