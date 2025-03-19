document.getElementById('startQuiz').addEventListener('click', async function () {
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('quizContainer').classList.remove('hidden');

    startLoadingAnimation();

    await fetchTriviaQuestion();
});

const loadingMessages = [
    "Thinking of a challenging question",
    "Gathering trivia knowledge",
    "Crafting an exciting question for you",
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

async function fetchTriviaQuestion(retries = 3) {
    const response = await fetch('/api/trivia');
    const data = await response.json();

    if (data.error) {
        if (retries > 0) {
            console.log("Error fetching question. Retrying...");
            await new Promise(resolve => setTimeout(resolve, 3000));
            return fetchTriviaQuestion(retries - 1);
        } else {
            console.error("Failed to fetch trivia question after multiple attempts.");
            document.getElementById('questionText').innerHTML = "Still preparing your question... Hang tight!";
            return;
        }
    }

    clearInterval(loadingInterval);
    clearInterval(dotInterval);
    document.getElementById('questionText').innerHTML = data.question;

    let optionsHTML = "";
    data.options.forEach(option => {
        optionsHTML += `<button class="option" onclick="checkAnswer(this, '${option.trim()}', '${data.correctAnswer.trim()}')">${option}</button>`;
    });

    document.getElementById('optionsContainer').innerHTML = optionsHTML;
}

function checkAnswer(selectedOption, chosenAnswer, correctAnswer) {
    const allOptions = document.querySelectorAll('.option');

    allOptions.forEach(option => {
        option.disabled = true;
    });

    const checkSVG = `<svg class="svg-icon" fill="white" viewBox="0 0 24 24"><path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z"/></svg>`;
    const crossSVG = `<svg class="svg-icon" fill="white" viewBox="0 0 24 24"><path d="M18.3 5.7l-1.4-1.4-5.6 5.6-5.6-5.6-1.4 1.4 5.6 5.6-5.6 5.6 1.4 1.4 5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z"/></svg>`;

    if (chosenAnswer === correctAnswer) {
        selectedOption.classList.add('correct');
        selectedOption.innerHTML += checkSVG;
    } else {
        selectedOption.classList.add('wrong');
        selectedOption.innerHTML += crossSVG;

        allOptions.forEach(option => {
            if (option.innerText.trim() === correctAnswer) {
                option.classList.add('correct');
                option.innerHTML += checkSVG;
            }
        });
    }
}
