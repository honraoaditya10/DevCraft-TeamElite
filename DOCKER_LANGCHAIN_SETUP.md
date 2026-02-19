# Docker & LangChain Integration Guide

## Overview
Docu-Agent now includes Docker containerization and LangChain AI integration for advanced PDF rulebook processing and eligibility inference.

## Quick Start with Docker

### Prerequisites
- Docker Desktop (Windows: WSL2 enabled)
- Docker Compose
- Optional: OpenAI API key for LangChain

### Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services
- **Frontend**: http://localhost:5173 (React dev server)
- **Backend**: http://localhost:8001 (Node.js Express API)
- **MongoDB**: mongodb://admin:password123@localhost:27017 (Database)

## Environment Variables

Create a `.env` file in the root directory:

```dotenv
# LangChain Configuration
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here

# JWT Secret
JWT_SECRET=your_secret_key

# MongoDB (Docker)
MONGODB_URI=mongodb://admin:password123@mongodb:27017/docu_agent?authSource=admin

# Node Environment
NODE_ENV=production
PORT=8001
```

## LangChain Integration

### Features
- **PDF Processing**: Automatic rulebook extraction using LangChain document loaders
- **RAG Chain**: Retrieval-augmented generation for eligibility queries
- **Embeddings**: OpenAI embeddings for semantic search
- **Vector Store**: FAISS for efficient rule matching

### Python Dependencies
```bash
# Install LangChain dependencies
pip install langchain langchain-anthropic pypdf faiss-cpu openai
```

### Usage in Backend

```javascript
import { processRulebookWithLangChain, queryRulebookWithLangChain } from './langchain_handler.js';

// Process PDF and extract rules
const result = await processRulebookWithLangChain('https://example.com/rulebook.pdf');

// Query rulebook
const query = await queryRulebookWithLangChain('What is the income limit for SC category?');
```

## Docker Files

### Dockerfile
- Multi-stage build: Frontend (Vite) + Backend (Node + Python)
- Includes health checks
- Python 3 for AI pipeline

### docker-compose.yml
- Services: MongoDB, Express Server, React Frontend
- Automatic healthchecks
- Network isolation
- Volume persistence

## Development vs Production

### Development
```bash
docker-compose up
# Services run in dev mode with hot-reload
```

### Production
```bash
# Build production images
docker build -t docu-agent:latest .

# Run container
docker run -p 8001:8001 \
  -e MONGODB_URI="mongodb://..." \
  -e OPENAI_API_KEY="sk-..." \
  docu-agent:latest
```

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB service
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb
```

### LangChain Import Error
```bash
# Install Python dependencies inside container
docker-compose exec server pip install langchain openai faiss-cpu
```

### Port Already in Use
```bash
# Change port in docker-compose.yml
# ports: "8002:8001"  # Map to different port
```

## Performance Notes
- Frontend hot-reload enabled in dev mode
- Backend auto-restart on file changes
- MongoDB persistence in volumes
- LangChain caching for repeated queries

## Next Steps
1. Add OpenAI API key to `.env`
2. Upload rulebook PDFs via admin panel
3. Query eligibility using LangChain chain
4. View extracted rules in admin dashboard
