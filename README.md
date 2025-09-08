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
   - Convert to Twitter Thread
   - Generate Unique Tweets
3. **One-Click Remix**: Click a button to apply the remixing
4. **Clean Output**: See the remixed result in a styled output box
5. **Save Tweets**: Save individual tweets to a database for later use
6. **Saved Tweets Sidebar**: View, manage, and tweet your saved content
7. **Modern UI**: Built with Tailwind CSS for a clean, responsive design

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Backend**: Express.js
- **Database**: SQLite
- **API**: Claude API (Anthropic)

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
5. For tweets: Use the "Save" button to store individual tweets
6. Click "Saved Tweets" to view and manage your saved content
7. Use "Copy" or "Tweet" buttons to use your saved tweets

## API Integration

The application uses Claude API (Anthropic) for content remixing. To set up:

1. Get your Claude API key from [Anthropic Console](https://console.anthropic.com/)
2. Create a `.env` file in the project root:
   ```bash
   # Create .env file
   touch .env
   ```
3. Add your API key to the `.env` file:
   ```
   ANTHROPIC_API_KEY=your_actual_claude_api_key_here
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. Restart the server after adding the API key

**Note**: The application will show a server status indicator to help diagnose connection issues.

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
- API endpoints:
  - `POST /api/remix` - Remix content
  - `POST /api/save-tweet` - Save a tweet
  - `GET /api/saved-tweets` - Get all saved tweets
  - `DELETE /api/saved-tweets/:id` - Delete a saved tweet
- Database: SQLite file (`tweets.db`) created automatically

## Database

The application uses SQLite for storing saved tweets. The database is automatically created when you first run the server. The database file (`tweets.db`) will be created in the project root directory.

### Database Schema

```sql
CREATE TABLE saved_tweets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  tweet_type TEXT DEFAULT 'unique'
);
```

## Challenges

1. Add in another AI API
2. Add a way to upload audio files to have them transcribed
3. Click to tweet or to schedule a tweet from the output
4. ~~Add a way to save the remixed output to a database~~ ✅ **Completed!**