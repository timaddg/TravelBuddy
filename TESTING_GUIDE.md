# 🧪 TravelBuddy Simplification Testing Guide

This guide will help you test the TravelBuddy simplification feature using the prompts and data we've collected.

## 📋 Prerequisites

### 1. Install Dependencies
Make sure you have all required packages installed:
```bash
pip install -r requirements.txt
```

### 2. Set Up Gemini API Key
Create a `.env` file in your project root with your Gemini API key:
```bash
# .env file
GEMINI_API_KEY=your_actual_api_key_here
```

To get a Gemini API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

## 🚀 Testing Options

### Option 1: Quick Demo (Recommended for first-time users)
Run the simple demo to see the feature in action:
```bash
python simple_test.py
```

This will:
- ✅ Test the basic functionality
- ✅ Show a before/after comparison
- ✅ Demonstrate the simplification process
- ✅ Provide immediate feedback

### Option 2: Comprehensive Test Suite
Run the full test suite with all collected data:
```bash
python test_simplification.py
```

Choose option 1 for comprehensive testing, which will:
- ✅ Test all 6 content types (transport, museums, restaurants, etc.)
- ✅ Compare against gold standard outputs
- ✅ Run quality improvement checks
- ✅ Validate accuracy
- ✅ Provide detailed statistics

### Option 3: Custom Input Testing
Run the test script and choose option 2 for custom input:
```bash
python test_simplification.py
# Then choose option 2
```

This allows you to:
- ✅ Test with your own complex text
- ✅ Choose the appropriate simplification type
- ✅ See real-time results
- ✅ Run quality improvement if needed

## 📊 What You'll See

### Simple Demo Output
```
🚀 TRAVELBUDDY SIMPLIFICATION DEMO
==================================================
🔧 Setting up Gemini API...
✅ Gemini API configured successfully!

📝 ORIGINAL COMPLEX TEXT:
----------------------------------------
TOKYO METRO (Japan):
To transfer from the Marunouchi Line to the Yamanote Line at Shinjuku Station...
📊 Length: 456 characters

🔄 Generating simplified version...
📋 Prompt length: 1234 characters

✅ SIMPLIFIED RESULT:
----------------------------------------
## Tokyo Metro (Japan)

**Getting Around:**
- Use a PASMO or Suica card (like a metro card)
- Tap in and out at the gates
- Trains come every 2-3 minutes during busy times
...
📊 Length: 234 characters
📈 Reduction: 48.7%

🎉 SUCCESS! The complex text has been simplified successfully.
💡 You can now use this feature to simplify any tourist information!
```

### Comprehensive Test Output
```
🚀 TRAVELBUDDY SIMPLIFICATION TEST SUITE
============================================================
🔧 Setting up Gemini API...
✅ Gemini API configured successfully!

============================================================
🎯 TESTING: Public Transport Instructions
============================================================
📁 Raw file: data/raw_tourist_texts/public_transport_instructions.txt
📁 Gold standard: data/simplified_outputs/public_transport_instructions_simplified.md

============================================================
🧪 TESTING: Public Transport Instructions
============================================================
📝 Original text length: 2345 characters
📋 Prompt length: 3456 characters

🔄 Generating simplified version...
✅ Simplified text length: 1234 characters
📊 Reduction: 47.4%

📖 SIMPLIFIED RESULT:
----------------------------------------
[Simplified output here]

============================================================
🔍 QUALITY CHECK: Public Transport Instructions
============================================================
🔄 Checking quality and improving...
✅ Quality check complete!

📖 IMPROVED RESULT:
----------------------------------------
[Improved output here]

============================================================
✅ VALIDATION: Public Transport Instructions
============================================================
🔄 Validating simplified text...
✅ Validation complete!

📋 VALIDATION RESULT:
----------------------------------------
[Validation results here]

============================================================
📊 TEST SUMMARY
============================================================
✅ Successful tests: 6/6
❌ Failed tests: 0/6

📈 AVERAGE REDUCTION: 45.2%

📋 DETAILED RESULTS:
  • Public Transport Instructions: 47.4% reduction
  • Museum Exhibit Descriptions: 43.1% reduction
  • Restaurant Menus: 48.7% reduction
  • Local Laws and Customs: 44.2% reduction
  • Emergency Contact and Safety: 46.8% reduction
  • Currency Exchange: 42.9% reduction
```

