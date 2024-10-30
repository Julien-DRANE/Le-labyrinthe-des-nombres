// Sélection des éléments
const questionText = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitButton = document.getElementById('submit');
const startButton = document.getElementById('start');
const messageBox = document.getElementById('message');
const character = document.getElementById('character');
const doors = document.getElementById('doors');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');

let currentQuestion = 0;
let difficulty = 1;
let score = 0;

// Génération aléatoire des questions
function generateQuestion() {
    const operators = ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let num1, num2;
    if (difficulty < 3) {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
    } else {
        num1 = Math.floor(Math.random() * 20) + 5;
        num2 = Math.floor(Math.random() * 10) + 1;
    }

    // Éviter les divisions par zéro et les résultats non-entiers
    if (operator === '/') {
        num1 = num1 * num2;
    }

    let question = `${num1} ${operator} ${num2}`;
    let answer = eval(question);
    if (operator === '/') answer = Math.floor(answer);

    return { question, answer };
}

// Fonction pour démarrer le jeu
function startGame() {
    currentQuestion = 0;
    score = 0;
    difficulty = 1;
    nextQuestion();
    startButton.style.display = "none";
    submitButton.style.display = "inline";
    answerInput.style.display = "inline";
    messageBox.textContent = "";
    moveCharacter(0);
}

// Fonction pour poser la prochaine question
function nextQuestion() {
    const { question, answer } = generateQuestion();
    questionText.textContent = `Question ${currentQuestion + 1}: ${question}`;
    answerInput.value = "";
    answerInput.focus();
    questionText.dataset.answer = answer;
}

// Fonction pour vérifier la réponse
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    const correctAnswer = parseInt(questionText.dataset.answer);

    if (userAnswer === correctAnswer) {
        score++;
        currentQuestion++;
        correctSound.play();
        moveCharacter(currentQuestion);
        messageBox.textContent = "Bonne réponse ! Continuez.";
        messageBox.style.color = "#4CAF50";

        // Augmenter la difficulté après quelques questions
        if (currentQuestion % 3 === 0) difficulty++;

        if (currentQuestion >= 10) {
            questionText.textContent = "Félicitations, vous avez terminé le labyrinthe ! 🎉";
            submitButton.style.display = "none";
            startButton.style.display = "inline";
            startButton.textContent = "Rejouer";
            answerInput.style.display = "none";
            messageBox.textContent = `Votre score: ${score}/10`;
            return;
        }
        nextQuestion();
    } else {
        wrongSound.play();
        messageBox.textContent = "Mauvaise réponse, essayez encore.";
        messageBox.style.color = "#FF5733";
    }
}

// Déplacer le personnage
function moveCharacter(position) {
    const doorPositions = ["🚪 🚪 🚪", "🚪 🚪 🚪", "🚪 🚪 🚪"];
    character.style.transform = `translateX(${position * 40}px)`;
    doors.textContent = doorPositions[position % doorPositions.length];
}

// Écouteurs d'événements
submitButton.addEventListener('click', checkAnswer);
startButton.addEventListener('click', startGame);
