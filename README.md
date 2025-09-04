# Content Remixer

A simple and elegant content remixing tool built with React that allows you to transform text in various ways.

## Features

1. **Text Input**: Paste in text you want to remix
2. **Remix Types**: Choose from different remixing options:
   - Improve Writing
   - Summarize
   - Expand
   - Make Casual
   - Make Formal
3. **One-Click Remix**: Click a button to apply the remixing
4. **Clean Output**: See the remixed result in a styled output box
5. **Modern UI**: Built with Tailwind CSS for a clean, responsive design

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Backend**: Express.js
- **API**: Mock API (ready for OpenAI integration)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   npm run server
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Alternative: Run Both Servers

You can also run both the backend and frontend servers simultaneously:
```bash
npm start
```

## Usage

1. Select a remix type from the dropdown
2. Paste your text in the input area
3. Click "Remix Content" to transform your text
4. View the remixed result in the output section

## API Integration

The application currently uses a mock API for demonstration. To integrate with OpenAI:

1. Add your OpenAI API key to a `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. Update the `server.js` file to use the actual OpenAI API instead of the mock responses.

## Project Structure

```
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Custom styles
│   ├── index.css        # Tailwind CSS imports
│   └── main.jsx         # React entry point
├── server.js            # Express backend server
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Development

- Frontend runs on `http://localhost:5173`
- Backend API runs on `http://localhost:3001`
- API endpoint: `POST /api/remix`

## Challenges

1. Add in another AI API
2. Add a way to upload audio files to have them transcribed
3. Click to tweet or to schedule a tweet from the output
4. Add a way to save the remixed output to a database.