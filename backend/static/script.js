document.getElementById('startQuiz').addEventListener('click', async function () {
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('quizContainer').classList.remove('hidden');
    startLoadingAnimation();
    await fetchTriviaQuestion();
});

document.getElementById('nextQuestion').addEventListener('click', async function () {
    console.log("Next question button clicked. Fetching new question...");
    resetUI();
    startLoadingAnimation();
    await fetchTriviaQuestion();
});

document.getElementById('skipQuestion').addEventListener('click', async function () {
    console.log("Skip question button clicked. Fetching new question...");
    resetUI();
    startLoadingAnimation();
    await fetchTriviaQuestion();
});

const loadingMessages = [
    "Thinking of a challenging question",
    "Gathering trivia knowledge",
    "Crafting an exciting question",
    "Analyzing historical facts",
    "Digging deep into the trivia archives",
    "Formulating an interesting question",
    "Picking the best question for you"
];

let loadingInterval, dotInterval;
let index = 0;
let dots = "";

function startLoadingAnimation() {
    document.getElementById('questionText').innerHTML = `Loading question<span class="loading-dots">...</span>`;

    dotInterval = setInterval(() => {
        dots = dots.length < 3 ? dots + "." : "";
        document.querySelector(".loading-dots").innerHTML = dots;
    }, 500);

    loadingInterval = setInterval(() => {
        document.getElementById('questionText').innerHTML = `${loadingMessages[index]} <span class="loading-dots">${dots}</span>`;
        index = (index + 1) % loadingMessages.length;
    }, 8000);
}

async function fetchTriviaQuestion() {
    console.log("Fetching a new trivia question from API...");
    const response = await fetch('/api/trivia');
    const data = await response.json();

    if (data.end) {
        document.getElementById('quizContainer').innerHTML = `<h2>Your Score: ${data.score} / 5</h2>`;
        return;
    }

    if (data.error) {
        console.log("Error fetching question, retrying...");
        document.getElementById('questionText').innerHTML = "Still preparing your question... Hang tight!";
        return;
    }

    clearInterval(loadingInterval);
    clearInterval(dotInterval);
    document.getElementById('questionText').innerHTML = data.question;

    let optionsHTML = "";
    data.options.forEach(option => {
        optionsHTML += `<button class="option" onclick="checkAnswer(this, '${option.trim()}', '${data.correctAnswer.trim()}')">${option}</button>`;
    });

    document.getElementById('optionsContainer').innerHTML = optionsHTML;
    document.getElementById('nextQuestion').classList.add('hidden');
    document.getElementById('skipQuestion').classList.remove('hidden');
}

async function checkAnswer(selectedOption, chosenAnswer, correctAnswer) {
    const allOptions = document.querySelectorAll('.option');

    allOptions.forEach(option => {
        option.disabled = true;
    });

    const response = await fetch(`/api/answer/${chosenAnswer}/${correctAnswer}`);
    const result = await response.json();

    if (result.correct) {
        selectedOption.classList.add('correct');
    } else {
        selectedOption.classList.add('wrong');
        allOptions.forEach(option => {
            if (option.innerText.trim() === correctAnswer) {
                option.classList.add('correct');
            }
        });
    }

    if (result.score === 5) {
        document.getElementById('nextQuestion').classList.add('hidden');
        document.getElementById('skipQuestion').classList.add('hidden');
        document.getElementById('quizContainer').innerHTML += `<button id="showResults">🏆 Show Results</button>`;
        document.getElementById('showResults').addEventListener('click', () => {
            document.getElementById('quizContainer').innerHTML = `<h2>Your Score: ${result.score} / 5</h2>`;
        });
    } else {
        document.getElementById('nextQuestion').classList.remove('hidden');
        document.getElementById('skipQuestion').classList.add('hidden');
    }
}

function resetUI() {
    document.getElementById('questionText').innerHTML = "Loading question...";
    document.getElementById('optionsContainer').innerHTML = "";
    document.getElementById('nextQuestion').classList.add('hidden');
    document.getElementById('skipQuestion').classList.add('hidden');
}
