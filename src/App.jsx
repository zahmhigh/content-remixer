import { useState } from 'react'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [remixType, setRemixType] = useState('improve')

  const remixTypes = [
    { value: 'improve', label: 'Improve Writing' },
    { value: 'summarize', label: 'Summarize' },
    { value: 'expand', label: 'Expand' },
    { value: 'casual', label: 'Make Casual' },
    { value: 'formal', label: 'Make Formal' }
  ]

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

      if (!response.ok) {
        throw new Error('Failed to remix content')
      }

      const data = await response.json()
      setOutputText(data.remixedText)
    } catch (error) {
      console.error('Error:', error)
      setOutputText('Error: Unable to remix content. Please check your API configuration.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Content Remixer
        </h1>
        
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
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Remixing...' : 'Remix Content'}
          </button>
        </div>

        {outputText && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Remixed Output</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="whitespace-pre-wrap text-gray-700">{outputText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
