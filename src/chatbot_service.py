from flask import Flask, request, jsonify
import boto3
import uuid
from datetime import datetime

app = Flask(__name__)

# Initialize DynamoDB client
dynamodb = boto3.client("dynamodb", region_name="eu-north-1")

# Store chat in DynamoDB
def store_chat_history(user_id, user_message, bot_response):
    timestamp = datetime.utcnow().isoformat()
    dynamodb.put_item(
        TableName="ChatbotHistory",
        Item={
            "userId": {"S": user_id},
            "timestamp": {"S": timestamp},
            "userMessage": {"S": user_message},
            "botResponse": {"S": bot_response}
        }
    )

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get("message", "").lower()

    if "acne" in user_message:
        reply = "Use a cleanser with salicylic acid or benzoyl peroxide. Avoid touching your face frequently."
    elif "dry skin" in user_message:
        reply = "Apply thick moisturizers, especially after bathing. Avoid hot water and harsh soaps."
    elif "oily skin" in user_message:
        reply = "Use oil-free moisturizers and gentle foaming cleansers. Avoid greasy makeup."
    elif "eczema" in user_message:
        reply = "Use fragrance-free moisturizers and avoid long hot showers. For flare-ups, consider seeing a dermatologist."
    elif "psoriasis" in user_message:
        reply = "Moisturize frequently, avoid stress, and try coal tar or salicylic acid shampoos for scalp issues."
    elif "sunscreen" in user_message:
        reply = "Always use SPF 30 or higher. Reapply every 2 hours when outside, even on cloudy days."
    elif "dark spots" in user_message or "hyperpigmentation" in user_message:
        reply = "Try creams with niacinamide or vitamin C. Use sunscreen to prevent further pigmentation."
    elif "wrinkles" in user_message or "anti-aging" in user_message:
        reply = "Retinol, peptides, and sunscreen are key. Hydration and sleep also help."
    elif "itchy" in user_message or "rash" in user_message:
        reply = "Apply calamine lotion or hydrocortisone cream. Avoid scratching and wear loose clothing."
    elif "dandruff" in user_message:
        reply = "Use shampoos with ketoconazole, selenium sulfide, or zinc pyrithione. Don’t scratch your scalp."
    elif "blackheads" in user_message:
        reply = "Use exfoliants with salicylic acid and avoid heavy pore-clogging products."
    elif "open pores" in user_message or "large pores" in user_message:
        reply = "Use niacinamide, clay masks, and always cleanse twice daily."
    elif "sensitive skin" in user_message:
        reply = "Avoid products with alcohol or fragrance. Stick to gentle, hypoallergenic products."
    elif "redness" in user_message or "rosacea" in user_message:
        reply = "Use calming ingredients like green tea or niacinamide. Avoid spicy food and alcohol."
    elif "face wash" in user_message:
        reply = "Choose one based on your skin type—gel cleansers for oily skin, cream cleansers for dry skin."
    elif "moisturizer" in user_message:
        reply = "For dry skin, use thick creams. For oily skin, go for lightweight gel-based moisturizers."
    elif "exfoliate" in user_message:
        reply = "Exfoliate 1–2 times a week using gentle scrubs or chemical exfoliants like AHAs/BHAs."
    elif "routine" in user_message:
        reply = "Basic routine: Cleanser → Moisturizer → Sunscreen (AM), Cleanser → Treatment → Moisturizer (PM)."
    elif "skin care" in user_message or "skincare" in user_message:
        reply = "Skincare should match your skin type. Stay consistent and avoid switching products too often."
    else:
        reply = "Sorry, I’m still learning. Try rephrasing your question or ask about a skin issue like acne, dryness, or pigmentation."

    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(port=5002, debug=True)
