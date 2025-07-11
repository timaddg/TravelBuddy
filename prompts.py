# prompts.py
# Optimized prompt management for TravelBuddy application

from typing import Dict, Any, Optional
import json
import sys
import argparse

# Base prompt template for consistent structure
BASE_PROMPT_TEMPLATE = """You are TravelBuddy, a patient and ultra-clear guide for busy international tourists. Your goal is to instantly simplify complex text into actionable, easy-to-digest information that reduces confusion and stress.

{context}

Text: {complex_text}

{instructions}

Format as:
{format_template}

Keep under {word_limit} words. Focus on what tourists NEED to know."""

# Prompt configurations for different content types
PROMPT_CONFIGS = {
    "general": {
        "instructions": "Make this INSTANTLY UNDERSTANDABLE and EXTREMELY CONCISE. Focus only on critical information and immediate actions. Use only the most common, basic English words (A1/A2 CEFR level).",
        "format_template": """📋 [Main Point]

• [Key info 1]
• [Key info 2] 
• [Key info 3]

💡 [One helpful tip]""",
        "word_limit": 80
    },
    "public_transport": {
        "instructions": "Make transport info SHORT and CLEAR. Focus on practical steps and essential details.",
        "format_template": """🚇 [Destination]

• COST: [Amount]
• TIME: [Duration]
• Steps: [Simple 1-2 step direction]
• Quick Tip: [Crucial, immediate advice]
• If Lost: [Simple instruction]""",
        "word_limit": 60
    },
    "museum_exhibit": {
        "instructions": "Make museum info SHORT and EXCITING. Focus on what makes it special and interesting.",
        "format_template": """🏛️ [Exhibit Name]

• [What it is - 1 sentence]
• [Why special - 1 sentence]
• [Fun fact - 1 sentence]""",
        "word_limit": 50
    },
    "restaurant_menu": {
        "instructions": "Make food info SHORT and APPETIZING. Focus on what tourists will actually eat and enjoy.",
        "format_template": """🍽️ [Restaurant Name]

• [What you get - 1 sentence]
• [Price] • [Special feature]
• [One tip]""",
        "word_limit": 50
    },
    "cultural_customs": {
        "instructions": "Make cultural info SHORT and RESPECTFUL. Focus on essential customs and important warnings.",
        "format_template": """🌍 [Country] Customs

• [Money - 1 sentence]
• [Dress - 1 sentence]
• [Behavior - 1 sentence]
• [Warning - if serious]""",
        "word_limit": 60
    },
    "emergency_safety": {
        "instructions": "Make safety info SHORT and CLEAR. Focus on emergency procedures and essential safety tips.",
        "format_template": """🚨 Emergency Info

• [Emergency number]
• [What to do - 1 sentence]
• [Safety tip - 1 sentence]""",
        "word_limit": 50
    }
}

# Cached prompt templates for performance
_cached_prompts: Dict[str, str] = {}

def get_simplification_prompt(complex_text: str, content_type: str = "general", specific_context: str = "") -> str:
    """
    Efficient prompt generation with caching and unified structure.
    
    Args:
        complex_text: The text to simplify
        content_type: Type of content (general, public_transport, etc.)
        specific_context: Additional context if needed
    
    Returns:
        Formatted prompt string
    """
    # Use cached prompt if available
    cache_key = f"{content_type}_{bool(specific_context)}"
    if cache_key in _cached_prompts:
        return _cached_prompts[cache_key].format(
            complex_text=complex_text,
            context=f"\nContext: {specific_context}" if specific_context else ""
        )
    
    # Get configuration for content type
    config = PROMPT_CONFIGS.get(content_type, PROMPT_CONFIGS["general"])
    
    # Build context
    context = f"\nContext: {specific_context}" if specific_context else ""
    
    # Generate and cache the prompt template
    prompt_template = BASE_PROMPT_TEMPLATE.format(
        context="{context}",
        complex_text="{complex_text}",
        instructions=config["instructions"],
        format_template=config["format_template"],
        word_limit=config["word_limit"]
    )
    
    _cached_prompts[cache_key] = prompt_template
    
    # Return formatted prompt
    return prompt_template.format(
        complex_text=complex_text,
        context=context
    )

def get_quality_improvement_prompt(simplified_text: str, original_complex_text: str) -> str:
    """
    Optimized prompt for improving simplified text quality.
    """
    return f"""You are TravelBuddy. Make this SHORTER and CLEARER.

Original: {original_complex_text}

Current: {simplified_text}

Improve by:
• Making it shorter (under 60 words)
• Keeping only essential info
• Using simple language
• Clear formatting

Provide the improved version."""

