import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os
from groq import Groq

@csrf_exempt
def generate_recipe(request):
    if request.method == "POST":
        body = json.loads(request.body)
        ingredients = body.get("ingredients", "")

        try:
            client = Groq(
                api_key=os.environ.get("GROQ_API_KEY"),
            )

            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful cooking assistant. Always return valid JSON."
                    },
                    {
                        "role": "user",
                        "content": f"""
I have these ingredients: {ingredients}. Using some or all of these ingredients, create a meal recipe. Provide additional ingredients that can be purchased if needed. Be specific in your recipe steps.

Respond ONLY with valid JSON in this exact format:

{{
  "name": "...",
  "ingredients": ["..."],
  "steps": ["..."],
  "time": "...",
#   "additional_ingredients": {{"ingredient": "estimated_price_in_dollars"}}
}}
"""
                    }
                ],
                model="llama-3.3-70b-versatile",
            )

            content = chat_completion.choices[0].message.content
            parsed = json.loads(content)

            return JsonResponse(parsed)

        except Exception as e:
            error_str = str(e)
            if "401" in error_str or "unauthorized" in error_str.lower():
                return JsonResponse({"error": "Invalid Groq API key. Please check your API key."}, status=401)
            if "429" in error_str or "rate limit" in error_str.lower():
                return JsonResponse({"error": "Groq API rate limit exceeded. Please try again later."}, status=429)
            return JsonResponse({"error": error_str}, status=500)