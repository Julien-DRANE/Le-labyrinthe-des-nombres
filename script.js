// Sélection des éléments
const doors = [
    document.getElementById('question1'),
    document.getElementById('question2'),
    document.getElementById('question3')
];
const answerInput = document.getElementById('answer');
const submitButton = document.getElementById('submit');
const startButton = document.getElementById('start');
const messageBox = document.getElementById('message');
const character = document.getElementById('character');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');

let currentQuestion = 0;
let score = 0;
let correctDoor = 0;
let difficulty = 1;

// Génération aléatoire des questions avec une difficulté croissante
function generateQuestions() {
    const operators = ['+', '-', '*', '/'];
    doors.forEach((door, index) => {
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let num1 = Math.floor(Math.random() * (10 * difficulty)) + 1;
        let num2 = Math.floor(Math.random() * (10 * difficulty)) + 1;

        if (operator === '/' && num1 % num2 !== 0) {
            num1 = num1 * num2;
        }

        let question = `${num1} ${operator} ${num2}`;
        let answer = eval(question);
        if (operator === '/') answer = Math.floor(answer);

        door.textContent = question;
        door.dataset.answer = answer;
    });

    // Choisir une porte correcte au hasard
    correctDoor = Math.floor(Math.random() * doors.length);
}

// Fonction pour démarrer le jeu
function startGame() {
    currentQuestion = 0;
    score = 0;
    difficulty = 1;
    nextRound();
    startButton.style.display = "none";
    submitButton.style.display = "inline";
    answerInput.style.display = "inline";
    messageBox.textContent = "";
    character.style.left = "50%";
}

// Fonction pour le prochain tour de questions
function nextRound() {
    generateQuestions();
    answerInput.value = "";
    answerInput.focus();
}

// Fonction pour vérifier la réponse
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);

    if (userAnswer === parseInt(doors[correctDoor].dataset.answer)) {
        score++;
        currentQuestion++;
        correctSound.play();
        messageBox.textContent = "Bonne réponse ! Continuez.";
        messageBox.style.color = "#4CAF50";
        moveCharacterTo(correctDoor);

        // Augmenter la difficulté progressivement
        if (currentQuestion % 3 === 0) difficulty++;

        if (currentQuestion >= 10) {
            messageBox.textContent = `Félicitations ! Vous avez terminé avec un score de ${score}/10 🎉`;
            submitButton.style.display = "none";
            startButton.style.display = "inline";
            startButton.textContent = "Rejouer";
            answerInput.style.display = "none";
            return;
        }
        nextRound();
    } else {
        wrongSound.play();
        messageBox.textContent = "Mauvaise réponse, essayez encore.";
        messageBox.style.color = "#FF5733";
    }
}

// Fonction de déplacement du personnage vers la porte correcte
function moveCharacterTo(doorIndex) {
    const doorPositions = [20, 50, 80];
    character.style.left = `${doorPositions[doorIndex]}%`;
}

// Écouteurs d'événements
submitButton.addEventListener('click', checkAnswer);
startButton.addEventListener('click', startGame);
