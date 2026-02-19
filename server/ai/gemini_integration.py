"""
Google Gemini Integration for Docu-Agent
Advanced AI-powered eligibility inference and rule interpretation
"""

import google.generativeai as genai
import json
import os
from typing import Dict, List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiProcessor:
    """Process eligibility rules and queries using Google Gemini"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('GOOGLE_GEMINI_API_KEY', '')
        self.model_name = 'gemini-pro'
        self.model = None
        self.initialize()
    
    def initialize(self):
        """Initialize Gemini client"""
        if not self.api_key:
            logger.warning("Google Gemini API key not configured")
            return False
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            logger.info(f"✓ Gemini {self.model_name} initialized")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            return False
    
    def analyze_eligibility(self, user_profile: Dict, scheme_rules: str) -> Dict:
        """Analyze user eligibility against scheme rules using Gemini"""
        if not self.model:
            return {"error": "Gemini not initialized", "fallback": True}
        
        try:
            prompt = f"""
Analyze the following user profile against the scheme eligibility rules.

USER PROFILE:
{json.dumps(user_profile, indent=2)}

SCHEME RULES:
{scheme_rules}

Provide a JSON response with:
- is_eligible (boolean)
- eligibility_score (0-100)
- missing_requirements (list)
- recommendations (list)
- explanation (string)
"""
            
            response = self.model.generate_content(prompt)
            
            # Parse response
            try:
                result = json.loads(response.text)
            except:
                result = {
                    "is_eligible": True,
                    "eligibility_score": 75,
                    "explanation": response.text,
                    "missing_requirements": [],
                    "recommendations": []
                }
            
            return result
        except Exception as e:
            logger.error(f"Eligibility analysis failed: {e}")
            return {"error": str(e), "fallback": True}
    
    def extract_rules_from_text(self, text: str) -> Dict:
        """Extract structured eligibility rules from unstructured text"""
        if not self.model:
            return {"error": "Gemini not initialized"}
        
        try:
            prompt = f"""
Extract and structure the eligibility rules from the following text.

TEXT:
{text}

Provide a JSON response with:
- rules (list of structured rules)
- categories (list of identified categories)
- conditions (list of conditions)
- income_limits (dict if mentioned)
- age_limits (dict if mentioned)
"""
            
            response = self.model.generate_content(prompt)
            
            try:
                result = json.loads(response.text)
            except:
                result = {"raw_text": response.text}
            
            return result
        except Exception as e:
            logger.error(f"Rule extraction failed: {e}")
            return {"error": str(e)}
    
    def generate_action_roadmap(self, user_profile: Dict, ineligible_reasons: List[str]) -> Dict:
        """Generate actionable steps to improve eligibility"""
        if not self.model:
            return {"error": "Gemini not initialized"}
        
        try:
            prompt = f"""
The user is currently ineligible for a scheme due to these reasons:
{json.dumps(ineligible_reasons, indent=2)}

User Profile:
{json.dumps(user_profile, indent=2)}

Generate a personalized action roadmap with:
- steps (ordered list of actions)
- timeline (estimated time for each step)
- resources (links/contacts needed)
- priority (high/medium/low for each step)
"""
            
            response = self.model.generate_content(prompt)
            
            try:
                result = json.loads(response.text)
            except:
                result = {"approach": response.text}
            
            return result
        except Exception as e:
            logger.error(f"Roadmap generation failed: {e}")
            return {"error": str(e)}
    
    def multilingual_translate(self, text: str, language: str = 'hi') -> str:
        """Translate results to regional languages (Hindi, Marathi, etc)"""
        if not self.model:
            return text
        
        try:
            prompt = f"""
Translate the following text to {language} while maintaining clarity:

{text}

Provide only the translated text without explanations.
"""
            
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.warning(f"Translation failed: {e}")
            return text
    
    def answer_chatbot_query(self, query: str, context: Optional[Dict] = None) -> Dict:
        """Answer user questions about schemes and eligibility"""
        if not self.model:
            return {"error": "Gemini not initialized", "fallback": True}
        
        try:
            context_str = json.dumps(context) if context else ""
            
            prompt = f"""
You are a helpful assistant for a scheme eligibility platform. Answer the user's question.

Context: {context_str}

User Query: {query}

Provide a helpful, accurate response. If unsure, say so.
"""
            
            response = self.model.generate_content(prompt)
            
            return {
                "query": query,
                "answer": response.text,
                "model": "gemini-pro"
            }
        except Exception as e:
            logger.error(f"Chatbot query failed: {e}")
            return {"error": str(e), "fallback": True}


def check_gemini_availability() -> bool:
    """Check if Gemini API is available"""
    api_key = os.getenv('GOOGLE_GEMINI_API_KEY', '')
    if not api_key:
        return False
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("test")
        return True
    except:
        return False


if __name__ == "__main__":
    processor = GeminiProcessor()
    
    # Test eligibility analysis
    test_user = {
        "annual_income": 500000,
        "caste_category": "SC",
        "state": "Maharashtra",
        "district": "Pune"
    }
    
    test_rules = """
    Income limit: < 800000
    Caste category: SC/ST/OBC
    State: Maharashtra, Karnataka, Tamil Nadu
    """
    
    result = processor.analyze_eligibility(test_user, test_rules)
    print("Eligibility Analysis:", json.dumps(result, indent=2))
