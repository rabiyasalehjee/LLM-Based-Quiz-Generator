import webbrowser
import threading
import time
import subprocess
import json
import re
import os
import logging
from flask import Flask, jsonify, send_file

app = Flask(__name__)

FRONTEND_PATH = r"D:\Trivia Game\frontend\index.html"

logging.basicConfig(filename="llm.log", level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def extract_json(response_text):
    """Extracts JSON from the LLM response."""
    match = re.search(r'\{.*\}', response_text, re.DOTALL)
    if match:
        try:
            logging.info("Extracting JSON from response.")
            return json.loads(match.group(0))
        except json.JSONDecodeError as e:
            logging.error(f"JSON decoding error: {e}")
            return None
    logging.error("No valid JSON found in LLM response.")
    return None

def get_trivia_question():
    """Fetches a trivia question from the LLM."""
    prompt = """
    Generate a trivia question with 4 multiple-choice answers.
    Return ONLY a valid JSON object, with no extra text.

    Format:
    {
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "correctAnswer": "..."
    }
    """

    logging.info("Sending prompt to LLM...")
    
    command = ["ollama", "run", "deepseek-r1:1.5b", prompt]
    
    try:
        response = subprocess.run(command, capture_output=True, text=True, encoding='utf-8', check=False)
        
        if response.returncode == 0:
            logging.info("LLM Response received successfully.")
            extracted_data = extract_json(response.stdout.strip())
            if extracted_data:
                logging.info(f"Extracted Trivia JSON: {extracted_data}")
            return extracted_data
        else:
            logging.error(f"LLM execution failed with error: {response.stderr.strip()}")
    except Exception as e:
        logging.error(f"Exception occurred while running LLM: {str(e)}")
    
    return None

@app.route('/api/trivia', methods=['GET'])
def trivia():
    """API endpoint to return a trivia question."""
    logging.info("Trivia API called. Fetching question...")
    question = get_trivia_question()
    if question:
        logging.info("Trivia question successfully retrieved and sent to frontend.")
        return jsonify(question)
    logging.error("Failed to fetch trivia question.")
    return jsonify({"error": "Failed to fetch question"}), 500

@app.route('/')
def serve_frontend():
    """Serve the frontend HTML file."""
    if os.path.exists(FRONTEND_PATH):
        return send_file(FRONTEND_PATH)
    logging.error("Frontend HTML file not found.")
    return "Frontend not found!", 404

def open_browser():
    """Open the frontend in a browser after a delay."""
    time.sleep(2)  
    logging.info("Opening browser for frontend.")
    webbrowser.open("http://127.0.0.1:5000")

if __name__ == '__main__':
    logging.info("Starting Flask server...")
    threading.Thread(target=open_browser).start()
    app.run(debug=True)
