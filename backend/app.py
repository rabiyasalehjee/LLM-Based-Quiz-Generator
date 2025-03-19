import logging
import subprocess
import json
import re

logging.basicConfig(filename='llm.log', level=logging.INFO,
                    format='%(asctime)s:%(levelname)s:%(message)s')

def extract_json(response_text):
    try:
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            return json.loads(json_str)  
        else:
            logging.error("No valid JSON found in response.")
            return None
    except json.JSONDecodeError as e:
        logging.error(f"Error decoding JSON: {e}")
        return None

def call_llama_model(prompt):
    try:
        command = ["ollama", "run", "deepseek-r1:1.5b", prompt]  
        logging.info(f"Running command: {command}") 

        response = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding='utf-8',
            check=False  
        )

        if response.returncode != 0:
            logging.error(f"Ollama command failed: {response.stderr.strip()}")
            return None

        return extract_json(response.stdout.strip())

    except Exception as e:
        logging.error(f"Exception occurred: {str(e)}")
        return None

def main():
    """Main function to generate trivia questions."""
    prompt = """
    Generate a trivia question with 4 multiple-choice answers.
    Return ONLY a valid JSON object, with no extra text or explanations.

    Format:
    {
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "correctAnswer": "..."
    }
    """

    logging.info("Starting LLM call with prompt.")
    response = call_llama_model(prompt)

    if response:
        logging.info(f"Clean JSON Response: {response}")
        print(f"Trivia Question:\n{json.dumps(response, indent=2)}")
    else:
        print("Error: Could not generate valid JSON.")

if __name__ == '__main__':
    main()
