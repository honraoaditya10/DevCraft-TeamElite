# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. "ModuleNotFoundError: No module named 'pymongo'"

**Error**:
```
ModuleNotFoundError: No module named 'pymongo'
```

**Cause**: PyMongo not installed

**Solution**:
```bash
# Activate venv
.\.venv\Scripts\Activate.ps1

# Install
pip install pymongo python-multipart python-dotenv pydantic-settings

# Verify
pip list | findstr pymongo
```

---

### 2. "GEMINI_API_KEY is not set"

**Error**:
```
ValueError: GEMINI_API_KEY (or OPENAI_API_KEY) is not set.
```

**Cause**: Missing or incorrect API key

**Solution**:
```bash
# 1. Get free API key from https://ai.google.dev

# 2. Create/edit .env file
cp .env.example .env

# 3. Add to .env
GEMINI_API_KEY=your_actual_key_here

# 4. Save and restart terminal/IDE

# 5. Verify in PowerShell
$env:GEMINI_API_KEY
```

---

### 3. "MongoDB connection failed"

**Error**:
```
⚠ MongoDB connection failed. Using mock mode.
```

**Cause**: MongoDB not running or incorrect connection URL

**Solutions**:

**A) Using Local MongoDB**:
```bash
# 1. Start MongoDB (Windows)
net start MongoDB

# 2. Verify connection
mongosh

# 3. Check .env has correct URL
MONGODB_URL=mongodb://localhost:27017

# 4. Restart app
```

**B) Using MongoDB Atlas (Cloud)**:
```bash
# 1. Create free account: https://www.mongodb.com/cloud/atlas

# 2. Create cluster and get connection string

# 3. Add to .env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/docu_agent

# 4. Make sure IP is whitelisted in Atlas

# 5. Restart app
```

---

### 4. "Port 8000 is already in use"

**Error**:
```
OSError: [Errno 10048] Only one usage of each socket address
Address already in use
```

**Solution**:
```bash
# Option 1: Kill existing process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Option 2: Use different port
uvicorn app.main:app --port 8001

# Option 3: Check what's using the port
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
```

---

### 5. "Frontend can't reach backend API"

**Error**:
```
Failed to fetch from http://localhost:8000
CORS error
```

**Cause**: API URL mismatch or backend not running

**Solutions**:

**A) Check Backend is Running**:
```bash
# Test in PowerShell
curl http://localhost:8000/api/v2/health

# Expected response:
# {"status":"ok","components":{...}}
```

**B) Check Frontend Config**:
```bash
# In .env or vite.config.js
VITE_API_URL=http://localhost:8000

# In Documents.jsx:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```

**C) Check CORS**:
```python
# In app/main.py - CORS is enabled:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 6. "Document upload returns 400 error"

**Error**:
```json
{
  "status": "error",
  "message": "Validation failed: ..."
}
```

**Cause**: Invalid request format or missing fields

**Solution**:
```bash
# Check request format
curl -X POST http://localhost:8000/api/v2/upload-document \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "document_text": "Valid document text here...",
    "filename": "test.pdf"
  }'

# Required fields:
# - user_id (string, non-empty)
# - document_text (string, non-empty)
# - filename (optional, defaults to "document.pdf")
```

---

### 7. "LLM API call timeout"

**Error**:
```
HTTPError: ... Timeout ...
```

**Cause**: API taking too long or network issue

**Solutions**:
```bash
# 1. Check internet connection
ping google.com

# 2. Increase timeout in .env
GEMINI_TIMEOUT=60  # Default is 30

# 3. Check API status page:
# For Gemini: https://status.cloud.google.com
# For OpenAI: https://status.openai.com

# 4. Try with shorter document text (too much text = slower)
```

---

### 8. "Eligibility check returns empty results"

**Error**:
```json
{
  "eligible_schemes": [],
  "not_eligible_schemes": [],
  "overall_score": 0
}
```

**Cause**: No schemes in database or no uploaded documents

**Solutions**:

**A) Check Schemes Exist**:
```bash
curl http://localhost:8000/api/v2/admin/schemes

# Should return at least one scheme
# If empty, upload a scheme:
curl -X POST http://localhost:8000/api/v2/admin/upload-scheme \
  -H "Content-Type: application/json" \
  -d '{
    "scheme_name": "Test Scheme",
    "scheme_text": "Max income: 500000. Category: OBC."
  }'
```

**B) Check Documents Exist**:
```bash
curl http://localhost:8000/api/v2/documents/user123

# Should list uploaded documents
# If empty, first upload a document
```

**C) Check Database**:
```bash
# Use MongoDB client
mongosh

# In mongo shell:
use docu_agent
db.schemes.find()        # Check schemes
db.documents.find()      # Check documents
db.eligibility_results.find()  # Check results
```

---

### 9. "Frontend doesn't show uploaded documents"

**Error**:
```
Documents tab shows "No documents yet"
```

**Cause**: API not returning documents or user_id mismatch

**Solutions**:

**A) Verify User ID**:
```javascript
// In browser console
console.log(user)  // Should have .id property

// Check Documents.jsx:
const user = useAuth();  // Must have user.id
```

**B) Check API Response**:
```bash
# Test API directly
curl http://localhost:8000/api/v2/documents/test_user_123

# Should return:
{
  "status": "success",
  "count": N,
  "documents": [...]
}
```

**C) Check MongoDB**:
```bash
mongosh
use docu_agent
db.documents.find({ user_id: "test_user_123" })
```

---

### 10. "Extract confidence is very low"

**Error**:
```
Document processed but:
"extraction_confidence": 0.15
```

**Cause**: Document text is unclear or incomplete

**Solutions**:

**A) Better Document Text**:
```
❌ Poor:
"Some certificate thing from 2024"

