<<<<<<< HEAD
# OfficialWeSave
=======
# WeSave

WeSave is a full-stack financial assistance platform designed to help users track their spending, forecast future expenses, and support low-income users through donations. The backend is built with Flask and integrates with Firebase for authentication and Firestore for data storage, Salt Edge for financial data, and Prophet for expense forecasting. The frontend is built using Next.js and styled with Tailwind CSS.

## Overview

WeSave provides the following core functionalities:

- **User Authentication & Management:**  
  Uses Firebase Authentication and Firestore to register, verify, and manage users.

- **Spending Summary:**  
  Fetches and processes transaction data via the Salt Edge API to generate a spending summary and visualizes the data with a pie chart.

- **Expense Forecasting:**  
  Uses Prophet to forecast daily expenses (specifically withdrawals) for the next 7 days and generates a line chart comparing historical spending with forecasted trends.

- **Donation System:**  
  Allows donors to support low-income users by making donations. The donation amount is limited based on a calculated available balance (2% of the donor's total spending).

- **AI Tips for Financial Improvement:**  
  Integrates with the Google Gemini API to provide actionable, bullet-point tips for improving credit scores and other financial advice.

- **Low-Income User Queue:**  
  Provides a system for low-income users to submit their data and be placed in a queue for receiving donations.

## Technologies & Dependencies

### Backend
- **Flask:** Web framework for building RESTful APIs.
- **Flask-CORS:** For Cross-Origin Resource Sharing.
- **Firebase Admin SDK:** For Firebase authentication and Firestore operations.
- **Requests:** For making HTTP calls to external APIs (Salt Edge, Gemini).
- **Pandas & NumPy:** For data manipulation and numerical operations.
- **Matplotlib:** For generating charts and exporting them as base64 images.
- **Prophet:** For time series forecasting.
- **Python Standard Libraries:** `logging`, `smtplib`, `datetime`, `io`, `base64`, `random`, etc.

### Frontend
- **Next.js:** React framework for server-side rendering and routing.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **Lucide-react:** For icons.
- **Framer Motion:** For animations and transitions.

## Requirements

### Backend Requirements
- Python 3.7+
- Pip (Python package installer)
- Access to a Firebase project (with service account credentials)
- Salt Edge API credentials (App ID and Secret)
- Gemini API key (for AI tips)

### Frontend Requirements
- Node.js (v14+ recommended)
- npm or Yarn package manager

## Installation

### Backend Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/WeSave.git
   cd WeSave/backend
   ```

2. **Create a Virtual Environment (optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies:**
   Ensure you have a `requirements.txt` file that lists packages such as Flask, flask-cors, firebase-admin, requests, pandas, numpy, matplotlib, prophet, etc. Then run:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   Create a `.env` file (or set environment variables directly) for sensitive information such as:
   - `GEMINI_API_KEY`
   - `GEMINI_API_URL` (if you want to override the default)
   - Other API keys or secrets

5. **Run the Backend Server:**
   ```bash
   python app.py
   ```
   Replace `app.py` with the entry point of your backend application if it’s named differently.

### Frontend Installation

1. **Clone the Repository (if not already cloned):**
   ```bash
   git clone https://github.com/yourusername/WeSave.git
   cd WeSave/frontend
   ```

2. **Install Node Dependencies:**
   Using npm:
   ```bash
   npm install
   ```
   Or using Yarn:
   ```bash
   yarn install
   ```

3. **Run the Development Server:**
   Using npm:
   ```bash
   npm run dev
   ```
   Or using Yarn:
   ```bash
   yarn dev
   ```

## Usage

- **Access the Frontend:**  
  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

- **Backend Endpoints:**  
  The backend server will run on [http://localhost:5000](http://localhost:5000) (by default) and exposes endpoints such as:
  - `/signup`
  - `/verify-token`
  - `/get-user/<uid>`
  - `/credit-tips`
  - `/submit-low-income`
  - `/get-next-low-income-user`
  - `/donate`
  - `/all-donations`
  - `/saltedge/get-spending-summary`
  - `/forecast`

Refer to the source code and inline comments for detailed API usage.

## Notes
- **Firebase:**
  Due to how firebase api tokens have a time limit on them it may be required to regenerate the firebase api token, and as such it may not match directly up to what the github contains.

- **Security:**  
  Do not hard-code sensitive credentials in production. Use environment variables or a secure secrets manager.

- **Development vs. Production:**  
  The provided configurations are for development. For production, consider using HTTPS, proper error handling, logging, and scaling strategies.

## License

This project is licensed under the [MIT License](LICENSE).

>>>>>>> 8ac752a (Upgraded Changes and refactored code)
