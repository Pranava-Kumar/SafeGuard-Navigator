#!/usr/bin/env python3
"""
Test script to verify the geocoding functionality for SafeRoute Chennai implementation
"""

import sys
import os
import asyncio
import requests

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.geocoding_service import geocoding_service

async def test_geocoding():
    """Test the geocoding service with Chennai locations"""
    
    print("Testing SafeRoute Geocoding Service")
    print("=" * 40)
    
    # Test locations in Chennai
    test_locations = [
        "Chennai Central Railway Station",
        "T. Nagar",
        "Anna Nagar",
        "Guindy",
        "Velachery",
        "Marina Beach",
        "Kapaleeshwarar Temple"
    ]
    
    print("\n1. Testing Forward Geocoding")
    print("-" * 30)
    
    for i, location in enumerate(test_locations, 1):
        print(f"\nTest {i}: {location}")
        try:
            result = await geocoding_service.geocode(
                query=f"{location}, Chennai, India",
                limit=1,
                country_codes=["IN"]
            )
            
            if result["success"] and result["results"]:
                first_result = result["results"][0]
                print(f"  SUCCESS Found: {first_result['name']}")
                print(f"  SUCCESS Coordinates: {first_result['latitude']:.6f}, {first_result['longitude']:.6f}")
                print(f"  SUCCESS Address: {first_result['display_name'][:50]}...")
            else:
                print(f"  ERROR Not found or error: {result.get('error', 'Unknown error')}")
        except Exception as e:
            print(f"  ERROR Error: {str(e)}")
    
    print("\n2. Testing Reverse Geocoding")
    print("-" * 30)
    
    # Test with known Chennai coordinates
    test_coordinates = [
        (13.0827, 80.2707, "Chennai Central"),
        (13.0398, 80.2342, "T. Nagar"),
        (13.0878, 80.2785, "Anna Nagar"),
        (13.0102, 80.2155, "Guindy"),
        (12.9791, 80.2242, "Velachery")
    ]
    
    for i, (lat, lng, name) in enumerate(test_coordinates, 1):
        print(f"\nTest {i}: {name} ({lat:.4f}, {lng:.4f})")
        try:
            result = await geocoding_service.reverse_geocode(
                latitude=lat,
                longitude=lng
            )
            
            if result["success"] and result["result"]:
                address_result = result["result"]
                print(f"  SUCCESS Address: {address_result['display_name'][:50]}...")
                print(f"  SUCCESS Name: {address_result['name']}")
                print(f"  SUCCESS Type: {address_result['type']}")
            else:
                print(f"  ERROR Error: {result.get('error', 'Unknown error')}")
        except Exception as e:
            print(f"  ERROR Error: {str(e)}")
    
    print("\n" + "=" * 40)
    print("Geocoding tests completed")

if __name__ == "__main__":
    asyncio.run(test_geocoding())