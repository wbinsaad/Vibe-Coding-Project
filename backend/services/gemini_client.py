"""
Gemini API Client Configuration

Provides a configured Gemini client for AI-powered features.
"""

import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def get_gemini_client():
    """
    Get a configured Gemini client instance.
    
    Returns:
        google.genai.Client: Configured Gemini client
        
    Raises:
        ValueError: If API key is not found in environment variables
    """
    try:
        from google import genai
    except ImportError:
        raise ImportError(
            "google-genai package not installed. "
            "Install it with: pip install google-genai"
        )
    
    # Try GEMINI_API_KEY first, fall back to GOOGLE_API_KEY
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    
    if not api_key:
        raise ValueError(
            "Gemini API key not found. Please set GEMINI_API_KEY or GOOGLE_API_KEY "
            "in your .env file. Get your key from: https://aistudio.google.com/app/apikey"
        )
    
    # Initialize and return the client
    client = genai.Client(api_key=api_key)
    
    return client


def get_model_name():
    """
    Get the configured Gemini model name.
    
    Returns:
        str: Model name (default: gemma-3-1b-it)
    """
    return os.getenv('GEMINI_MODEL', 'gemma-3-1b-it')


def generate_with_schema(prompt, schema):
    """
    Generate content with JSON output using a schema.
    
    For models that don't support structured output (like gemma-3-1b-it),
    this uses regular text generation and asks the model to return JSON,
    then parses the response.
    
    Args:
        prompt (str): The prompt to send to Gemini
        schema (dict): JSON schema for the expected response structure (for reference)
        
    Returns:
        tuple: (parsed_dict, raw_text) - Parsed JSON response and raw text
        
    Raises:
        Exception: If generation fails or response isn't valid JSON
    """
    client = get_gemini_client()
    model_name = get_model_name()
    
    # Enhance prompt to explicitly request JSON format
    json_prompt = f"""{prompt}

IMPORTANT: You must respond with valid JSON only. No other text before or after the JSON.
The JSON must match this structure:
{json.dumps(schema, indent=2)}

Respond with JSON now:"""
    
    # Generate with regular text mode (no structured output)
    response = client.models.generate_content(
        model=model_name,
        contents=json_prompt
    )
    
    # Get the raw text
    raw_text = response.text.strip()
    
    # Try to extract JSON from the response
    # Sometimes models add markdown code blocks
    if '```json' in raw_text:
        # Extract JSON from markdown code block
        start = raw_text.find('```json') + 7
        end = raw_text.find('```', start)
        json_str = raw_text[start:end].strip()
    elif '```' in raw_text:
        # Extract from generic code block
        start = raw_text.find('```') + 3
        end = raw_text.find('```', start)
        json_str = raw_text[start:end].strip()
    else:
        # Assume the entire response is JSON
        json_str = raw_text
    
    # Parse the JSON
    try:
        result = json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON from model response: {str(e)}\nResponse: {raw_text[:200]}")
    
    return result, raw_text


def test_connection():
    """
    Test the Gemini API connection.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        client = get_gemini_client()
        model_name = get_model_name()
        # Try a simple generation to verify the connection works
        response = client.models.generate_content(
            model=model_name,
            contents='Say hello in one word'
        )
        return True
    except Exception as e:
        print(f"Connection test failed: {str(e)}")
        return False
