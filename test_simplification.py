#!/usr/bin/env python3
"""
Test script for TravelBuddy simplification feature
This script demonstrates how to use the prompts to simplify complex tourist information
"""

import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai
from prompts import (
    get_simplification_prompt,
    get_public_transport_simplification_prompt,
    get_museum_exhibit_simplification_prompt,
    get_restaurant_menu_simplification_prompt,
    get_cultural_customs_simplification_prompt,
    get_emergency_safety_simplification_prompt,
    get_currency_exchange_simplification_prompt,
    get_quality_improvement_prompt,
    get_validation_prompt
)

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

def read_file_content(file_path):
    """Read content from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return None
    except Exception as e:
        print(f"❌ Error reading file {file_path}: {e}")
        return None

def test_simplification(model, complex_text, prompt_function, test_name):
    """Test simplification with a specific prompt function"""
    print(f"\n{'='*60}")
    print(f"🧪 TESTING: {test_name}")
    print(f"{'='*60}")
    
    # Get the prompt
    prompt = prompt_function(complex_text)
    
    print(f"📝 Original text length: {len(complex_text)} characters")
    print(f"📋 Prompt length: {len(prompt)} characters")
    
    try:
        # Generate simplified version
        print("\n🔄 Generating simplified version...")
        response = model.generate_content(prompt)
        simplified_text = response.text
        
        print(f"✅ Simplified text length: {len(simplified_text)} characters")
        print(f"📊 Reduction: {((len(complex_text) - len(simplified_text)) / len(complex_text) * 100):.1f}%")
        
        # Display the simplified result
        print(f"\n📖 SIMPLIFIED RESULT:")
        print(f"{'-'*40}")
        print(simplified_text)
        
        return simplified_text
        
    except Exception as e:
        print(f"❌ Error during simplification: {e}")
        return None

def test_quality_improvement(model, original_text, simplified_text, test_name):
    """Test quality improvement of simplified text"""
    print(f"\n{'='*60}")
    print(f"🔍 QUALITY CHECK: {test_name}")
    print(f"{'='*60}")
    
    try:
        # Get quality improvement prompt
        prompt = get_quality_improvement_prompt(simplified_text, original_text)
        
        print("🔄 Checking quality and improving...")
        response = model.generate_content(prompt)
        improved_text = response.text
        
        print(f"✅ Quality check complete!")
        print(f"\n📖 IMPROVED RESULT:")
        print(f"{'-'*40}")
        print(improved_text)
        
        return improved_text
        
    except Exception as e:
        print(f"❌ Error during quality check: {e}")
        return None

def test_validation(model, original_text, simplified_text, test_name):
    """Test validation of simplified text"""
    print(f"\n{'='*60}")
    print(f"✅ VALIDATION: {test_name}")
    print(f"{'='*60}")
    
    try:
        # Get validation prompt
        prompt = get_validation_prompt(original_text, simplified_text)
        
        print("🔄 Validating simplified text...")
        response = model.generate_content(prompt)
        validation_result = response.text
        
        print(f"✅ Validation complete!")
        print(f"\n📋 VALIDATION RESULT:")
        print(f"{'-'*40}")
        print(validation_result)
        
        return validation_result
        
    except Exception as e:
        print(f"❌ Error during validation: {e}")
        return None

def run_comprehensive_test():
    """Run comprehensive tests with all data files"""
    print("🚀 TRAVELBUDDY SIMPLIFICATION TEST SUITE")
    print("=" * 60)
    
    # Setup Gemini
    print("🔧 Setting up Gemini API...")
    genai_client = setup_gemini()
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    print("✅ Gemini API configured successfully!")
    
    # Test data files
    test_cases = [
        {
            'raw_file': 'data/raw_tourist_texts/public_transport_instructions.txt',
            'simplified_file': 'data/simplified_outputs/public_transport_instructions_simplified.md',
            'prompt_function': get_public_transport_simplification_prompt,
            'name': 'Public Transport Instructions'
        },
        {
            'raw_file': 'data/raw_tourist_texts/museum_exhibit_descriptions.txt',
            'simplified_file': 'data/simplified_outputs/museum_exhibit_descriptions_simplified.md',
            'prompt_function': get_museum_exhibit_simplification_prompt,
            'name': 'Museum Exhibit Descriptions'
        },
        {
            'raw_file': 'data/raw_tourist_texts/restaurant_menus.txt',
            'simplified_file': 'data/simplified_outputs/restaurant_menus_simplified.md',
            'prompt_function': get_restaurant_menu_simplification_prompt,
            'name': 'Restaurant Menus'
        },
        {
            'raw_file': 'data/raw_tourist_texts/local_laws_customs.txt',
            'simplified_file': 'data/simplified_outputs/local_laws_customs_simplified.md',
            'prompt_function': get_cultural_customs_simplification_prompt,
            'name': 'Local Laws and Customs'
        },
        {
            'raw_file': 'data/raw_tourist_texts/emergency_contact_safety.txt',
            'simplified_file': 'data/simplified_outputs/emergency_contact_safety_simplified.md',
            'prompt_function': get_emergency_safety_simplification_prompt,
            'name': 'Emergency Contact and Safety'
        },
        {
            'raw_file': 'data/raw_tourist_texts/currency_exchange.txt',
            'simplified_file': 'data/simplified_outputs/currency_exchange_simplified.md',
            'prompt_function': get_currency_exchange_simplification_prompt,
            'name': 'Currency Exchange'
        }
    ]
    
    results = []
    
    for test_case in test_cases:
        print(f"\n{'='*60}")
        print(f"🎯 TESTING: {test_case['name']}")
        print(f"{'='*60}")
        
        # Read raw text
        raw_text = read_file_content(test_case['raw_file'])
        if not raw_text:
            continue
            
        # Read gold standard simplified text
        gold_standard = read_file_content(test_case['simplified_file'])
        if not gold_standard:
            continue
        
        print(f"📁 Raw file: {test_case['raw_file']}")
        print(f"📁 Gold standard: {test_case['simplified_file']}")
        
        # Test simplification
        simplified_text = test_simplification(
            model, 
            raw_text, 
            test_case['prompt_function'], 
            test_case['name']
        )
        
        if simplified_text:
            # Test quality improvement
            improved_text = test_quality_improvement(
                model,
                raw_text,
                simplified_text,
                test_case['name']
            )
            
            # Test validation
            validation_result = test_validation(
                model,
                raw_text,
                simplified_text,
                test_case['name']
            )
            
            results.append({
                'name': test_case['name'],
                'raw_length': len(raw_text),
                'simplified_length': len(simplified_text),
                'gold_standard_length': len(gold_standard),
                'reduction_percent': ((len(raw_text) - len(simplified_text)) / len(raw_text) * 100),
                'success': True
            })
        else:
            results.append({
                'name': test_case['name'],
                'success': False
            })
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"📊 TEST SUMMARY")
    print(f"{'='*60}")
    
    successful_tests = [r for r in results if r['success']]
    failed_tests = [r for r in results if not r['success']]
    
    print(f"✅ Successful tests: {len(successful_tests)}/{len(results)}")
    print(f"❌ Failed tests: {len(failed_tests)}/{len(results)}")
    
    if successful_tests:
        print(f"\n📈 AVERAGE REDUCTION: {sum(r['reduction_percent'] for r in successful_tests) / len(successful_tests):.1f}%")
        
        print(f"\n📋 DETAILED RESULTS:")
        for result in successful_tests:
            print(f"  • {result['name']}: {result['reduction_percent']:.1f}% reduction")
    
    if failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for result in failed_tests:
            print(f"  • {result['name']}")

def run_single_test():
    """Run a single test with user input"""
    print("🧪 SINGLE TEST MODE")
    print("=" * 40)
    
    # Setup Gemini
    print("🔧 Setting up Gemini API...")
    genai_client = setup_gemini()
    model = genai.GenerativeModel('gemini-pro')
    print("✅ Gemini API configured successfully!")
    
    # Get user input
    print("\n📝 Enter your complex tourist information to simplify:")
    print("(Press Enter twice to finish)")
    
    lines = []
    while True:
        line = input()
        if line == "" and lines and lines[-1] == "":
            break
        lines.append(line)
    
    complex_text = "\n".join(lines[:-1])  # Remove the last empty line
    
    if not complex_text.strip():
        print("❌ No text provided. Exiting.")
        return
    
    print(f"\n📊 Text length: {len(complex_text)} characters")
    
    # Choose prompt type
    print("\n🎯 Choose simplification type:")
    print("1. General simplification")
    print("2. Public transport")
    print("3. Museum exhibits")
    print("4. Restaurant menus")
    print("5. Cultural customs")
    print("6. Emergency safety")
    print("7. Currency exchange")
    
    choice = input("Enter choice (1-7): ").strip()
    
    prompt_functions = {
        '1': get_simplification_prompt,
        '2': get_public_transport_simplification_prompt,
        '3': get_museum_exhibit_simplification_prompt,
        '4': get_restaurant_menu_simplification_prompt,
        '5': get_cultural_customs_simplification_prompt,
        '6': get_emergency_safety_simplification_prompt,
        '7': get_currency_exchange_simplification_prompt
    }
    
    if choice not in prompt_functions:
        print("❌ Invalid choice. Using general simplification.")
        choice = '1'
    
    prompt_function = prompt_functions[choice]
    test_name = f"Custom {choice}"
    
    # Test simplification
    simplified_text = test_simplification(model, complex_text, prompt_function, test_name)
    
    if simplified_text:
        # Ask if user wants quality improvement
        improve = input("\n🔍 Would you like to run quality improvement? (y/n): ").lower().strip()
        if improve == 'y':
            test_quality_improvement(model, complex_text, simplified_text, test_name)

def main():
    """Main function"""
    print("🚀 TRAVELBUDDY SIMPLIFICATION TESTER")
    print("=" * 50)
    
    print("\nChoose test mode:")
    print("1. Comprehensive test (all data files)")
    print("2. Single test (custom input)")
    
    choice = input("Enter choice (1-2): ").strip()
    
    if choice == '1':
        run_comprehensive_test()
    elif choice == '2':
        run_single_test()
    else:
        print("❌ Invalid choice. Running comprehensive test.")
        run_comprehensive_test()

if __name__ == "__main__":
    main() 