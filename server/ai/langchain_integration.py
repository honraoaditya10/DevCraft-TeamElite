"""
LangChain Integration for Docu-Agent
Handles PDF extraction, rule parsing, and eligibility inference
"""

from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.llms import OpenAI
import json
import os
from typing import List, Dict

class RulebookProcessor:
    """Process and extract rules from scheme PDFs using LangChain"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('OPENAI_API_KEY', '')
        self.embeddings = None
        self.vectorstore = None
        self.qa_chain = None
        
    def load_pdf(self, pdf_path: str) -> List[Dict]:
        """Load and extract text from PDF using LangChain"""
        try:
            loader = PyPDFLoader(pdf_path)
            documents = loader.load()
            return documents
        except Exception as e:
            return {"error": f"Failed to load PDF: {str(e)}"}
    
    def extract_rules(self, documents: List) -> List[Dict]:
        """Extract eligibility rules from documents"""
        text_splitter = CharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.split_documents(documents)
        
        rules = []
        for i, text in enumerate(texts):
            rule = {
                "id": f"rule_{i}",
                "content": text.page_content,
                "source": text.metadata.get("source", "unknown"),
                "page": text.metadata.get("page", 0)
            }
            rules.append(rule)
        
        return rules
    
    def setup_retrieval_chain(self, documents: List):
        """Setup LangChain retrieval QA chain for eligibility queries"""
        try:
            text_splitter = CharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            texts = text_splitter.split_documents(documents)
            
            # Initialize embeddings and vector store
            self.embeddings = OpenAIEmbeddings(openai_api_key=self.api_key)
            self.vectorstore = FAISS.from_documents(texts, self.embeddings)
            
            # Setup QA chain
            llm = OpenAI(temperature=0, openai_api_key=self.api_key)
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever()
            )
            
            return True
        except Exception as e:
            print(f"Error setting up chain: {str(e)}")
            return False
    
    def query_eligibility(self, query: str) -> Dict:
        """Query the LangChain for eligibility information"""
        if not self.qa_chain:
            return {"error": "QA chain not initialized"}
        
        try:
            result = self.qa_chain.run(query)
            return {
                "query": query,
                "response": result
            }
        except Exception as e:
            return {"error": f"Query failed: {str(e)}"}


def process_rulebook_pdf(pdf_url: str, api_key: str = None) -> Dict:
    """Main function to process a rulebook PDF and extract rules"""
    processor = RulebookProcessor(api_key)
    
    try:
        # Load PDF
        documents = processor.load_pdf(pdf_url)
        if isinstance(documents, dict) and "error" in documents:
            return documents
        
        # Extract rules
        rules = processor.extract_rules(documents)
        
        # Setup retrieval chain
        processor.setup_retrieval_chain(documents)
        
        return {
            "success": True,
            "total_rules": len(rules),
            "rules": rules,
            "processor_status": "initialized"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    # Test the integration
    print("LangChain integration loaded and ready")
