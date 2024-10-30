// Questions et réponses
const questions = [
    { question: "5 + 3 ?", answer: 8 },
    { question: "12 ÷ 4 ?", answer: 3 },
    { question: "7 - 2 ?", answer: 5 }
];

let currentQuestion = 0;

// Sélection des éléments
const questionText = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitButton = document.getElementById('submit');
const messageBox = document.getElementById('message');
const paths = document.querySelectorAll('.path');

// Fonction pour vérifier la réponse
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (userAnswer === questions[currentQuestion].answer) {
        // Affiche le chemin suivant
        if (currentQuestion < paths.length) {
            paths[currentQuestion].classList.remove('hidden');
            paths[currentQuestion].classList.add('visible');
        }
        currentQuestion++;
        if (currentQuestion < questions.length) {
            questionText.textContent = questions[currentQuestion].question;
            messageBox.textContent = "Bonne réponse, continuez !";
            messageBox.style.color = "#4CAF50";
        } else {
            questionText.textContent = "Félicitations, vous avez terminé le labyrinthe !";
            messageBox.textContent = "";
        }
    } else {
        messageBox.textContent = "Mauvaise réponse, essayez encore.";
        messageBox.style.color = "#FF5733";
    }
    // Efface la réponse précédente
    answerInput.value = '';
}

// Écouteur d'événements sur le bouton
submitButton.addEventListener('click', checkAnswer);
