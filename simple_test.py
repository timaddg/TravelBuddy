#!/usr/bin/env python3
"""
Simple test script for TravelBuddy simplification feature
This script demonstrates the basic functionality with a simple example
"""

import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai
from prompts import get_public_transport_simplification_prompt

# Load environment variables
load_dotenv()

def setup_gemini():
    """Setup Gemini API with the API key from environment variables"""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found in environment variables")
        print("Please add your Gemini API key to the .env file")
        print("Example: GEMINI_API_KEY=your_api_key_here")
        sys.exit(1)
    
    genai.configure(api_key=api_key)
    return genai

def main():
    """Main function - demonstrates simplification with a simple example"""
    print("🚀 TRAVELBUDDY SIMPLIFICATION DEMO")
    print("=" * 50)
    
    # Setup Gemini
    print("🔧 Setting up Gemini API...")
    genai_client = setup_gemini()
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    print("✅ Gemini API configured successfully!")
    
    # Example complex text (Tokyo Metro instructions)
    complex_text = """
    TOKYO METRO (Japan):
    To transfer from the Marunouchi Line to the Yamanote Line at Shinjuku Station, proceed to the JR East transfer gates located on the B1 level. Valid IC cards (PASMO/Suica) can be used for seamless transfers between Tokyo Metro and JR lines. Note that separate fares apply for each operator. For JR lines, tap your card at the JR-specific gates. The Yamanote Line platforms are located on levels 1 and 2. During peak hours (7:30-9:30 AM and 5:30-7:30 PM), trains arrive every 2-3 minutes. Women-only cars operate on the first and last cars during morning rush hours (7:30-9:30 AM) on weekdays.
    """
    
    print(f"\n📝 ORIGINAL COMPLEX TEXT:")
    print(f"{'-'*40}")
    print(complex_text)
    print(f"📊 Length: {len(complex_text)} characters")
    
    # Get the simplification prompt
    prompt = get_public_transport_simplification_prompt(complex_text)
    
    print(f"\n🔄 Generating simplified version...")
    print(f"📋 Prompt length: {len(prompt)} characters")
    
    try:
        # Generate simplified version
        response = model.generate_content(prompt)
        simplified_text = response.text
        
        print(f"\n✅ SIMPLIFIED RESULT:")
        print(f"{'-'*40}")
        print(simplified_text)
        print(f"📊 Length: {len(simplified_text)} characters")
        print(f"📈 Reduction: {((len(complex_text) - len(simplified_text)) / len(complex_text) * 100):.1f}%")
        
        print(f"\n🎉 SUCCESS! The complex text has been simplified successfully.")
        print(f"💡 You can now use this feature to simplify any tourist information!")
        
    except Exception as e:
        print(f"❌ Error during simplification: {e}")
        print(f"💡 Make sure your Gemini API key is valid and you have internet connection.")

if __name__ == "__main__":
    main() 