## 🎯 Testing Different Content Types

The system can handle 6 different types of tourist information:

### 1. Public Transport Instructions
- **Prompt:** `get_public_transport_simplification_prompt()`
- **Best for:** Metro maps, bus schedules, train transfers
- **Example:** Tokyo Metro, London Underground, New York Subway

### 2. Museum Exhibit Descriptions
- **Prompt:** `get_museum_exhibit_simplification_prompt()`
- **Best for:** Art history, cultural artifacts, historical information
- **Example:** Mona Lisa, Rosetta Stone, Sistine Chapel

### 3. Restaurant Menus
- **Prompt:** `get_restaurant_menu_simplification_prompt()`
- **Best for:** Fine dining, complex dishes, tasting menus
- **Example:** Michelin-starred restaurants, molecular gastronomy

### 4. Cultural Customs & Laws
- **Prompt:** `get_cultural_customs_simplification_prompt()`
- **Best for:** Local rules, customs, etiquette
- **Example:** Tipping customs, dress codes, religious practices

### 5. Emergency & Safety Information
- **Prompt:** `get_emergency_safety_simplification_prompt()`
- **Best for:** Emergency numbers, safety guidelines, health information
- **Example:** Emergency contacts, natural disaster procedures

### 6. Currency & Financial Information
- **Prompt:** `get_currency_exchange_simplification_prompt()`
- **Best for:** Money, banking, payment methods
- **Example:** Exchange rates, ATM locations, tipping customs

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. API Key Error
```
❌ Error: GEMINI_API_KEY not found in environment variables
```
**Solution:** 
- Check that your `.env` file exists in the project root
- Verify the API key is correctly formatted: `GEMINI_API_KEY=your_key_here`
- Make sure there are no extra spaces or quotes

#### 2. Import Error
```
ModuleNotFoundError: No module named 'google.generativeai'
```
**Solution:**
```bash
pip install google-generativeai
```

#### 3. File Not Found Error
```
❌ File not found: data/raw_tourist_texts/public_transport_instructions.txt
```
**Solution:**
- Make sure you're running the script from the project root directory
- Verify all data files exist in the correct locations

#### 4. API Rate Limit
```
Error: Rate limit exceeded
```
**Solution:**
- Wait a few minutes and try again
- Consider upgrading your Gemini API plan if needed

#### 5. Network Error
```
Error: Connection timeout
```
**Solution:**
- Check your internet connection
- Try again in a few minutes
- Verify the Gemini API service is available

## 📈 Understanding the Results

### Text Reduction Percentage
- **Good:** 30-50% reduction (maintains important information while simplifying)
- **Excellent:** 40-60% reduction (significant simplification without losing key details)
- **Too Much:** >70% reduction (may be losing important information)

### Quality Indicators
- ✅ **Clear structure** with headers and bullet points
- ✅ **Simple language** without jargon
- ✅ **Actionable instructions** tourists can follow
- ✅ **Cultural sensitivity** and respect
- ✅ **Safety information** included where relevant

### Red Flags
- ❌ **Factual errors** or missing important details
- ❌ **Complex language** that's still hard to understand
- ❌ **Cultural insensitivity** or inappropriate tone
- ❌ **Missing safety warnings** for important information

## 🎉 Success Criteria

Your TravelBuddy simplification feature is working well if:

1. **Simplified text is 30-60% shorter** than the original
2. **Language is clear and simple** for non-native English speakers
3. **Important information is preserved** and highlighted
4. **Instructions are actionable** and easy to follow
5. **Cultural context is respected** and explained
6. **Safety information is included** where relevant
7. **Format is scannable** with clear structure

## 🚀 Next Steps

Once you've successfully tested the feature:

1. **Integrate into your main application** using the prompt functions
2. **Add error handling** for API failures
3. **Implement caching** to avoid repeated API calls
4. **Add user feedback** to improve the prompts
5. **Expand the dataset** with more examples
6. **Fine-tune prompts** based on user needs

Happy testing! 🎯 