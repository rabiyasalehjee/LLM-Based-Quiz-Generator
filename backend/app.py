import webbrowser
import threading
import time
import subprocess
import json
import re
import os
import logging
from flask import Flask, jsonify, send_file, session

app = Flask(__name__)
app.secret_key = os.urandom(24) 

FRONTEND_PATH = r"D:\Trivia Game\frontend\index.html"

logging.basicConfig(filename="llm.log", level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def extract_json(response_text):
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
    
    for attempt in range(3):
        try:
            response = subprocess.run(command, capture_output=True, text=True, encoding='utf-8', check=False, timeout=120)
            
            if response.returncode == 0:
                logging.info("LLM Response received successfully.")
                extracted_data = extract_json(response.stdout.strip())
                if extracted_data:
                    logging.info(f"Extracted Trivia JSON: {extracted_data}")
                    return extracted_data
                else:
                    logging.warning(f"Attempt {attempt + 1}: Invalid JSON, retrying...")
            else:
                logging.error(f"LLM execution failed with error: {response.stderr.strip()}")
        except Exception as e:
            logging.error(f"Exception occurred while running LLM: {str(e)}")
        
        time.sleep(2)  

    logging.error("All attempts failed. Returning fallback question.")
    return {
        "question": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "correctAnswer": "Paris"
    }

@app.route('/api/trivia', methods=['GET'])
def trivia():
    if 'question_count' not in session:
        session['question_count'] = 0
        session['score'] = 0

    logging.info(f"Current Question Count: {session['question_count']}")

    if session['question_count'] >= 5:
        logging.info("Quiz completed. Sending final score.")
        return jsonify({"end": True, "score": session['score']})

    logging.info("Fetching new trivia question...")
    question = get_trivia_question()
    if question:
        session['question_count'] += 1
        session.modified = True
        logging.info(f"New question generated. Total questions asked: {session['question_count']}")
        return jsonify(question)

    logging.error("Failed to fetch trivia question.")
    return jsonify({"error": "Failed to fetch question"}), 500

@app.route('/api/answer/<chosen>/<correct>', methods=['GET'])
def answer(chosen, correct):
    if 'score' not in session:
        session['score'] = 0

    correct_choice = chosen == correct
    if correct_choice:
        session['score'] += 1

    session.modified = True
    logging.info(f"User answered: {chosen} | Correct: {correct_choice} | Score: {session['score']}")
    return jsonify({"correct": correct_choice, "score": session['score']})

@app.route('/api/restart', methods=['GET'])
def restart_quiz():
    session['question_count'] = 0
    session['score'] = 0
    session.modified = True
    logging.info("Quiz restarted.")
    return jsonify({"message": "Quiz restarted."})

@app.route('/')
def serve_frontend():
    if os.path.exists(FRONTEND_PATH):
        return send_file(FRONTEND_PATH)
    logging.error("Frontend HTML file not found.")
    return "Frontend not found!", 404

def open_browser():
    time.sleep(2)  
    logging.info("Opening browser for frontend.")
    webbrowser.open("http://127.0.0.1:5000")

if __name__ == '__main__':
    logging.info("Starting Flask server...")
    threading.Thread(target=open_browser).start()
    app.run(debug=True)