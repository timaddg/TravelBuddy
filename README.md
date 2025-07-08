# TravelBuddy

TravelBuddy is an AI-powered assistant that leverages Google's Gemini API to help users with travel-related queries, such as discovering popular destinations, simplifying complex tourist information, and more.

## Features
- Ask about travel destinations
- Simplify complex tourist texts
- Easily manage prompts and training data

## Project Structure
- `main.py`: Main application entry point
- `prompts.py`: Store and manage prompts
- `data/`: Training and evaluation data
  - `raw_tourist_texts/`: Complex input texts (e.g., website snippets, map legends)
  - `raw_tourist_texts/`: Source tourist information files
- `.env`: Store your Gemini API key (not committed to version control)

## Setup
1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Add your Gemini API key to a `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Run the application:
   ```bash
   python main.py
   ```

## Notes
- Do not share your `.env` file or API keys.
- Extend the prompts and data folders as needed for your use case. 