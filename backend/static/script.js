document.getElementById('startQuiz').addEventListener('click', async function () {
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('quizContainer').classList.remove('hidden');

    document.getElementById('questionText').innerHTML = `Loading Question<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>`;

    const response = await fetch('/api/trivia');
    const data = await response.json();

    if (data.error) {
        document.getElementById('questionText').innerHTML = "Error loading question.";
        return;
    }

    document.getElementById('questionText').innerHTML = data.question;

    let optionsHTML = "";
    data.options.forEach(option => {
        optionsHTML += `<button class="option" onclick="checkAnswer(this, '${option.trim()}', '${data.correctAnswer.trim()}')">${option}</button>`;
    });

    document.getElementById('optionsContainer').innerHTML = optionsHTML;
});

function checkAnswer(selectedOption, chosenAnswer, correctAnswer) {
    const allOptions = document.querySelectorAll('.option');

    allOptions.forEach(option => option.disabled = true);

    if (chosenAnswer === correctAnswer) {
        selectedOption.classList.add('correct');
        selectedOption.innerHTML += " ✅";
    } else {
        selectedOption.classList.add('wrong');
        selectedOption.innerHTML += " ❌";

        allOptions.forEach(option => {
            if (option.innerText.trim() === correctAnswer) {
                option.classList.add('correct');
                option.innerHTML += " ✅";
            }
        });
    }
}
