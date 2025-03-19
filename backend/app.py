import webbrowser
import threading
import time
import subprocess
import json
import re
import os
from flask import Flask, jsonify, send_file

app = Flask(__name__)

FRONTEND_PATH = r"D:\Trivia Game\frontend\index.html"

def extract_json(response_text):
    """Extracts JSON from LLM response."""
    match = re.search(r'\{.*\}', response_text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None
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
    command = ["ollama", "run", "deepseek-r1:1.5b", prompt]
    response = subprocess.run(command, capture_output=True, text=True, encoding='utf-8', check=False)

    if response.returncode == 0:
        return extract_json(response.stdout.strip())
    return None

@app.route('/api/trivia', methods=['GET'])
def trivia():
    """API endpoint to return a trivia question."""
    question = get_trivia_question()
    if question:
        return jsonify(question)
    return jsonify({"error": "Failed to fetch question"}), 500

@app.route('/')
def serve_frontend():
    """Serve the frontend HTML file from D:\Trivia Game\frontend"""
    if os.path.exists(FRONTEND_PATH):
        return send_file(FRONTEND_PATH)
    return "Frontend not found!", 404

def open_browser():
    """Wait for Flask to start, then open the frontend in a browser."""
    time.sleep(2)  
    webbrowser.open("http://127.0.0.1:5000")

if __name__ == '__main__':
    threading.Thread(target=open_browser).start()
    app.run(debug=True)
