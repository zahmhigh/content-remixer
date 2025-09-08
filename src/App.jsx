import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [remixType, setRemixType] = useState('improve')
  const [serverStatus, setServerStatus] = useState('checking')
  const [savedTweets, setSavedTweets] = useState([])
  const [showSavedTweets, setShowSavedTweets] = useState(false)
  const [savingTweet, setSavingTweet] = useState(null)

  const remixTypes = [
    { value: 'improve', label: 'Improve Writing', description: 'Enhance clarity, flow, and impact of existing text while maintaining your voice' },
    { value: 'summarize', label: 'Summarize', description: 'Condense your long content into key points and essential information' },
    { value: 'expand', label: 'Expand', description: 'Develop your ideas or notes into fuller, more detailed content' },
    { value: 'casual', label: 'Make Casual', description: 'Convert formal or stiff text into relaxed, conversational language' },
    { value: 'formal', label: 'Make Formal', description: 'Transform casual content into professional, polished writing' },
    { value: 'tweets', label: 'Convert to Twitter Thread', description: 'Break down your pasted into a series of connected, tweet-sized posts' },
    { value: 'uniqueTweets', label: 'Generate Unique Tweets', description: 'Create original, engaging tweets from your input content or ideas' }
  ]

  // Helper functions for button text and icons
  const getButtonText = (type) => {
    const buttonTexts = {
      improve: 'Improve Writing',
      summarize: 'Summarize Content',
      expand: 'Expand Content',
      casual: 'Make Casual',
      formal: 'Make Formal',
      tweets: 'Create Twitter Thread',
      uniqueTweets: 'Generate Unique Tweets'
    }
    return buttonTexts[type] || 'Remix Content'
  }

  const getButtonIcon = (type) => {
    const buttonIcons = {
      improve: '✨',
      summarize: '📝',
      expand: '📈',
      casual: '😊',
      formal: '👔',
      tweets: '🧵',
      uniqueTweets: '🐦'
    }
    return buttonIcons[type] || '✨'
  }

  const getButtonLoadingText = (type) => {
    const loadingTexts = {
      improve: 'Improving...',
      summarize: 'Summarizing...',
      expand: 'Expanding...',
      casual: 'Making Casual...',
      formal: 'Making Formal...',
      tweets: 'Creating Thread...',
      uniqueTweets: 'Generating Tweets...'
    }
    return loadingTexts[type] || 'Remixing...'
  }

  // Check server health and load saved tweets on component mount
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          setServerStatus('connected')
        } else {
          setServerStatus('error')
        }
      } catch (error) {
        setServerStatus('error')
      }
    }
    
    const loadSavedTweets = async () => {
      try {
        const response = await fetch('/api/saved-tweets')
        if (response.ok) {
          const data = await response.json()
          setSavedTweets(data.tweets)
        }
      } catch (error) {
        console.error('Error loading saved tweets:', error)
      }
    }
    
    checkServerHealth()
    loadSavedTweets()
  }, [])

  const handleRemix = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          type: remixType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      setOutputText(data.remixedText)
    } catch (error) {
      console.error('Error:', error)
      
      // Show specific error messages based on the error
      if (error.message.includes('API key')) {
        setOutputText(`Error: ${error.message}\n\nTo fix this:\n1. Create a .env file in your project root\n2. Add: ANTHROPIC_API_KEY=your_actual_api_key_here\n3. Restart the server`)
      } else if (error.message.includes('Failed to fetch')) {
        setOutputText('Error: Cannot connect to the server. Make sure the server is running on port 3001.')
      } else {
        setOutputText(`Error: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTweet = async (tweet, tweetType = 'unique') => {
    setSavingTweet(tweet)
    try {
      const response = await fetch('/api/save-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: tweet,
          tweetType: tweetType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save tweet')
      }

      // Reload saved tweets to update the list
      const tweetsResponse = await fetch('/api/saved-tweets')
      if (tweetsResponse.ok) {
        const tweetsData = await tweetsResponse.json()
        setSavedTweets(tweetsData.tweets)
      }
    } catch (error) {
      console.error('Error saving tweet:', error)
      alert('Failed to save tweet: ' + error.message)
    } finally {
      setSavingTweet(null)
    }
  }

  const handleDeleteTweet = async (tweetId) => {
    try {
      const response = await fetch(`/api/saved-tweets/${tweetId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete tweet')
      }

      // Update the saved tweets list
      setSavedTweets(savedTweets.filter(tweet => tweet.id !== tweetId))
    } catch (error) {
      console.error('Error deleting tweet:', error)
      alert('Failed to delete tweet: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Content Remixer
          </h1>
          <button
            onClick={() => setShowSavedTweets(!showSavedTweets)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <span>💾</span>
            <span>Saved Tweets ({savedTweets.length})</span>
          </button>
        </div>
        
        {/* Server Status Indicator */}
        <div className="mb-6 text-center">
          {serverStatus === 'checking' && (
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
              Checking server connection...
            </div>
          )}
          {serverStatus === 'connected' && (
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              Server connected
            </div>
          )}
          {serverStatus === 'error' && (
            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
              Server not connected - Make sure to run: npm run start
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remix Type
            </label>
            <select
              value={remixType}
              onChange={(e) => setRemixType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {remixTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Remix Type Description */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>{remixTypes.find(type => type.value === remixType)?.label}:</strong> {remixTypes.find(type => type.value === remixType)?.description}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here to remix..."
              className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleRemix}
            disabled={!inputText.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{getButtonLoadingText(remixType)}</span>
              </>
            ) : (
              <>
                <span>{getButtonIcon(remixType)}</span>
                <span>{getButtonText(remixType)}</span>
              </>
            )}
          </button>
        </div>

        {outputText && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Remixed Output</h2>
            {remixType === 'tweets' ? (
              <div className="space-y-4">
                {outputText.split('\n').filter(line => line.trim()).map((tweet, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">Tweet {index + 1}</span>
                          <span className="text-xs text-gray-500">
                            {tweet.length}/280 characters
                          </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{tweet}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <button 
                            onClick={() => navigator.clipboard.writeText(tweet)}
                            className="hover:text-blue-600 transition-colors"
                          >
                            📋 Copy Tweet
                          </button>
                          <button 
                            onClick={() => {
                              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`
                              window.open(twitterUrl, '_blank')
                            }}
                            className="hover:text-blue-600 transition-colors"
                          >
                            🐦 Tweet Now
                          </button>
                          <button 
                            onClick={() => handleSaveTweet(tweet, 'thread')}
                            disabled={savingTweet === tweet}
                            className="hover:text-green-600 transition-colors disabled:opacity-50"
                          >
                            {savingTweet === tweet ? '💾 Saving...' : '💾 Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Tip:</strong> Click "Tweet Now" to open Twitter with the tweet pre-filled, or "Copy Tweet" to copy individual tweets.
                  </p>
                </div>
              </div>
            ) : remixType === 'uniqueTweets' ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Generated Tweets:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {outputText.split('\n').filter(line => line.trim()).map((tweet, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                      <p className="text-gray-800 text-sm leading-relaxed mb-3">{tweet}</p>
                      <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {280 - tweet.length} characters remaining
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigator.clipboard.writeText(tweet)}
                            className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
                          >
                            Copy
                          </button>
                          <button 
                            onClick={() => handleSaveTweet(tweet, 'unique')}
                            disabled={savingTweet === tweet}
                            className="text-green-600 text-sm hover:text-green-800 transition-colors disabled:opacity-50"
                          >
                            {savingTweet === tweet ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            onClick={() => {
                              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`
                              window.open(twitterUrl, '_blank')
                            }}
                            className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center space-x-1"
                          >
                            <span className="text-white font-bold text-xs">𝕏</span>
                            <span>Post on X</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap text-gray-700">{outputText}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saved Tweets Sidebar */}
      {showSavedTweets && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
          <div className="bg-green-600 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Saved Tweets</h2>
            <button
              onClick={() => setShowSavedTweets(false)}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {savedTweets.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-6xl mb-4">💾</div>
                <p>No saved tweets yet</p>
                <p className="text-sm mt-2">Save tweets from your generated content to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedTweets.map((tweet) => (
                  <div key={tweet.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(tweet.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteTweet(tweet.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="text-gray-800 text-sm mb-3 leading-relaxed">{tweet.content}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{tweet.content.length}/280 characters</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(tweet.content)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet.content)}`
                            window.open(twitterUrl, '_blank')
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Tweet
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay when sidebar is open */}
      {showSavedTweets && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSavedTweets(false)}
        />
      )}
    </div>
  )
}

export default App
