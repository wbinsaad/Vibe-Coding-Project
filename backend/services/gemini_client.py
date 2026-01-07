"""
Gemini API Client Configuration

Provides a configured Gemini client for AI-powered features.
"""

import os
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


def test_connection():
    """
    Test the Gemini API connection.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        client = get_gemini_client()
        # Try a simple generation to verify the connection works
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents='Say hello in one word'
        )
        return True
    except Exception as e:
        print(f"Connection test failed: {str(e)}")
        return False
