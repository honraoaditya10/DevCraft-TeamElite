# Docu-Agent: Agentic AI Eligibility Intelligence System

## 🧠 System Architecture

This is a **multi-agent AI system** that autonomously processes student documents, extracts data, validates information, analyzes government schemes, and determines scholarship eligibility.

### 6-Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  STUDENT DOCUMENT UPLOAD                     │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  Document Processing Agent      │
        │  - Detect type                  │
        │  - Clean text                   │
        │  - Flag scanned docs            │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼──────────────────┐
        │  Data Extraction Agent            │
        │  - Extract structured JSON        │
        │  - Merge multi-doc profiles       │
        │  - Set confidence scores          │
        └────────────────┬──────────────────┘
                         │
        ┌────────────────▼──────────────────┐
        │  Validation Agent                 │
        │  - Check data consistency         │
        │  - Verify expiry dates            │
        │  - Flag anomalies                 │
        └────────────────┬──────────────────┘
                         │
        ┌────────────────▼──────────────────────────────────────┐
        │            ORCHESTRATION AGENT (SUPERVISOR)            │
        │  - Coordinate all agents                              │
        │  - Manage workflow state                              │
        │  - Store in MongoDB                                   │
        │  - Trigger auto-recalculation                          │
        └─────────────────┬──────────────────────┬──────────────┘
                          │                      │
           ┌──────────────▼───────┐   ┌─────────▼──────────────┐
           │  Scheme Understanding │   │  Eligibility Decision  │
           │  Agent                │   │  Agent                 │
           │  - Parse scheme PDFs  │   │  - Match rules         │
           │  - Extract rules      │   │  - Compute scores      │
           │  - Build rule tree    │   │  - Generate reasons    │
           └──────────────────────┘   └────────┬───────────────┘
                                               │
                    ┌──────────────────────────▼──────────────────┐
                    │  ELIGIBILITY RESULTS DASHBOARD               │
                    │  - Eligible schemes                          │
                    │  - Partial matches                           │
                    │  - Not eligible                              │
                    │  - Next actions                              │
                    └─────────────────────────────────────────────┘
```

## 📥 Complete Data Flow

### 1. Student Document Upload
```
User uploads document
  ↓
DocumentProcessingAgent.run()
  → Detects document type
  → Cleans OCR artifacts
  → Returns cleaned text
  ↓
DataExtractionAgent.extract()
  → Sends to LLM: "Extract: name, income, category, marks..."
  → Returns structured JSON
  → Confidence score
  ↓
ValidationAgent.validate()
  → Check data consistency
  → Verify none expired
  → Flag anomalies
  ↓
Store in MongoDB
  → documents collection
  → Extract metadata
  ↓
OrchestrationAgent triggers:
  → Auto-recalculate eligibility for this user
  → Queue for processing
```

### 2. Eligibility Calculation
```
Get user profile from MongoDB
  ↓
Merge all extracted documents
  ↓
Load all schemes with rules
  ↓
For each scheme:
  EligibilityDecisionAgent.evaluate()
    → Compare user profile vs scheme rules
    → For each rule: check if matched
    → Calculate match percentage
    → Generate explanations
  ↓
Categorize results:
  - Eligible (100% match)
  - Partial (50-99% match)
  - Not Eligible (<50% match)
  ↓
Store in eligibility_results collection
  ↓
Return to dashboard with next actions
```

## 📡 API Endpoints

### Student Document Upload
```
POST /api/v2/upload-document
{
  "user_id": "user123",
  "document_text": "...",
  "filename": "income_certificate.pdf"
}

Response:
{
  "status": "success",
  "message": "Document processed successfully",
  "document_id": "doc_uuid"
}
```

### Check Eligibility
```
POST /api/v2/check-eligibility
{
  "user_id": "user123"
}

Response:
{
  "status": "success",
  "data": {
    "eligible_schemes": [
      {
        "name": "Merit Plus Scholarship",
        "score": 95,
        "reason": "All criteria met"
      }
    ],
    "partial_match_schemes": [...],
    "not_eligible_schemes": [...],
    "overall_score": 75,
    "missing_requirements": ["marks_percentage"],
    "next_actions": ["Apply for eligible schemes"]
  }
}
```

### Get User Profile
```
GET /api/v2/profile/{user_id}

