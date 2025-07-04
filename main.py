import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def setup_gemini():
    """Setup Gemini API with the API key from environment variables"""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables")
        print("Please add your Gemini API key to the .env file")
        sys.exit(1)
    
    genai.configure(api_key=api_key)
    return genai

def main():
    """Main function for the TravelBuddy application"""
    print("Welcome to TravelBuddy!")
    print("Setting up Gemini API...")
    
    try:
        # Setup Gemini
        genai_client = setup_gemini()
        print("✅ Gemini API configured successfully!")
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        print("✅ Gemini model loaded successfully!")
        
        # Example usage - you can modify this based on your needs
        print("\nExample: Ask Gemini about travel destinations")
        response = model.generate_content("Tell me about 3 popular travel destinations in Europe")
        print(response.text)
        
    except Exception as e:
        print(f"❌ Error setting up Gemini: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 