✅ Good:
"Annual Income Certificate
Issued to: Rahul Kumar Patil
Annual Income: Rs. 500,000
Category: OBC
Date of Issue: 2024-01-15
Valid Till: 2026-01-15
Authority: District Administration"
```

**B) Check Validation Errors**:
```bash
# API returns validation error details:
curl -X POST http://localhost:8000/api/v2/upload-document \
  -d '{"user_id":"user123","document_text":"test",...}'

# Response shows:
{
  "status": "error",
  "message": "Validation failed: Missing income field"
}
```

---

### 11. "Docker build fails"

**Solution** (for future containerization):
```dockerfile
# Create Dockerfile
FROM python:3.11

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t docu-agent .
docker run -p 8000:8000 --env-file .env docu-agent
```

---

### 12. "Scheme upload not appearing in eligibility"

**Error**:
```
Just uploaded scheme but not in eligibility results
```

**Cause**: Eligibility results are cached

**Solution**:
```bash
# 1. After uploading scheme, recalculate:
curl -X POST http://localhost:8000/api/v2/check-eligibility \
  -d '{"user_id":"user123"}'

# 2. Or force refresh in browser:
# Frontend → Go to Dashboard → Back to Eligibility
# Browser cache will refresh

# 3. Check MongoDB:
mongosh
use docu_agent
db.schemes.find()  # Should show new scheme
```

---

## Debug Mode Checklist

### Enable Debug Logging

**Backend**:
```bash
# Add debug flag to .env
DEBUG=true

# Or run with debug:
uvicorn app.main:app --reload --reload-dirs=app
```

**Frontend**:
```javascript
// Add to top of component
console.log('Component loaded', user, API_BASE_URL)
```

### Test Each Component

```bash
# 1. Health Check
curl http://localhost:8000/api/v2/health

# 2. Upload Document
curl -X POST http://localhost:8000/api/v2/upload-document \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "document_text": "Annual Income: 500000. Category: OBC.",
    "filename": "test.pdf"
  }'

# 3. Check Eligibility
curl -X POST http://localhost:8000/api/v2/check-eligibility \
  -d '{"user_id":"test_user"}'

# 4. Get Dashboard
curl http://localhost:8000/api/v2/dashboard/test_user/
```

### MongoDB Commands

```bash
# Connect to MongoDB
mongosh

# Check database
use docu_agent
db.getCollectionNames()

# Check collections
db.users.find()
db.documents.find()
db.schemes.find()
db.eligibility_results.find()

# Clear for fresh test
db.documents.deleteMany({})
db.eligibility_results.deleteMany({})
```

---

## Performance Troubleshooting

### Slow Document Upload

```bash
# Check LLM response time
# Add timing logs in app/agents/data_extractor.py

# Common causes:
# 1. Large document text (>5000 words) → split into smaller chunks
# 2. Poor internet → check network
# 3. API rate limit → wait or upgrade plan
```

### Slow Eligibility Check

```bash
# With N schemes, takes N * (LLM call time) seconds
# Examples:
# 5 schemes × 2 sec = 10 sec total
# 10 schemes × 2 sec = 20 sec total

# optimize by:
# 1. Reducing document text before extraction
# 2. Caching scheme rules (already done)
# 3. Parallel processing (Celery)
```

---

## Reset & Clean

```bash
# Clear local temp files
rm -r d:\Hackathon\Docu-Agent\app\__pycache__
rm -r d:\Hackathon\Docu-Agent\src\*.js.map

# Clear MongoDB for fresh start
mongosh
use docu_agent
db.documents.deleteMany({})
db.eligibility_results.deleteMany({})
db.users.deleteMany({})

# Clear browser cache
# Chrome: Ctrl+Shift+Delete or Cmd+Shift+Delete (Mac)
localStorage.clear()  # In browser console
```

---

## Getting Help

### Resources

1. **FastAPI Docs**: http://localhost:8000/docs
2. **MongoDB Shell**: `mongosh` in terminal
3. **API Logs**: Check terminal where uvicorn is running
4. **Browser Console**: F12 → Console tab
5. **Network Tab**: F12 → Network tab (check API calls)

### Debug with VS Code

```python
# Add to app/main.py
import logging
logging.basicConfig(level=logging.DEBUG)

# Or in specific file
import logging
logger = logging.getLogger(__name__)
logger.debug(f"Processing document: {raw_text[:100]}")
```

---

## Frequently Asked Questions

**Q: Can I use the system without MongoDB?**
A: Yes, it will run in "mock mode" but won't persist data. Real deployment needs MongoDB.

**Q: Can I use ChatGPT instead of Gemini?**
A: Yes, set OPENAI_API_KEY in .env instead of GEMINI_API_KEY.

**Q: How long does eligibility check take?**
A: ~2-5 seconds per scheme (depends on LLM API speed).

**Q: Can users upload PDF files directly?**
A: Not yet. For production, integrate with file upload service (S3) and PDF extraction (PyPDF2, pdfminer).

**Q: Is the system GDPR compliant?**
A: Add encryption and data retention policies before production in EU.

**Q: Can multiple servers run simultaneously?**
A: Yes, with load balancer + MongoDB Atlas. Configure in production deployment.

---

## Contact & Support

- **Project Files**: `/app/agents/` - 6 agents
- **API Routes**: `/app/api/routes_v2.py`
- **Documentation**: `AGENTIC_SYSTEM.md`, `SETUP_GUIDE.md`
- **Tests**: Run API endpoints via Swagger UI at `/docs`

---

**Remember**: Check the terminal/console logs first - they usually tell you exactly what's wrong! 🔍