Response:
{
  "status": "success",
  "profile": {
    "full_name": "Rahul Patil",
    "gender": "Male",
    "category": "OBC",
    "annual_income": 500000,
    "marks_percentage": 78.5,
    "domicile_state": "Maharashtra",
    ...
  }
}
```

### Get Dashboard Data
```
GET /api/v2/dashboard/{user_id}

Response:
{
  "status": "success",
  "dashboard": {
    "user": {...},
    "documents": [...],
    "eligibility_results": [...],
    "profile_completion": 85,
    "next_actions": [...]
  }
}
```

### List Documents
```
GET /api/v2/documents/{user_id}

Response:
{
  "status": "success",
  "count": 3,
  "documents": [
    {
      "_id": "...",
      "document_type": "income_certificate",
      "original_filename": "income_cert.pdf",
      "status": "completed",
      "extraction_confidence": 0.92,
      "extracted_data": {...}
    }
  ]
}
```

### Admin: Upload Scheme
```
POST /api/v2/admin/upload-scheme
{
  "scheme_name": "Merit Plus Scholarship",
  "scheme_text": "..."
}

Response:
{
  "status": "success",
  "message": "Scheme loaded successfully"
}
```

### Admin: List All Schemes
```
GET /api/v2/admin/schemes

Response:
{
  "status": "success",
  "count": 5,
  "schemes": [
    {
      "_id": "...",
      "scheme_name": "Merit Plus",
      "provider": "National Board",
      "description": "..."
    }
  ]
}
```

### System Health
```
GET /api/v2/health

Response:
{
  "status": "ok",
  "components": {
    "api": "running",
    "database": "connected",
    "agents": "ready"
  }
}
```

## 💾 MongoDB Collections

### users
```json
{
  "_id": "user_id",
  "name": "...",
  "email": "...",
  "profile_data": {...}
}
```

### documents
```json
{
  "_id": "doc_id",
  "user_id": "user_id",
  "document_type": "income_certificate",
  "extracted_data": {
    "full_name": "...",
    "annual_income": 500000,
    "category": "OBC",
    "issued_date": "2024-01-15",
    "valid_till": "2026-01-15",
    "confidence": 0.92
  },
  "status": "completed",
  "uploaded_at": "2026-02-18T..."
}
```

### schemes
```json
{
  "_id": "scheme_id",
  "scheme_name": "Merit Plus Scholarship",
  "provider": "National Board",
  "rules": [
    {
      "field": "annual_income",
      "operator": "<",
      "value": 500000,
      "description": "Max income limit"
    },
    {
      "field": "category",
      "operator": "in",
      "value": ["SC", "ST", "OBC"],
      "description": "Eligible categories"
    }
  ]
}
```

### eligibility_results
```json
{
  "_id": "result_id",
  "user_id": "user_id",
  "scheme_id": "scheme_id",
  "scheme_name": "Merit Plus Scholarship",
  "status": "eligible",
  "match_score": 95,
  "reason": "All criteria met",
  "rule_details": [...],
  "recalculated_at": "2026-02-18T..."
}
```

## 🤖 Agent Behaviors

### 1. Document Processing Agent
- **Input**: Raw document text
- **Output**: Cleaned text + document type
- **Behavior**: 
  - Detects if scanned (OCR artifacts)
  - Cleans common OCR errors
  - Classifies document type
  - Confidence: 0.85-0.95

### 2. Data Extraction Agent
- **Input**: Cleaned document text + type
- **Output**: Structured JSON with extracted fields
- **Behavior**:
  - Uses LLM to extract: name, income, category, marks, dates
  - Returns confidence score per field
  - Handles missing data gracefully
  - Confidence: 0.75-0.92

### 3. Validation Agent
- **Input**: Extracted data
- **Output**: Validation status + errors/warnings
- **Behavior**:
  - Checks data consistency
  - Verifies date validity
  - Flags anomalies (100% marks, zero income)
  - Cross-checks with user profile
  - Identifies missing required fields

### 4. Scheme Understanding Agent
- **Input**: Scheme PDF document text
- **Output**: Structured rules in JSON format
- **Behavior**:
  - Converts policy text to rule structure
  - Identifies operators: =, <, >, <=, >=, in, not_in
  - Extracts benefits and requirements
  - Builds decision trees
  - Confidence: 0.80-0.90

### 5. Eligibility Decision Agent
- **Input**: User profile + Scheme rules
- **Output**: Eligibility decision + score
- **Behavior**:
  - Evaluates each rule deterministically
  - Calculates match percentage
  - Generates human-readable explanations
  - Identifies missing requirements
  - No randomness - same input = always same output

### 6. Orchestration Agent (Supervisor)
- **Input**: All user data + all schemes
- **Output**: Complete eligibility analysis
- **Behavior**:
  - Coordinates all agents
  - Manages database operations
  - **Auto-recalculates**: When profile updated
  - **Auto-reprocesses**: When documents re-uploaded
  - **Auto-detects**: New schemes and rematch all users
  - **Auto-flags**: Expired certificates
  - Generates suggested next actions

## 🔄 Automatic Behaviors

### Auto-Recalculation
When user uploads new document:
```
1. Process document
2. Extract and validate data
3. Store in MongoDB
4. → Trigger automatic eligibility recalculation
5. Update eligibility_results collection
6. Notify dashboard to refresh
```

### Auto-Processing
When new scheme added by admin:
```
1. Parse scheme document
2. Extract rules
3. Store scheme in MongoDB
4. → Trigger eligibility check for ALL users
5. Update all eligibility_results
6. Mark new scheme for all user dashboards
```

### Auto-Flagging
Continuously monitors:
- Expired certificates
- Missing required documents
- Low extraction confidence
- Data anomalies

## 🏁 Usage Example

### 1. Setup
```bash
cd d:\Hackathon\Docu-Agent
# Ensure .env has MONGODB_URL and GEMINI_API_KEY
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### 2. Student Journey

