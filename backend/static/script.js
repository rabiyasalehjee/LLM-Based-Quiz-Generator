let userAnswers = [];

document.getElementById('startQuiz').addEventListener('click', async function () {
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('quizContainer').classList.remove('hidden');
    userAnswers = [];
    startLoadingAnimation();
    await fetchTriviaQuestion();
});

document.getElementById('nextQuestion').addEventListener('click', async function () {
    resetUI();
    startLoadingAnimation();
    await fetchTriviaQuestion();
});

document.getElementById('skipQuestion').addEventListener('click', async function () {
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
    clearLoadingAnimation();
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

function clearLoadingAnimation() {
    if (dotInterval) clearInterval(dotInterval);
    if (loadingInterval) clearInterval(loadingInterval);
    dotInterval = null;
    loadingInterval = null;
    index = 0;
    dots = "";
}

async function fetchTriviaQuestion() {
    let attempts = 0;
    const maxAttempts = 3;

    startLoadingAnimation();
    while (attempts < maxAttempts) {
        try {
            const response = await fetch('/api/trivia');
            const data = await response.json();

            if (data.end) {
                clearLoadingAnimation();
                showResults(data.score);
                return;
            }

            if (data.error) {
                console.log(`Attempt ${attempts + 1} failed: ${data.error}`);
                attempts++;
                if (attempts === maxAttempts) {
                    clearLoadingAnimation();
                    document.getElementById('questionText').innerHTML = "Failed to load question. Please try restarting.";
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }

            clearLoadingAnimation();
            document.getElementById('questionText').innerHTML = data.question;

            let optionsHTML = "";
            data.options.forEach(option => {
                optionsHTML += `<button class="option" onclick="checkAnswer(this, '${option.trim()}', '${data.correctAnswer.trim()}', '${data.question}')">${option}</button>`;
            });

            document.getElementById('optionsContainer').innerHTML = optionsHTML;
            document.getElementById('nextQuestion').classList.add('hidden');
            document.getElementById('skipQuestion').classList.remove('hidden');
            return;
        } catch (error) {
            console.error(`Fetch error: ${error}`);
            attempts++;
            if (attempts === maxAttempts) {
                clearLoadingAnimation();
                document.getElementById('questionText').innerHTML = "Failed to load question. Please try restarting.";
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

async function checkAnswer(selectedOption, chosenAnswer, correctAnswer, question) {
    const allOptions = document.querySelectorAll('.option');
    allOptions.forEach(option => option.disabled = true);

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

    userAnswers.push({
        question: question,
        userAnswer: chosenAnswer,
        correctAnswer: correctAnswer
    });

    if (result.score === 5) {
        document.getElementById('nextQuestion').classList.add('hidden');
        document.getElementById('skipQuestion').classList.add('hidden');
        document.getElementById('showResults').classList.remove('hidden');
    } else {
        document.getElementById('nextQuestion').classList.remove('hidden');
        document.getElementById('skipQuestion').classList.add('hidden');
    }
}

function showResults(score) {
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('resultsContainer').classList.remove('hidden');
    document.getElementById('finalScore').innerText = `${score} / 5`;

    let resultsHTML = "";
    userAnswers.forEach(answer => {
        resultsHTML += `
            <tr>
                <td>${answer.question}</td>
                <td>${answer.userAnswer}</td>
                <td>${answer.correctAnswer}</td>
            </tr>
        `;
    });
    document.getElementById('resultsBody').innerHTML = resultsHTML;

    document.getElementById('restartQuiz').addEventListener('click', async () => {
        await fetch('/api/restart');
        document.getElementById('resultsContainer').classList.add('hidden');
        document.getElementById('quizContainer').classList.remove('hidden');
        userAnswers = [];
        resetUI();
        await fetchTriviaQuestion();
    }, { once: true });
}

function resetUI() {
    document.getElementById('questionText').innerHTML = "Loading question...";
    document.getElementById('optionsContainer').innerHTML = "";
    document.getElementById('nextQuestion').classList.add('hidden');
    document.getElementById('skipQuestion').classList.add('hidden');
    document.getElementById('showResults').classList.add('hidden');
}