#!/usr/bin/env python3
"""
Google Gemini Image Generation Script with ImageKit Upload

This script generates images using Google's Gemini API and uploads them to ImageKit.
It accepts a prompt and returns the ImageKit URL.

Usage:
    python generate_image.py --prompt "your prompt here" --variation "A"
    
Environment Variables:
    GOOGLE_API_KEY: Google Gemini API key (required)
    IMAGEKIT_PRIVATE_KEY: ImageKit private key (required)
    IMAGEKIT_PUBLIC_KEY: ImageKit public key (required)
    IMAGEKIT_URL_ENDPOINT: ImageKit URL endpoint (required)
"""

import argparse
import base64
import json
import logging
import os
import sys
import uuid
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

try:
    from imagekitio import ImageKit
except ImportError:
    print(json.dumps({
        "error": "imagekitio package not installed. Run: pip install imagekitio",
        "success": False
    }))
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ImageKitUploader:
    """Handles uploading images to ImageKit"""
    
    def __init__(
        self,
        private_key: Optional[str] = None,
        public_key: Optional[str] = None,
        url_endpoint: Optional[str] = None
    ):
        self.private_key = private_key or os.getenv('IMAGEKIT_PRIVATE_KEY')
        self.public_key = public_key or os.getenv('IMAGEKIT_PUBLIC_KEY')
        self.url_endpoint = url_endpoint or os.getenv('IMAGEKIT_URL_ENDPOINT')
        
        if not all([self.private_key, self.public_key, self.url_endpoint]):
            raise ValueError(
                "ImageKit credentials not found. Set IMAGEKIT_PRIVATE_KEY, "
                "IMAGEKIT_PUBLIC_KEY, and IMAGEKIT_URL_ENDPOINT environment variables"
            )
        
        self._client = ImageKit(
            private_key=self.private_key,
            public_key=self.public_key,
            url_endpoint=self.url_endpoint
        )
        logger.info("ImageKit client initialized successfully")
    
    def upload(self, image_bytes: bytes, filename: str, folder: str = "ad-images") -> Dict:
        """
        Upload image bytes to ImageKit
        
        Args:
            image_bytes: Raw image bytes
            filename: Name for the uploaded file
            folder: ImageKit folder path
            
        Returns:
            Dict with url, file_id, and other metadata
        """
        from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
        
        # Convert bytes to base64 for upload
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        result = self._client.upload_file(
            file=image_base64,
            file_name=filename,
            options=UploadFileRequestOptions(
                folder=folder,
                use_unique_file_name=True,
            )
        )
        
        # Access the raw response dict from response_metadata
        # Result is UploadFileResult object, raw data is in response_metadata.raw
        if hasattr(result, 'response_metadata') and hasattr(result.response_metadata, 'raw'):
            raw = result.response_metadata.raw
            if isinstance(raw, dict) and 'url' in raw:
                logger.info(f"Image uploaded successfully: {raw['url']}")
                return {
                    "url": raw.get('url'),
                    "file_id": raw.get('fileId'),
                    "name": raw.get('name', filename),
                    "thumbnail_url": raw.get('thumbnailUrl')
                }
        
        # Fallback: try direct attribute access on result object
        if hasattr(result, 'url') and result.url:
            logger.info(f"Image uploaded successfully: {result.url}")
            return {
                "url": result.url,
                "file_id": getattr(result, 'file_id', None),
                "name": getattr(result, 'name', filename),
                "thumbnail_url": getattr(result, 'thumbnail_url', None)
            }
        
        raise Exception(f"ImageKit upload failed or unexpected response: {result}")


class GeminiImageGenerator:
    """Handles image generation using Google Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('GOOGLE_API_KEY')
        
        if not self.api_key:
            raise ValueError(
                "Google API key not found. Set GOOGLE_API_KEY environment variable "
                "or pass api_key parameter"
            )
        
        os.environ['GOOGLE_API_KEY'] = self.api_key
        self._client = genai.Client()
        logger.info("Gemini client initialized successfully")
    
    def generate_image(
        self,
        prompt: str,
        model: str = "gemini-2.5-flash-image",
        aspect_ratio: str = "1:1"
    ) -> Tuple[bytes, str]:
        """Generate an image from a text prompt"""
        logger.info(f"Generating image with prompt: {prompt[:100]}...")
        
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
        
        for part in response.parts:
            if part.text is not None:
                logger.info(f"Generated text: {part.text}")
            elif part.inline_data is not None:
                image_bytes = part.inline_data.data
                mime_type = part.inline_data.mime_type or 'image/png'
                logger.info(f"Image generated successfully: {mime_type}, {len(image_bytes)} bytes")
                return image_bytes, mime_type
        
        raise Exception("No image data found in Gemini response")


def main():
    """Main entry point for the script"""
    parser = argparse.ArgumentParser(
        description="Generate images using Google Gemini API and upload to ImageKit"
    )
    parser.add_argument("--prompt", type=str, required=True, help="Text prompt for image generation")
    parser.add_argument("--variation", type=str, default="A", choices=["A", "B"], help="Variation identifier")
    parser.add_argument("--model", type=str, default="gemini-2.5-flash-image", help="Gemini model to use")
    parser.add_argument("--aspect-ratio", type=str, default="1:1", choices=["1:1", "3:4", "4:3", "9:16", "16:9"])
    parser.add_argument("--campaign-id", type=str, default="default", help="Campaign ID for folder organization")
    
    args = parser.parse_args()
    
    try:
        # Initialize clients
        generator = GeminiImageGenerator()
        uploader = ImageKitUploader()
        
        # Generate image
        image_bytes, mime_type = generator.generate_image(
            prompt=args.prompt,
            model=args.model,
            aspect_ratio=args.aspect_ratio
        )
        
        # Generate unique filename
        ext = "png" if "png" in mime_type else "jpg"
        filename = f"ad_{args.campaign_id}_{args.variation}_{uuid.uuid4().hex[:8]}.{ext}"
        
        # Upload to ImageKit
        folder = f"ad-images/{args.campaign_id}"
        upload_result = uploader.upload(image_bytes, filename, folder)
        
        # Output JSON result
        result = {
            "success": True,
            "variation_id": args.variation,
            "image_url": upload_result["url"],
            "thumbnail_url": upload_result.get("thumbnail_url"),
            "file_id": upload_result["file_id"],
            "mime_type": mime_type,
            "prompt_used": args.prompt
        }
        
        print(json.dumps(result, indent=2))
        sys.exit(0)
        
    except Exception as e:
        logger.error(f"Script execution failed: {e}")
        print(json.dumps({
            "success": False,
            "error": str(e),
            "variation_id": args.variation
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
