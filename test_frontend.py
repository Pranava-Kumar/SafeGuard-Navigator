import requests
import time

def test_frontend():
    """Test if the frontend is running"""
    try:
        # Try to access the frontend (Next.js default port)
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("Frontend is running on http://localhost:3000")
            return True
        else:
            print(f"Frontend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("Frontend is not accessible on http://localhost:3000")
        return False
    except Exception as e:
        print(f"❌ Error testing frontend: {e}")
        return False

def test_backend():
    """Test if the backend is running"""
    try:
        # Try to access the backend
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("Backend is running on http://localhost:8000")
            print("Backend Swagger UI is accessible")
            return True
        else:
            print(f"Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("Backend is not accessible on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def test_api_endpoints():
    """Test specific API endpoints"""
    try:
        # Test the register endpoint
        response = requests.post("http://localhost:8000/api/v1/auth/register", 
                                json={"email": "test@example.com", "password": "test123"},
                                timeout=5)
        print(f"Register endpoint status: {response.status_code}")
        
        # Test the login endpoint
        response = requests.post("http://localhost:8000/api/v1/auth/login", 
                                data={"username": "test@example.com", "password": "test123"},
                                timeout=5)
        print(f"Login endpoint status: {response.status_code}")
        
    except Exception as e:
        print(f"Error testing API endpoints: {e}")

if __name__ == "__main__":
    print("Testing application status...\n")
    
    frontend_ok = test_frontend()
    backend_ok = test_backend()
    
    print()
    if frontend_ok and backend_ok:
        print("Both frontend and backend are running!")
        print("Your application is ready to use!")
    else:
        print("Some components are not running properly.")
        
    print("\nTesting API endpoints...")
    test_api_endpoints()