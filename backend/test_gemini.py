"""
Test Gemini API integration

This script verifies that the Gemini API key is configured correctly
and can make successful API calls.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.gemini_client import get_gemini_client, test_connection


def test_basic_generation():
    """Test basic text generation with Gemini"""
    print("Testing Gemini API connection...")
    print("-" * 50)
    
    try:
        # Test connection
        if not test_connection():
            print("❌ Connection test failed")
            return False
        
        print("✅ Connection test passed")
        print()
        
        # Get client
        client = get_gemini_client()
        print("✅ Client initialized successfully")
        print()
        
        # Test generation
        print("Testing text generation...")
        response = client.models.generate_content(
            model='gemma-3-1b-it',
            contents='Write a one-sentence interview question about user experience research.'
        )
        
        print("Response:")
        print(response.text)
        print()
        print("✅ Text generation successful")
        print("-" * 50)
        
        return True
        
    except ValueError as e:
        print(f"❌ Configuration error: {str(e)}")
        print()
        print("Make sure to:")
        print("1. Copy .env.example to .env")
        print("2. Add your Gemini API key to .env")
        print("3. Get a key from: https://aistudio.google.com/app/apikey")
        return False
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


if __name__ == '__main__':
    success = test_basic_generation()
    sys.exit(0 if success else 1)
