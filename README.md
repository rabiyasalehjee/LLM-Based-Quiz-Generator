📌 Trivia Game - LLM-Based Quiz Generator

An AI-powered quiz generator that uses Ollama's open-source `Large Language Models` to create fun and challenging trivia questions.

![UI Preview](ui-preview.png)

🔧 Installation & Setup

The backend uses Ollama to run DeepSeek-R1 LLM locally.

1. Download & install Ollama

    - Download [Ollama](https://ollama.com/)
    - Follow the instructions to install Ollama on your system.

2. Pull the required model

    `ollama pull deepseek-r1:1.5b`

This downloads the DeepSeek-R1 1.5B model required for trivia generation.

3. (Optional) Create a virtual environment

    `python -m venv env`

4. Install dependencies

    `pip install -r requirements.txt`

5. Start the backend server

    `python backend/app.py`