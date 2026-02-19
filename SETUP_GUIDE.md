# 🚀 Quick Start Guide - Docu-Agent Agentic System

## Prerequisites Checklist

- ✅ Python 3.10+ ([Download](https://www.python.org))
- ✅ Node.js 18+ ([Download](https://nodejs.org))
- ✅ MongoDB ([Atlas cloud](https://www.mongodb.com/cloud/atlas) or [Local](https://docs.mongodb.com/manual/installation/))
- ✅ API Key: Google Gemini or OpenAI

## 1️⃣ Setup MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)
```bash
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a new cluster
4. Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/docu_agent
5. Copy to .env as MONGODB_URL
```

### Option B: Local MongoDB
```bash
# Windows
1. Download MongoDB Community Edition
2. Install and start: net start MongoDB
3. Connection: mongodb://localhost:27017
4. Copy to .env as MONGODB_URL
```

## 2️⃣ Get API Key

### Google Gemini (Free Credits)
```bash
1. Go to https://ai.google.dev
2. Get API key
3. Set in .env: GEMINI_API_KEY=your_key
```

### OpenAI
```bash
1. Go to https://platform.openai.com
2. Create API key
3. Set in .env: OPENAI_API_KEY=your_key
```

## 3️⃣ Configure Environment

```bash
cd d:\Hackathon\Docu-Agent

# Copy example env file
cp .env.example .env

# Edit .env with your values:
# - MONGODB_URL
# - GEMINI_API_KEY (or OPENAI_API_KEY)
# - VITE_API_URL (leave as http://localhost:8000 for local dev)
```

## 4️⃣ Install Python Dependencies

```bash
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install packages
pip install pymongo python-multipart python-dotenv pydantic-settings

# Verify installation
pip list | findstr "pymongo fastapi"
```

## 5️⃣ Start Backend (FastAPI + AI Agents)

```bash
# Terminal 1
cd d:\Hackathon\Docu-Agent
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Output**:
```
✓ MongoDB initialized
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Press CTRL+C to quit
```

**Access**:
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v2/health

## 6️⃣ Start Backend Server (Optional - for database)

```bash
# Terminal 2
cd d:\Hackathon\Docu-Agent\server
npm install  # if not done
npm run dev
```

## 7️⃣ Start Frontend (React)

```bash
# Terminal 3
cd d:\Hackathon\Docu-Agent
npm install  # if not done
npm run dev
```

**Access**: http://localhost:5173

## ✅ Verify Everything Works

### 1. Check Backend Health
```bash
curl http://localhost:8000/api/v2/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "components": {
    "api": "running",
    "database": "connected",
    "agents": "ready"
  }
}
```

### 2. Test Document Upload
```bash
curl -X POST http://localhost:8000/api/v2/upload-document \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "document_text": "Income Certificate. Name: Rahul Patil. Annual Income: 500000. Category: OBC. Issue Date: 2024-01-15. Valid Till: 2026-01-15.",
    "filename": "income_cert.pdf"
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Document processed successfully",
  "document_id": "..."
}
```

### 3. Check Eligibility
```bash
curl -X POST http://localhost:8000/api/v2/check-eligibility \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user_123"}'
```

### 4. Access Frontend
- Open http://localhost:5173
- Sign up / Login
- Go to Documents → Upload documents
- View Eligibility Results

## 🧪 Test the Full Flow

### Step 1: Login/Signup
```
http://localhost:5173 → Click Signup
Create account: test@example.com / password123
```

### Step 2: Upload Documents
```
Dashboard → Documents
Upload: income_cert.txt with content:
"Income Certificate issued to John Doe for financial year 2024.
Annual Income: Rs. 600,000
Category: General
State: Maharashtra"
```

### Step 3: View Results
```
Documents → [Upload button] → "View Eligibility Results"
or
Dashboard → Eligibility Results
```

### Step 4: See AI Analysis
The system will show:
- ✅ Eligible schemes (100% match)
- ◐ Partial matches (50-99% match)
- ✗ Not eligible schemes
- Reasons for each decision
- Next recommended actions

## 📊 Admin: Upload Schemes

### Via API
```bash
curl -X POST http://localhost:8000/api/v2/admin/upload-scheme \
  -H "Content-Type: application/json" \
  -d '{
    "scheme_name": "Merit Plus Scholarship 2024",
    "scheme_text": "Eligibility Criteria:\n1. Max annual income: 500000\n2. Eligible categories: SC, ST, OBC, Minority\n3. Min marks: 75%\n4. States: Andhra Pradesh, Karnataka, Maharashtra"
  }'
```

### View All Schemes
```bash
curl http://localhost:8000/api/v2/admin/schemes
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
⚠ MongoDB connection failed. Using mock mode.

Solution:
1. Check MONGODB_URL in .env is correct
2. Verify MongoDB is running: net start MongoDB (Windows)
3. Check firewall if using Atlas
4. Run: mongosh to test local connection
```

### API Key Error
```
ValueError: GEMINI_API_KEY (or OPENAI_API_KEY) is not set.

Solution:
1. Check .env has GEMINI_API_KEY or OPENAI_API_KEY
2. Restart terminal/IDE after setting .env
3. Use: $env:GEMINI_API_KEY="your_key" in PowerShell
```

### Port Already in Use
```
ERROR: Address already in use

Solution:
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
uvicorn app.main:app --port 8001
```

### Swagger UI Not Loading
```
http://localhost:8000/docs shows 404

Solution:
Make sure app is running with:
uvicorn app.main:app --reload

FastAPI includes Swagger automatically
```

## 📚 API Documentation

**Interactive Docs**: http://localhost:8000/docs

**Key Endpoints**:
- `POST /api/v2/upload-document` - Upload & process student document
- `POST /api/v2/check-eligibility` - Calculate eligibility
- `GET /api/v2/eligibility/{user_id}` - Get cached results
- `GET /api/v2/profile/{user_id}` - Get merged student profile
- `GET /api/v2/dashboard/{user_id}` - Complete dashboard data
- `POST /api/v2/admin/upload-scheme` - Admin: Add new scheme
- `GET /api/v2/admin/schemes` - Admin: List all schemes

## 📖 Documentation Files

- **[AGENTIC_SYSTEM.md](./AGENTIC_SYSTEM.md)** - Complete agent architecture
- **[API_GUIDE.md](./API_GUIDE.md)** - Detailed API reference (coming soon)
- **FastAPI Docs**: http://localhost:8000/docs

## 🎯 Next Steps

1. ✅ Run the system locally
2. ✅ Test with sample data
3. [ ] Deploy to production (AWS, Azure, or DigitalOcean)
4. [ ] Connect to real MongoDB Atlas
5. [ ] Set up email notifications
6. [ ] Add real file uploads (S3)
7. [ ] Enable admin dashboard

## 🚨 Important Notes

### For Development
- Change `VITE_API_URL` if backend runs on different port
- Enable CORS is already done in `app.main:CORSMiddleware`
- All data is local in development

### For Production
- [ ] Remove `allow_origins=["*"]` from CORS
- [ ] Set specific allowed origins
- [ ] Use environment-specific configs
- [ ] Enable HTTPS
- [ ] Set strong database passwords
- [ ] Store secrets in .env (never commit)
- [ ] Use managed database (MongoDB Atlas)
- [ ] Add rate limiting
- [ ] Set up logging/monitoring

## ✨ Success Indicators

✅ Backend running: `http://localhost:8000/api/v2/health` returns 200
✅ MongoDB connected: Health check shows "database": "connected"
✅ Frontend loaded: `http://localhost:5173` works
✅ Document upload works: Status shows "success"
✅ Eligibility analysis works: Shows eligible schemes


---

**Need Help?**
- Check logs in terminal
- Run health check: `http://localhost:8000/api/v2/health`
- Visit API docs: `http://localhost:8000/docs`
- Check environment variables in `.env`
