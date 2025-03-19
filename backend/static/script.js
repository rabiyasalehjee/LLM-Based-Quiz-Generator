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
        optionsHTML += `<button class="option">${option}</button>`;
    });

    document.getElementById('optionsContainer').innerHTML = optionsHTML;
});
