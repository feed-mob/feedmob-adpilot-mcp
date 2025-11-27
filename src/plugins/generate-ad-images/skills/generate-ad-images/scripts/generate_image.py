#!/usr/bin/env python3
"""
Google Gemini Image Generation Script

This script generates images using Google's Gemini API.
It accepts a prompt and returns base64-encoded image data with mime type.

Usage:
    python generate_image.py --prompt "your prompt here" --variation "A"
    
Environment Variables:
    GOOGLE_API_KEY: Google Gemini API key (required)
"""

import argparse
import base64
import json
import logging
import os
import sys
from typing import Dict, Optional, Tuple

try:
    from google import genai
    from google.genai import types
except ImportError:
    print(json.dumps({
        "error": "google-genai package not installed. Run: pip install google-genai>=1.32.0",
        "success": False
    }))
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GeminiImageGenerator:
    """Handles image generation using Google Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Gemini client
        
        Args:
            api_key: Google API key. If None, reads from GOOGLE_API_KEY env var
        """
        self.api_key = api_key or os.getenv('GOOGLE_API_KEY')
        
        if not self.api_key:
            raise ValueError(
                "Google API key not found. Set GOOGLE_API_KEY environment variable "
                "or pass api_key parameter"
            )
        
        try:
            # Set API key in environment for the client
            os.environ['GOOGLE_API_KEY'] = self.api_key
            self._client = genai.Client()
            logger.info("Gemini client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            raise
    
    def generate_image(
        self,
        prompt: str,
        model: str = "gemini-2.5-flash-image",
        aspect_ratio: str = "1:1"
    ) -> Tuple[bytes, str]:
        """
        Generate an image from a text prompt
        
        Args:
            prompt: Text description of the image to generate
            model: Gemini model to use for generation
            aspect_ratio: Image aspect ratio (1:1, 3:4, 4:3, 9:16, 16:9)
            
        Returns:
            Tuple of (image_bytes, mime_type)
            
        Raises:
            Exception: If image generation fails
        """
        logger.info(f"Generating image with prompt: {prompt[:100]}...")
        
        try:
            response = self._client.models.generate_content(
                model=model,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio=aspect_ratio,
                    ),
                ),
            )
            
            # Extract image data from response
            for part in response.parts:
                if part.text is not None:
                    logger.info(f"Generated text: {part.text}")
                elif part.inline_data is not None:
                    # Use as_image() to get the image
                    image = part.as_image()
                    
                    # Get image bytes - the image object has format and can be saved
                    from io import BytesIO
                    buffer = BytesIO()
                    image.save(buffer, format='PNG')
                    image_bytes = buffer.getvalue()
                    mime_type = 'image/png'
                    
                    logger.info(f"Image generated successfully: {mime_type}, {len(image_bytes)} bytes")
                    return image_bytes, mime_type
            
            raise Exception("No image data found in Gemini response")
            
        except Exception as e:
            logger.error(f"Image generation failed: {e}")
            raise
    
    def generate_and_encode(
        self,
        prompt: str,
        variation_id: str = "A",
        aspect_ratio: str = "1:1"
    ) -> Dict[str, str]:
        """
        Generate an image and return it as base64-encoded JSON
        
        Args:
            prompt: Text description of the image to generate
            variation_id: Variation identifier (A or B)
            aspect_ratio: Image aspect ratio
            
        Returns:
            Dictionary with image_data (base64), mime_type, and variation_id
        """
        try:
            image_bytes, mime_type = self.generate_image(prompt, aspect_ratio=aspect_ratio)
            
            # Encode to base64
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            return {
                "success": True,
                "variation_id": variation_id,
                "image_data": image_base64,
                "mime_type": mime_type,
                "prompt_used": prompt
            }
            
        except Exception as e:
            logger.error(f"Failed to generate and encode image: {e}")
            return {
                "success": False,
                "error": str(e),
                "variation_id": variation_id
            }


def main():
    """Main entry point for the script"""
    parser = argparse.ArgumentParser(
        description="Generate images using Google Gemini API"
    )
    parser.add_argument(
        "--prompt",
        type=str,
        required=True,
        help="Text prompt for image generation"
    )
    parser.add_argument(
        "--variation",
        type=str,
        default="A",
        choices=["A", "B"],
        help="Variation identifier (A or B)"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="gemini-2.5-flash-image",
        help="Gemini model to use"
    )
    parser.add_argument(
        "--aspect-ratio",
        type=str,
        default="1:1",
        choices=["1:1", "3:4", "4:3", "9:16", "16:9"],
        help="Image aspect ratio"
    )
    parser.add_argument(
        "--api-key",
        type=str,
        help="Google API key (overrides GOOGLE_API_KEY env var)"
    )
    
    args = parser.parse_args()
    
    try:
        # Initialize generator
        generator = GeminiImageGenerator(api_key=args.api_key)
        
        # Generate image
        result = generator.generate_and_encode(
            prompt=args.prompt,
            variation_id=args.variation,
            aspect_ratio=args.aspect_ratio
        )
        
        # Output JSON result
        print(json.dumps(result, indent=2))
        
        # Exit with appropriate code
        sys.exit(0 if result.get("success") else 1)
        
    except Exception as e:
        logger.error(f"Script execution failed: {e}")
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
