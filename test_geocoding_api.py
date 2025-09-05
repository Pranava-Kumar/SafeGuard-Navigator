#!/usr/bin/env python3
"""
Test script to verify the geocoding API endpoints for SafeRoute Chennai implementation
"""

import requests
import json

def test_geocoding_api():
    \"\"\"Test the geocoding API endpoints\"\"\"
    
    print(\"Testing SafeRoute Geocoding API Endpoints\")
    print(\"=\" * 40)
    
    # Base URL for the API (adjust as needed for your setup)
    base_url = \"http://localhost:8000/api/v1\"
    
    print(\"\n1. Testing Forward Geocoding Endpoint\")
    print(\"-\" * 35)
    
    # Test forward geocoding
    try:
        response = requests.get(
            f\"{base_url}/geocoding/geocode\",
            params={
                \"q\": \"Chennai Central, Chennai, India\",
                \"countrycodes\": \"IN\"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f\"  Status: SUCCESS ({response.status_code})\")
            if data.get(\"success\") and data.get(\"results\"):
                first_result = data[\"results\"][0]
                print(f\"  Found: {first_result['name']}\")
                print(f\"  Coordinates: {first_result['latitude']:.6f}, {first_result['longitude']:.6f}\")
                print(f\"  Address: {first_result['display_name'][:50]}...\")
            else:
                print(f\"  Error: {data.get('error', 'Unknown error')}\")
        else:
            print(f\"  Status: ERROR ({response.status_code})\")
            print(f\"  Response: {response.text}\")
    except Exception as e:
        print(f\"  Exception: {str(e)}\")
    
    print(\"\n2. Testing Reverse Geocoding Endpoint\")
    print(\"-\" * 35)
    
    # Test reverse geocoding
    try:
        response = requests.get(
            f\"{base_url}/geocoding/reverse-geocode\",
            params={
                \"lat\": 13.0827,
                \"lon\": 80.2707
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f\"  Status: SUCCESS ({response.status_code})\")
            if data.get(\"success\") and data.get(\"result\"):
                result = data[\"result\"]
                print(f\"  Address: {result['display_name'][:50]}...\")
                print(f\"  Name: {result['name']}\")
                print(f\"  Type: {result['type']}\")
            else:
                print(f\"  Error: {data.get('error', 'Unknown error')}\")
        else:
            print(f\"  Status: ERROR ({response.status_code})\")
            print(f\"  Response: {response.text}\")
    except Exception as e:
        print(f\"  Exception: {str(e)}\")
    
    print(\"\n\" + \"=\" * 40)
    print(\"API endpoint tests completed\")

if __name__ == \"__main__\":
    test_geocoding_api()
