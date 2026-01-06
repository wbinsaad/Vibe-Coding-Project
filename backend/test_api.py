#!/usr/bin/env python3
"""
Test script for the /api/scripts/generate endpoint

This script tests the script generation endpoint with both valid and invalid data
"""

import requests
import json


BASE_URL = "http://localhost:5000"


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60 + "\n")


def test_valid_script_generation():
    """Test creating a valid script"""
    print_section("TEST 1: Valid Script Generation")
    
    payload = {
        "research_goal": "Understand user pain points with mobile banking",
        "target_users": "Mobile banking app users aged 25-45",
        "duration_minutes": 30,
        "interview_type": "semi-structured"
    }
    
    print("Sending request...")
    print(f"Payload: {json.dumps(payload, indent=2)}\n")
    
    response = requests.post(
        f"{BASE_URL}/api/scripts/generate",
        json=payload
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    
    if response.status_code == 201:
        data = response.json()
        print(f"✓ Script created with ID: {data['script_id']}")
        print(f"✓ Generated {len(data['questions'])} questions")
        print(f"✓ Sections: intro, warmup, main, closing")
        return True
    else:
        print("✗ Failed to create script")
        return False


def test_missing_fields():
    """Test validation with missing required fields"""
    print_section("TEST 2: Missing Required Fields")
    
    payload = {
        "research_goal": "Test research",
        "target_users": "Test users"
        # Missing duration_minutes and interview_type
    }
    
    print("Sending request with missing fields...")
    print(f"Payload: {json.dumps(payload, indent=2)}\n")
    
    response = requests.post(
        f"{BASE_URL}/api/scripts/generate",
        json=payload
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    
    if response.status_code == 400:
        print("✓ Validation error returned correctly")
        return True
    else:
        print("✗ Expected 400 status code")
        return False


def test_invalid_interview_type():
    """Test validation with invalid interview_type"""
    print_section("TEST 3: Invalid Interview Type")
    
    payload = {
        "research_goal": "Test research",
        "target_users": "Test users",
        "duration_minutes": 30,
        "interview_type": "invalid-type"
    }
    
    print("Sending request with invalid interview_type...")
    print(f"Payload: {json.dumps(payload, indent=2)}\n")
    
    response = requests.post(
        f"{BASE_URL}/api/scripts/generate",
        json=payload
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    
    if response.status_code == 400:
        print("✓ Validation error returned correctly")
        return True
    else:
        print("✗ Expected 400 status code")
        return False


def test_invalid_duration():
    """Test validation with invalid duration"""
    print_section("TEST 4: Invalid Duration")
    
    payload = {
        "research_goal": "Test research",
        "target_users": "Test users",
        "duration_minutes": "not-a-number",
        "interview_type": "structured"
    }
    
    print("Sending request with invalid duration...")
    print(f"Payload: {json.dumps(payload, indent=2)}\n")
    
    response = requests.post(
        f"{BASE_URL}/api/scripts/generate",
        json=payload
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    
    if response.status_code == 400:
        print("✓ Validation error returned correctly")
        return True
    else:
        print("✗ Expected 400 status code")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  SCRIPT GENERATION ENDPOINT TESTS")
    print("="*60)
    print(f"\nTesting endpoint: {BASE_URL}/api/scripts/generate")
    print("Make sure the Flask server is running!\n")
    
    try:
        # Check if server is running
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code != 200:
            print("❌ Server health check failed. Is the Flask server running?")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Please start the Flask server:")
        print("   python app.py")
        return
    
    # Run tests
    results = []
    results.append(("Valid Script Generation", test_valid_script_generation()))
    results.append(("Missing Fields Validation", test_missing_fields()))
    results.append(("Invalid Interview Type", test_invalid_interview_type()))
    results.append(("Invalid Duration", test_invalid_duration()))
    
    # Summary
    print_section("TEST SUMMARY")
    
    for test_name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    
    print(f"\nResults: {passed}/{total} tests passed")
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
