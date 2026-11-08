"""
Qwen LLM Explanation Engine powered by Hugging Face Inference API.
Uses Qwen/Qwen2.5-72B-Instruct with Hugging Face token authentication & fast timeout.
"""

import os
import re
import concurrent.futures
from typing import Any, Dict, List, Optional
from huggingface_hub import InferenceClient

QWEN_HF_MODEL = "Qwen/Qwen2.5-72B-Instruct"

def sanitize_prompt_input(text: str, max_chars: int = 150) -> str:
    """Sanitizes user-provided input to neutralize prompt injection, delimiter escapes, and jailbreaks."""
    if not text:
        return ""
    # Flatten whitespace / newlines
    cleaned = re.sub(r"[\r\n\t]+", " ", str(text))
    # Neutralize delimiter characters and escape quotes
    cleaned = re.sub(r"[`\"'<{}>]", "", cleaned)
    # Filter common adversarial injection tokens
    injection_patterns = [
        r"(?i)\bignore\s+(all\s+)?(previous|prior)\s+instructions\b",
        r"(?i)\bsystem\s+prompt\b",
        r"(?i)\byou\s+are\s+now\b",
        r"(?i)\bjailbreak\b",
    ]
    for pattern in injection_patterns:
        cleaned = re.sub(pattern, "[FILTERED]", cleaned)
    return cleaned[:max_chars].strip()

class ExplanationEngine:
    def __init__(self, model_name: str = QWEN_HF_MODEL):
        self.model_name = model_name
        self.token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
        self._client = None

    def _get_client(self) -> Optional[InferenceClient]:
        """Initialize HuggingFace InferenceClient."""
        if self._client is None and self.token:
            try:
                self._client = InferenceClient(
                    model=self.model_name,
                    token=self.token,
                    timeout=3.5  # Fast 3.5s timeout
                )
            except Exception as e:
                print(f"Warning: Could not initialize HuggingFace InferenceClient: {e}")
                self._client = None
        return self._client

    def _invoke_hf_api(self, messages: List[Dict[str, str]]) -> Optional[str]:
        """Helper to invoke Hugging Face API with strict 3.5s execution timeout."""
        client = self._get_client()
        if not client:
            return None

        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(
                    client.chat_completion,
                    messages=messages,
                    max_tokens=100,
                    temperature=0.7
                )
                response = future.result(timeout=3.5)
                return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"HuggingFace API timeout/error: {e}")
            return None

    def generate_explanation(
        self,
        query: str,
        restaurant: Dict[str, Any],
        location_context: str = ""
    ) -> str:
        """Generates natural language rationale for recommending a specific restaurant using Qwen 72B Instruct."""
        name = restaurant.get("name", "This restaurant")
        location = restaurant.get("location", "Chennai")
        cuisines = ", ".join(restaurant.get("cuisines", [])) or "various cuisines"
        price = restaurant.get("price_for_two", 500)
        rating = restaurant.get("overall_rating", 4.0)
        top_dishes = ", ".join(restaurant.get("top_dishes", [])[:4]) or "specialty dishes"
        dist_km = restaurant.get("distance_km", 0.0)
        features = ", ".join(restaurant.get("features", [])[:3])

        safe_query = sanitize_prompt_input(query, max_chars=120)
        safe_loc_context = sanitize_prompt_input(location_context or location, max_chars=80)
        safe_name = sanitize_prompt_input(name, max_chars=80)

        prompt = (
            f"User search query: '{safe_query}' around {safe_loc_context}.\n"
            f"Write a 2-sentence, enticing, personalized explanation of why {safe_name} in {location} "
            f"({dist_km:.1f} km away, rating {rating:.1f}/5, ₹{price:.0f} for two, serving {cuisines}, "
            f"famous for {top_dishes}) is a top match."
        )
        messages = [
            {
                "role": "system",
                "content": "You are GourmetAI, an elite food concierge in Chennai. Write concise, engaging, 2-sentence recommendations."
            },
            {"role": "user", "content": prompt}
        ]

        hf_result = self._invoke_hf_api(messages)
        if hf_result:
            return hf_result

        # Fast dynamic synthesis fallback
        reasons = []
        if dist_km > 0 and dist_km <= 3.0:
            reasons.append(f"just {dist_km:.1f} km away in {location}")
        elif location in location_context or location_context in location:
            reasons.append(f"conveniently located in {location}")

        if rating >= 4.3:
            reasons.append(f"boasts an exceptional rating of {rating}/5")
        elif rating >= 4.0:
            reasons.append(f"highly rated at {rating}/5 by food lovers")

        if top_dishes:
            reasons.append(f"renowned for signature dishes like {top_dishes}")

        if features:
            reasons.append(f"offers great amenities ({features})")

        reason_str = ", ".join(reasons) if len(reasons) > 1 else f"offers fantastic {cuisines} at ₹{price:.0f} for two"

        return (
            f"**{name}** is selected because it {reason_str}. "
            f"It perfectly matches your preference for {cuisines} with an average price of ₹{price:.0f} for two."
        )

    def explain_recommendations(
        self,
        query: str,
        restaurants: List[Dict[str, Any]],
        location_context: str = ""
    ) -> List[Dict[str, Any]]:
        """Attaches Qwen AI explanations to top recommendations."""
        for rest in restaurants:
            rest["ai_explanation"] = self.generate_explanation(query, rest, location_context)
        return restaurants


# Global singleton instance
explainer = ExplanationEngine()
