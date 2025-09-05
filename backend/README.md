# SafeRoute Backend Setup

## Prerequisites

1. Python 3.8+
2. PostgreSQL database (NeonDB recommended)
3. OSRM routing engine
4. Node.js (for frontend and database setup)

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv .venv
.venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -e .
```

Or using requirements.txt:

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database
OSRM_URL=http://localhost:5000
NASA_API_KEY=your_nasa_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
MAPPLS_API_KEY=your_mappls_api_key
IMD_API_KEY=your_imd_api_key
```

### 4. Database Setup

Run the database setup script from the project root:

```bash
npm run setup-db
```

### 5. Start Services

1. Start OSRM service:
   ```bash
   cd backend
   setup-osrm.bat
   ```

2. Start backend server:
   ```bash
   cd backend
   start-backend.bat
   ```

3. Start frontend (from project root):
   ```bash
   npm run dev
   ```

Or use the start-all.bat script from the project root to start all services simultaneously.

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.