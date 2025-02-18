import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, firestore
import requests
import logging
import json
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import io
import base64
import random
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from prophet import Prophet
from flask import request, jsonify
from dotenv import load_dotenv

# Set up logging with detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Inline Firebase credentials (do not hard-code in production)

load_dotenv()

# Load Firebase credentials from environment variable
firebase_creds = json.loads(os.getenv("FIREBASE_CREDENTIALS"))

# Initialize Firebase
cred = credentials.Certificate(firebase_creds)
firebase_admin.initialize_app(cred)

# Initialize Firestore DB
db = firestore.client()

app = Flask(__name__)
CORS(app)

# ----------------------------
# Hard-coded Salt Edge credentials
# ----------------------------
SALTEDGE_APP_ID = "DZHDGVirVVf15Nqhrs_sZ6lnEQKuxXPdzoeSnMRe8ak"
SALTEDGE_SECRET = "i_7kOqKEzYN9SpsIcQ1mxkFu36a7Y0F09pGIVGrQrvA"


# ----------------------------
# Firebase Authentication Endpoints
# ----------------------------

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")

    if not email or not password or not username:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        user = auth.create_user(email=email, password=password)
        db.collection("users").document(user.uid).set({
            "email": email,
            "username": username,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return jsonify({"message": "User created successfully", "uid": user.uid}), 201
    except Exception as e:
        logging.error(f"Signup error: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route("/verify-token", methods=["POST"])
def verify_token():
    data = request.json
    token = data.get("token")
    
    if not token:
        return jsonify({"error": "No token provided"}), 400
        
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token["uid"]
        user_doc = db.collection("users").document(uid).get()

        if user_doc.exists:
            return jsonify({"message": "Token is valid", "user": user_doc.to_dict()}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logging.error(f"Token verification error: {str(e)}")
        return jsonify({"error": str(e)}), 401

@app.route("/get-user/<uid>", methods=["GET"])
def get_user(uid):
    try:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            return jsonify(user_doc.to_dict()), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logging.error(f"Get user error: {str(e)}")
        return jsonify({"error": str(e)}), 400

# ----------------------------
# Credit Score Tips Endpoint using Google Gemini API
# ----------------------------

@app.route("/credit-tips", methods=["POST"])
def credit_tips():
    """
    Generate credit score improvement tips using the Google Gemini API.
    Randomly selects one of 5 predefined prompts and titles, returning bullet-point tips
    with check marks.
    """
    try:
        logging.info("Received request for credit tips")
        # Define 5 different prompt options
        PROMPTS = [
            {
                "title": "Emergency Fund Tips",
                "prompt": "Provide 5 specific, actionable bullet point tips with check marks on how to build an emergency fund."
            },
            {
                "title": "Investing Strategies",
                "prompt": "Provide 5 specific, actionable bullet point tips with check marks on how to invest effectively."
            },
            {
                "title": "Saving Money Tips",
                "prompt": "Provide 5 specific, actionable bullet point tips with check marks on how to save money regularly."
            },
            {
                "title": "Budgeting Advice",
                "prompt": "Provide 5 specific, actionable bullet point tips with check marks on how to create and stick to a budget."
            },
            {
                "title": "Debt Management",
                "prompt": "Provide 5 specific, actionable bullet point tips with check marks on how to manage and reduce debt."
            }
        ]
        chosen = random.choice(PROMPTS)
        chosen_title = chosen["title"]
        prompt = chosen["prompt"]

        # Hardcoded Gemini API key and URL:
        gemini_api_key = "AIzaSyBf4A4u5pgIE3DH3aE5DRLrZGvlHdgcgvI"
        gemini_api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

        logging.info(f"Making request to Gemini API at: {gemini_api_url}")
        headers = {"Content-Type": "application/json"}
        full_url = f"{gemini_api_url}?key={gemini_api_key}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        response = requests.post(full_url, headers=headers, json=payload)
        try:
            response.raise_for_status()
        except Exception as err:
            logging.error(f"Gemini API error {response.status_code}: {response.text}")
            return jsonify({"error": f"Gemini API error {response.status_code}: {response.text}"}), 500

        result = response.json()
        logging.info(f"Received response from Gemini API: {json.dumps(result)}")

        if "candidates" in result and result["candidates"]:
            candidate = result["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                tips = candidate["content"]["parts"][0]["text"]
            else:
                logging.error(f"Unexpected response structure: {json.dumps(candidate)}")
                return jsonify({"error": "Invalid response format from AI service"}), 500
        else:
            logging.error(f"No candidates in response: {json.dumps(result)}")
            return jsonify({"error": "No response from AI service"}), 500

        # Return both the title and the tips
        return jsonify({"title": chosen_title, "tips": tips}), 200

    except requests.exceptions.RequestException as e:
        logging.error(f"Network error calling Gemini API: {str(e)}")
        return jsonify({"error": f"Failed to connect to AI service: {str(e)}"}), 500
    except json.JSONDecodeError as e:
        logging.error(f"JSON parsing error: {str(e)}")
        return jsonify({"error": "Invalid response from AI service"}), 500
    except Exception as e:
        logging.error(f"Unexpected error in credit-tips endpoint: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# ----------------------------
# Low Income Questionnaire Submission Endpoint
# ----------------------------

@app.route("/submit-low-income", methods=["POST"])
def submit_low_income():
    """
    Stores the low-income user's questionnaire data in Firestore under 'low_income_users'
    and returns the user's position in the queue (based on created_at order where isPaid is False).
    """
    try:
        data = request.json
        email = data.get("email")
        answers = data.get("answers", {})
        uploaded_filename = data.get("uploadedFileName", "")
        description = data.get("description", "")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        # Use current UTC time so we can immediately query the created_at field.
        created_at = datetime.utcnow()

        # Save the document using email as the document ID.
        doc_ref = db.collection("low_income_users").document(email)
        doc_ref.set({
            "email": email,
            "answers": answers,
            "proof_of_payment_file": uploaded_filename,
            "description": description,
            "isPaid": False,
            "created_at": created_at
        })

        # Now, query all low_income_users in queue (isPaid==False) ordered by created_at.
        query = (db.collection("low_income_users")
                   .where("isPaid", "==", False)
                   .order_by("created_at"))
        docs = list(query.stream())

        # Determine the position of the submitted document in the queue.
        position = None
        for idx, doc in enumerate(docs):
            if doc.id == email:
                position = idx + 1  # Queue positions are 1-indexed
                break

        # Return the response with queuePosition.
        return jsonify({
            "message": "Low income user data submitted",
            "queuePosition": position
        }), 200

    except Exception as e:
        logging.error(f"Error submitting low income user data: {str(e)}")
        return jsonify({"error": str(e)}), 500
# ----------------------------
# Get Next Low Income User in Queue
# ----------------------------

@app.route("/get-next-low-income-user", methods=["GET"])
def get_next_low_income_user():
    """
    Retrieves the next low-income user in the queue (earliest created_at and not paid).
    Returns the user's email and description.
    Requires a composite index for (isPaid ASC, created_at ASC).
    """
    try:
        users_ref = db.collection("low_income_users")
        # Query for users where isPaid == False, ordered by created_at
        query = users_ref.where("isPaid", "==", False).order_by("created_at").limit(1)
        docs = query.stream()

        user_data = None
        for doc in docs:
            user_data = doc.to_dict()
            user_data["id"] = doc.id  # Add Firestore document ID

        if user_data:
            # Return both email and description
            return jsonify({
                "email": user_data.get("email", ""),
                "description": user_data.get("description", "")
            }), 200
        else:
            return jsonify({"error": "No low-income user in queue"}), 404

    except Exception as e:
        logging.error(f"Error in get-next-low-income-user: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ----------------------------
# Donation Endpoint
# ----------------------------

@app.route("/donate", methods=["POST"])
def donate():
    """
    Endpoint for donors to donate to a low-income user.
    Expects:
      - donorEmail: The donor's email
      - recipientEmail: The low-income user's email
      - amount: The donation amount
    Marks the recipient as paid in Firestore and sends a (placeholder) email notification.
    """
    try:
        data = request.json
        donor_email = data.get("donorEmail")
        recipient_email = data.get("recipientEmail")
        amount = data.get("amount", 0)

        if not donor_email or not recipient_email or amount <= 0:
            return jsonify({"error": "Missing donorEmail, recipientEmail, or invalid amount"}), 400

        doc_ref = db.collection("low_income_users").document(recipient_email)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Recipient not found in low_income_users"}), 404
        
        user_data = doc.to_dict()
        if user_data.get("isPaid"):
            return jsonify({"error": "User already marked as paid"}), 400

        # Mark as paid in Firestore
        doc_ref.update({"isPaid": True})

        # (Placeholder) Send an email to the recipient.
        try:
            subject = "Donation Received!"
            body = f"Hello,\n\nYou have received a donation of ${amount} from {donor_email}.\n\nBest,\nFinanceTrack"
            message = MIMEText(body)
            message["Subject"] = subject
            message["From"] = "no-reply@financetrack.com"
            message["To"] = recipient_email

            # Adjust SMTP settings for your environment.
            with smtplib.SMTP("localhost", 1025) as server:
                server.send_message(message)
        except Exception as e:
            logging.warning(f"Email sending failed: {str(e)}")
            # Not fatal—just log the error.

        return jsonify({"message": "Donation successful", "paidUser": recipient_email}), 200

    except Exception as e:
        logging.error(f"Error in /donate: {str(e)}")
        return jsonify({"error": str(e)}), 500
    

@app.route("/all-donations", methods=["GET"])
def get_all_donations():
        try:
            all_donations = []
            # Iterate over all user documents
            users = db.collection("users").stream()
            for user in users:
                donor_uid = user.id
                # Retrieve donations subcollection for each user
                donations_ref = db.collection("users").document(donor_uid).collection("donations")
                docs = donations_ref.order_by("date", direction=firestore.Query.DESCENDING).stream()
                for doc in docs:
                    record = doc.to_dict()
                    if "date" in record and hasattr(record["date"], "isoformat"):
                        record["date"] = record["date"].isoformat()
                    # Optionally, include donor's uid or email if needed:
                    record["donorUid"] = donor_uid
                    all_donations.append(record)
            return jsonify(all_donations), 200
        except Exception as e:
            logging.error(f"Error fetching all donations: {str(e)}")
            return jsonify({"error": str(e)}), 500

# ----------------------------
# Salt Edge Integration Endpoints
# ----------------------------

@app.route("/saltedge/create-customer", methods=["POST"])
def saltedge_create_customer():
    """
    Creates a Salt Edge customer for the user.
    Expects JSON with:
      - firebase_uid: The Firebase user ID.
      - identifier: A unique identifier (e.g., email).
    """
    data = request.json
    firebase_uid = data.get("firebase_uid")
    identifier = data.get("identifier")
    if not firebase_uid or not identifier:
        return jsonify({"error": "firebase_uid and identifier are required"}), 400

    # Added country_code (change "CA" if needed)
    payload = {"data": {"identifier": identifier, "country_code": "CA"}}
    saltedge_url = "https://www.saltedge.com/api/v5/customers"
    headers = {
        "App-id": SALTEDGE_APP_ID,
        "Secret": SALTEDGE_SECRET,
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(saltedge_url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        # Store the Salt Edge customer data in Firestore under the user's record.
        db.collection("users").document(firebase_uid).update({
            "saltedge_customer": result["data"]
        })
        return jsonify(result), response.status_code
    except Exception as e:
        logging.error(f"Error creating Salt Edge customer: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/saltedge/create-connect-session", methods=["POST"])
def saltedge_create_connect_session():
    """
    Creates a Salt Edge Connect session.
    Expects JSON with:
      - firebase_uid: The Firebase user ID.
      - return_to: The URL to return to after the Connect flow.
    """
    data = request.json
    firebase_uid = data.get("firebase_uid")
    return_to = data.get("return_to")
    if not firebase_uid or not return_to:
        return jsonify({"error": "firebase_uid and return_to are required"}), 400

    user_ref = db.collection("users").document(firebase_uid).get()
    if not user_ref.exists:
        return jsonify({"error": "User not found"}), 404

    user_data = user_ref.to_dict()
    saltedge_customer = user_data.get("saltedge_customer")
    if not saltedge_customer:
        return jsonify({"error": "Salt Edge customer not created"}), 400

    customer_id = saltedge_customer.get("id")
    payload = {
        "data": {
            "customer_id": customer_id,
            "attempt": {
                "return_to": return_to
            },
            "consent": {
                "scopes": ["account_details", "transactions_details"]
            }
        }
    }
    saltedge_url = "https://www.saltedge.com/api/v5/connect_sessions/create"
    headers = {
        "App-id": SALTEDGE_APP_ID,
        "Secret": SALTEDGE_SECRET,
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(saltedge_url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        return jsonify(result), response.status_code
    except Exception as e:
        logging.error(f"Error creating Salt Edge connect session: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/saltedge/store-connection", methods=["POST"])
def saltedge_store_connection():
    """
    Stores the connection details returned by Salt Edge Connect.
    Expects JSON with:
      - firebase_uid: The Firebase user ID.
      - connection: The connection data (including connection_id, provider details, etc.).
    """
    data = request.json
    firebase_uid = data.get("firebase_uid")
    connection_data = data.get("connection")
    if not firebase_uid or not connection_data:
        return jsonify({"error": "firebase_uid and connection data are required"}), 400

    try:
        user_ref = db.collection("users").document(firebase_uid)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        # Use Firestore's ArrayUnion to add the new connection.
        user_ref.update({
            "saltedge_connections": firestore.ArrayUnion([connection_data])
        })
        return jsonify({"message": "Connection stored successfully", "connection": connection_data}), 200
    except Exception as e:
        logging.error(f"Error storing connection: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/saltedge/get-connections", methods=["GET"])
def saltedge_get_connections():
    """
    Retrieves all Salt Edge connections for the user.
    Expects a query parameter:
      - firebase_uid: The Firebase user ID.
    """
    firebase_uid = request.args.get("firebase_uid")
    if not firebase_uid:
        return jsonify({"error": "firebase_uid is required"}), 400

    user_ref = db.collection("users").document(firebase_uid).get()
    if not user_ref.exists:
        return jsonify({"error": "User not found"}), 404

    user_data = user_ref.to_dict()
    saltedge_customer = user_data.get("saltedge_customer")
    if not saltedge_customer:
        return jsonify({"error": "Salt Edge customer not created"}), 400

    customer_id = saltedge_customer.get("id")
    saltedge_url = f"https://www.saltedge.com/api/v5/connections?customer_id={customer_id}"
    headers = {
        "App-id": SALTEDGE_APP_ID,
        "Secret": SALTEDGE_SECRET,
        "Content-Type": "application/json"
    }
    try:
        response = requests.get(saltedge_url, headers=headers)
        response.raise_for_status()
        result = response.json()
        return jsonify(result), response.status_code
    except Exception as e:
        logging.error(f"Error getting connections: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/saltedge/get-transactions", methods=["GET"])
def saltedge_get_transactions():
    """
    Fetches transactions for a specific connection.
    Expects query parameters:
      - connection_id: The Salt Edge connection ID.
      - Optional: from_date, to_date (YYYY-MM-DD; defaults to last 3 months).
      - Optional: per_page (default 10).
    """
    connection_id = request.args.get("connection_id")
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")
    per_page = request.args.get("per_page", 10)

    if not connection_id:
        return jsonify({"error": "connection_id is required"}), 400

    # If date range is not provided, default to the last 3 months.
    if not from_date or not to_date:
        import datetime
        today = datetime.date.today()
        three_months_ago = today - datetime.timedelta(days=90)
        from_date = three_months_ago.strftime("%Y-%m-%d")
        to_date = today.strftime("%Y-%m-%d")

    saltedge_url = (
        f"https://www.saltedge.com/api/v5/transactions?"
        f"connection_id={connection_id}&from_date={from_date}&to_date={to_date}&per_page={per_page}"
    )
    headers = {
        "App-id": SALTEDGE_APP_ID,
        "Secret": SALTEDGE_SECRET,
        "Content-Type": "application/json"
    }
    try:
        response = requests.get(saltedge_url, headers=headers)
        response.raise_for_status()
        result = response.json()
        return jsonify(result), response.status_code
    except Exception as e:
        logging.error(f"Error getting transactions: {str(e)}")
        return jsonify({"error": str(e)}), 500

# -------------------------------------------------
# The following is the suggested route for spending
# summary from the old code, with the friend changes
# integrated, providing the entire code.
# -------------------------------------------------

import requests

def convert_currency(amount, from_currency, to_currency="USD"):
    """
    Convert `amount` from `from_currency` to `to_currency` using a fixed exchange rate.
    This function should be replaced with an API call for real-time rates.
    """
    exchange_rates = {
        "EUR": 1.08,  # Example: 1 EUR = 1.08 USD
        "GBP": 1.30,  # Example: 1 GBP = 1.30 USD
        "RUB": 0.011, # Example: 1 RUB = 0.011 USD
        "MXN": 0.055, # Example: 1 MXN = 0.055 USD
        "BRL": 0.20,  # Example: 1 BRL = 0.20 USD
        "USD": 1.0    # USD remains the same
    }

    if from_currency in exchange_rates:
        return amount * exchange_rates[from_currency]
    return amount  # Default: return the same amount if no rate is available

@app.route("/saltedge/get-spending-summary", methods=["GET"])
def get_spending_summary():
    """
    Fetches and processes transactions from Salt Edge, returning categorized spending data for dashboard visualization.
    Only negative transactions are counted. For each negative transaction, its absolute value is multiplied by 10
    before being converted to CAD. All other code/logic remains as before.
    
    Query Parameters:
        firebase_uid: The Firebase user ID

    Returns:
        A JSON object containing:
          - pie_chart_data: an array of {name, value} objects (in CAD)
          - summary: total_spent, highest_expenditure, num_transactions, and number of categories
    """
    firebase_uid = request.args.get("firebase_uid")
    if not firebase_uid:
        return jsonify({"error": "firebase_uid is required"}), 400

    try:
        # Get user's Salt Edge connections from Firestore
        user_ref = db.collection("users").document(firebase_uid).get()
        if not user_ref.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_ref.to_dict()
        saltedge_customer = user_data.get("saltedge_customer")
        if not saltedge_customer:
            return jsonify({"error": "Salt Edge customer not found"}), 400

        customer_id = saltedge_customer.get("id")
        headers = {
            "App-id": SALTEDGE_APP_ID,
            "Secret": SALTEDGE_SECRET,
            "Content-Type": "application/json"
        }

        # Fetch the user's connections
        connections_url = f"https://www.saltedge.com/api/v5/connections?customer_id={customer_id}"
        connections_response = requests.get(connections_url, headers=headers)
        connections_response.raise_for_status()
        connections = connections_response.json().get("data", [])

        if not connections:
            return jsonify({"error": "No Salt Edge connections found"}), 404

        # Fetch up to 300 transactions in total
        all_transactions = []
        max_transactions = 100
        per_page = 100
        page = 1

        for connection in connections:
            while len(all_transactions) < max_transactions:
                transactions_url = (
                    f"https://www.saltedge.com/api/v5/transactions"
                    f"?connection_id={connection['id']}"
                    f"&per_page={per_page}"
                    f"&page={page}"
                )
                transactions_response = requests.get(transactions_url, headers=headers)
                transactions_response.raise_for_status()
                transactions = transactions_response.json().get("data", [])

                if not transactions:
                    break

                all_transactions.extend(transactions)

                if len(all_transactions) >= max_transactions:
                    all_transactions = all_transactions[:max_transactions]
                    break

                page += 1

        logging.info("RAW API Response from Salt Edge (Transactions):")
        logging.info(json.dumps(all_transactions, indent=2))

        # Fixed conversion rate: 1 USD = 1.34 CAD
        USD_TO_CAD = 1.34

        category_spending = {}
        total_spent = 0
        highest_expenditure = 0
        negative_count = 0

        # Process only negative transactions, each multiplied by 10
        for tx in all_transactions:
            raw_amount = float(tx.get("amount", 0))
            if raw_amount >= 0:
                # Skip positives
                continue

            # Count negative transactions
            negative_count += 1

            # Multiply the absolute value by 10
            amount = abs(raw_amount) * 10

            # If there's an original currency, convert it to USD first
            if "extra" in tx and "original_currency_code" in tx["extra"]:
                original_currency = tx["extra"].get("original_currency_code", "USD")
                original_amount = float(tx["extra"].get("original_amount", amount))
                if original_currency != "USD":
                    amount = convert_currency(original_amount * 10, original_currency, "USD")
                    # Note: We multiply by 10 here as well if the original currency is different.
            
            # Convert from USD to CAD
            amount_cad = amount * USD_TO_CAD

            # Aggregate spending by category
            category = tx.get("category", "Uncategorized")
            category_spending[category] = category_spending.get(category, 0) + amount_cad

            # Track total_spent & highest_expenditure
            total_spent += amount_cad
            if amount_cad > highest_expenditure:
                highest_expenditure = amount_cad

        # Prepare final data for the pie chart
        pie_chart_data = [
            {"name": cat, "value": round(value, 2)}
            for cat, value in category_spending.items()
        ]
        pie_chart_data.sort(key=lambda x: x["value"], reverse=True)

        summary = {
            "total_spent": round(total_spent, 2),
            "highest_expenditure": round(highest_expenditure, 2),
            "num_transactions": negative_count,
            "categories": len(category_spending),
        }

        logging.info("Returning Spending Summary Data (in CAD):")
        logging.info(json.dumps({"pie_chart_data": pie_chart_data, "summary": summary}, indent=2))

        return jsonify({
            "pie_chart_data": pie_chart_data,
            "summary": summary
        }), 200

    except requests.exceptions.RequestException as e:
        logging.error(f"Salt Edge API error: {str(e)}")
        return jsonify({"error": "Failed to fetch Salt Edge data"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


# Helper function for currency conversion (if needed)
def convert_currency(amount, from_currency, to_currency="USD"):
    exchange_rates = {
        "EUR": 1.08,  # 1 EUR = 1.08 USD
        "GBP": 1.30,  # 1 GBP = 1.30 USD
        "RUB": 0.011, # 1 RUB = 0.011 USD
        "MXN": 0.055, # 1 MXN = 0.055 USD
        "BRL": 0.20,  # 1 BRL = 0.20 USD
        "USD": 1.0    # USD remains the same
    }
    if from_currency in exchange_rates:
        return amount * exchange_rates[from_currency]
    return amount

@app.route("/forecast", methods=["POST"])
def forecast_expenses():
    """
    Forecasts daily expenses (withdrawals only) for the next 7 days using the user's real transaction data.
    Expects a JSON payload with:
      - firebase_uid: The Firebase user ID to fetch the user's Salt Edge transactions.
    """
    data = request.get_json()
    firebase_uid = data.get("firebase_uid") if data else None
    if not firebase_uid:
        return jsonify({"error": "firebase_uid is required to fetch transactions"}), 400

    # 1) Fetch user data from Firestore
    user_ref = db.collection("users").document(firebase_uid).get()
    if not user_ref.exists:
        return jsonify({"error": "User not found"}), 404
    user_data = user_ref.to_dict()
    saltedge_customer = user_data.get("saltedge_customer")
    if not saltedge_customer:
        return jsonify({"error": "Salt Edge customer not found"}), 400

    customer_id = saltedge_customer.get("id")
    headers = {
        "App-id": SALTEDGE_APP_ID,
        "Secret": SALTEDGE_SECRET,
        "Content-Type": "application/json"
    }

    # 2) Fetch user's connections from Salt Edge
    connections_url = f"https://www.saltedge.com/api/v5/connections?customer_id={customer_id}"
    connections_response = requests.get(connections_url, headers=headers)
    connections_response.raise_for_status()
    connections = connections_response.json().get("data", [])
    if not connections:
        return jsonify({"error": "No Salt Edge connections found"}), 404

    # 3) Collect up to 100 transactions from each connection
    all_transactions = []
    max_transactions = 100
    per_page = 100
    for connection in connections:
        page = 1
        while len(all_transactions) < max_transactions:
            transactions_url = (
                f"https://www.saltedge.com/api/v5/transactions"
                f"?connection_id={connection['id']}&per_page={per_page}&page={page}"
            )
            transactions_response = requests.get(transactions_url, headers=headers)
            transactions_response.raise_for_status()
            transactions = transactions_response.json().get("data", [])
            if not transactions:
                break  # No more transactions for this connection
            all_transactions.extend(transactions)
            if len(all_transactions) >= max_transactions:
                all_transactions = all_transactions[:max_transactions]
                break
            page += 1

    # 4) Process transactions: ONLY consider negative amounts (withdrawals), multiply by 10
    USD_TO_CAD = 1.34
    transactions_list = []
    for tx in all_transactions:
        raw_amount = float(tx.get("amount", 0))
        if raw_amount >= 0:
            continue  # Ignore positive transactions (deposits)

        # Multiply the absolute value of the negative amount by 10
        expense = abs(raw_amount) * 1

        # If the transaction has a different original currency, convert it to USD first
        if "extra" in tx and "original_currency_code" in tx["extra"]:
            original_currency = tx["extra"].get("original_currency_code", "USD")
            original_amount = float(tx["extra"].get("original_amount", expense))
            if original_currency != "USD":
                expense = convert_currency(original_amount * 1, original_currency, "USD")

        # Finally, convert from USD to CAD
        expense_cad = expense * USD_TO_CAD

        # Identify the transaction date (Salt Edge might store this in different keys)
        tx_date = tx.get("transaction_date") or tx.get("made_on") or tx.get("date")
        if not tx_date:
            continue
        transactions_list.append({"date": tx_date, "expense": expense_cad})

    if not transactions_list:
        return jsonify({"error": "No valid withdrawals found for forecasting."}), 404

    # 5) Load into a DataFrame and group by day
    df = pd.DataFrame(transactions_list)
    df["date"] = pd.to_datetime(df["date"])
    daily = df.groupby(pd.Grouper(key="date", freq="D"))["expense"].sum().reset_index()
    daily.rename(columns={"date": "ds", "expense": "y"}, inplace=True)

    # 6) Cap outliers at the 95th percentile and log-transform
    cap_value = daily["y"].quantile(0.75)
    daily["y"] = np.where(daily["y"] > cap_value, cap_value, daily["y"])
    daily["y"] = np.log1p(daily["y"])

    # 7) Fit a Prophet model (tune hyperparameters as needed)
    model = Prophet(
        daily_seasonality=True,
        weekly_seasonality=False,        # Set to True if you suspect weekly patterns
        yearly_seasonality=False,
        changepoint_prior_scale=0.1,   # Tweak for less or more reactivity
        seasonality_prior_scale=2.0
    )
    model.fit(daily)

    # 8) Forecast the next 7 days
    future = model.make_future_dataframe(periods=7, freq="D", include_history=True)
    forecast = model.predict(future)

    # 9) Convert forecast back from log scale
    forecast["yhat"] = np.expm1(forecast["yhat"])
    forecast["yhat_lower"] = np.expm1(forecast["yhat_lower"])
    forecast["yhat_upper"] = np.expm1(forecast["yhat_upper"])
    daily["y_original"] = np.expm1(daily["y"])

    # 10) Prepare data for JSON response
    historical = daily[["ds", "y_original"]].to_dict(orient="records")
    forecast_data = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].to_dict(orient="records")

    # 11) Generate a line chart comparing historical vs. forecast
    plt.figure(figsize=(8, 5))
    plt.plot(daily["ds"], daily["y_original"], label="Historical", marker='o')
    future_mask = forecast["ds"] > daily["ds"].max()
    plt.plot(forecast.loc[future_mask, "ds"], forecast.loc[future_mask, "yhat"],
             label="Forecast", marker='o', linestyle='--')
    plt.fill_between(
        forecast.loc[future_mask, "ds"],
        forecast.loc[future_mask, "yhat_lower"],
        forecast.loc[future_mask, "yhat_upper"],
        color='gray', alpha=0.3, label="Forecast Interval"
    )
    plt.title("Daily Expense Forecast (Withdrawals Only, Next 7 Days)")
    plt.xlabel("Date")
    plt.ylabel("Total Daily Expenses (CAD)")
    plt.xticks(rotation=45)
    plt.legend()
    plt.tight_layout()

    # 12) Encode plot as base64
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode("utf-8")
    buf.close()
    plt.close()

    return jsonify({
        "historical": historical,
        "forecast": forecast_data,
        "plot_image": image_base64
    }), 200



# ----------------------------
# Run the Flask App
# ----------------------------
if __name__ == "__main__":
    logging.info("Starting Flask application...")
    app.run(debug=True)