def get_trip_planning_prompt(user_request: str, tourist_profile: Optional[Dict[str, Any]] = None) -> str:
    """
    Optimized prompt for trip planning with optional tourist profile.
    """
    profile_info = ""
    if tourist_profile:
        interests = tourist_profile.get('interests', 'general')
        budget = tourist_profile.get('budget', 'moderate')
        group_size = tourist_profile.get('group_size', '1 person')
        profile_info = f"Profile: {interests} • {budget} • {group_size}"

    return f"""You are TravelBuddy. Create SHORT travel plan.

{profile_info}

Request: {user_request}

Format as:
🗺️ Quick Plan

• [Day 1 - 1 sentence]
• [Day 2 - 1 sentence]
• [One tip]

Keep under 80 words."""

def get_validation_prompt(original_text: str, simplified_text: str) -> str:
    """
    Optimized validation prompt for checking simplified text quality.
    """
    return f"""You are TravelBuddy. Check if this is SHORT and ACCURATE.

Original: {original_text}

Simplified: {simplified_text}

Check:
• Is it under 60 words?
• Is it accurate?
• Is it clear?

If issues, provide SHORT corrections."""

def get_real_time_transport_prompt(origin: str, destination: str, routes_data: str) -> str:
    """
    Optimized prompt for real-time transportation information.
    """
    return f"""You are TravelBuddy. Give SHORT, PRECISE transport info for tourists.

From: {origin} → To: {destination}

Available routes:
{routes_data}

Format as:
🚇 Quick Routes to {destination}

1️⃣ [Route Name] - [Duration] - [Cost]
• [Transport type] • [Departure] → [Arrival]
• Status: [On time/Delayed] • Platform: [Number]
• [One helpful tip or note]

2️⃣ [Route Name] - [Duration] - [Cost]
• [Transport type] • [Departure] → [Arrival]
• Status: [On time/Delayed] • Platform: [Number]
• [One helpful tip or note]

🚨 Alerts: [Only if delays/changes exist]

🗺️ [Google Maps link]

Each option: 50 words max. Focus on essential info only."""

# Convenience functions for backward compatibility
def get_public_transport_simplification_prompt(complex_text: str) -> str:
    return get_simplification_prompt(complex_text, "public_transport")

def get_museum_exhibit_simplification_prompt(complex_text: str) -> str:
    return get_simplification_prompt(complex_text, "museum_exhibit")

def get_restaurant_menu_simplification_prompt(complex_text: str) -> str:
    return get_simplification_prompt(complex_text, "restaurant_menu")

def get_cultural_customs_simplification_prompt(complex_text: str) -> str:
    return get_simplification_prompt(complex_text, "cultural_customs")

def get_emergency_safety_simplification_prompt(complex_text: str) -> str:
    return get_simplification_prompt(complex_text, "emergency_safety")

def get_general_simplification_prompt(complex_text: str, content_type: str = "general") -> str:
    return get_simplification_prompt(complex_text, content_type)

# Utility functions
def clear_prompt_cache():
    """Clear the prompt cache if needed."""
    global _cached_prompts
    _cached_prompts.clear()

def get_available_content_types() -> list:
    """Get list of available content types for prompts."""
    return list(PROMPT_CONFIGS.keys())

def export_prompts_to_json() -> str:
    """Export prompt configurations to JSON for frontend use."""
    return json.dumps(PROMPT_CONFIGS, indent=2)

# Command-line interface for TypeScript integration
def main():
    parser = argparse.ArgumentParser(description='TravelBuddy Prompt Generator')
    parser.add_argument('--get-prompt', action='store_true', help='Generate a prompt')
    parser.add_argument('--type', type=str, help='Content type for prompt generation')
    parser.add_argument('--text', type=str, help='Text to simplify')
    parser.add_argument('--context', type=str, default='', help='Additional context')
    parser.add_argument('--list-types', action='store_true', help='List available content types')
    parser.add_argument('--export-json', action='store_true', help='Export prompt configs to JSON')
    
    args = parser.parse_args()
    
    if args.list_types:
        print(json.dumps(get_available_content_types()))
        return
    
    if args.export_json:
        print(export_prompts_to_json())
        return
    
    if args.get_prompt and args.type and args.text:
        prompt = get_simplification_prompt(args.text, args.type, args.context)
        print(prompt)
        return
    
    print("Usage: python prompts.py --get-prompt --type <type> --text <text>")
    print("       python prompts.py --list-types")
    print("       python prompts.py --export-json")

if __name__ == "__main__":
    main()