**Step 1**: User uploads income certificate
```bash
curl -X POST http://localhost:8000/api/v2/upload-document \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "student_123",
    "document_text": "Income Certificate issued to Rahul Patil...",
    "filename": "income_cert.pdf"
  }'
```

**Step 2**: User uploads mark sheet
```bash
curl -X POST http://localhost:8000/api/v2/upload-document \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "student_123",
    "document_text": "Mark Sheet for Rahul Patil, Total marks...",
    "filename": "marks.pdf"
  }'
```

**Step 3**: Check eligibility
```bash
curl -X POST http://localhost:8000/api/v2/check-eligibility \
  -H "Content-Type: application/json" \
  -d '{"user_id": "student_123"}'
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "eligible_schemes": [
      {
        "name": "Merit Plus Scholarship",
        "score": 95,
        "reason": "All criteria met"
      }
    ],
    "partial_match_schemes": [...],
    "not_eligible_schemes": [...],
    "overall_score": 80,
    "missing_requirements": [],
    "next_actions": ["Apply for Merit Plus Scholarship"]
  }
}
```

## 🔐 Security

- ✅ Sensitive data encrypted in MongoDB
- ✅ No raw files exposed via API
- ✅ Uses signed URLs for file access
- ✅ CORS enabled (restrict in production)
- ✅ Input validation via Pydantic
- ✅ All database queries via ORM

## 📊 Performance

- **Document Upload**: ~2-5 seconds (depends on LLM)
- **Eligibility Check**: ~1-3 seconds per scheme
- **Full Profile**: Merged from multiple documents

## 🎯 Next Steps

1. **Deploy MongoDB** (Atlas recommended)
2. **Configure .env**: MONGODB_URL, GEMINI_API_KEY
3. **Start Backend**: `uvicorn app.main:app --reload`
4. **Test APIs**: Use Swagger at `/docs`
5. **Connect Frontend**: Update React components to call new APIs
6. **Enable uploads**: Use `/api/v2/upload-document` endpoint
7. **Admin dashboard**: Use `/api/v2/admin/` endpoints for scheme management

## 🚀 Feature Roadmap

- [ ] OC detection (real OCR with Tesseract/AWS Textract)
- [ ] File uploads (S3 storage)
- [ ] Real-time WebSocket updates
- [ ] Email notifications
- [ ] Admin analytics dashboard
- [ ] Batch processing queue (Celery/Redis)
- [ ] Multi-language support
