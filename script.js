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

        if (operator === '/' && num2 === 0) num2 = 1; // Éviter la division par zéro
        if (operator === '/' && num1 % num2 !== 0) {
            num1 = num1 * num2;
        }

        let answer = calculateAnswer(num1, num2, operator);
        let question = `${num1} ${operator} ${num2}`;

        door.textContent = question;
        door.dataset.answer = answer;
    });

    // Choisir une porte correcte au hasard
    correctDoor = Math.floor(Math.random() * doors.length);
}

// Fonction pour calculer la réponse sans utiliser eval
function calculateAnswer(num1, num2, operator) {
    switch(operator) {
        case '+':
            return num1 + num2;
        case '-':
            return num1 - num2;
        case '*':
            return num1 * num2;
        case '/':
            return Math.floor(num1 / num2); // Assure un entier
        default:
            return null;
    }
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
    const userAnswer = parseInt(answerInput.value, 10);

    if (isNaN(userAnswer)) {
        messageBox.textContent = "Veuillez entrer un nombre valide.";
        messageBox.style.color = "#FF5733";
        return;
    }

    if (userAnswer === parseInt(doors[correctDoor].dataset.answer, 10)) {
        score++;
        currentQuestion++;
        correctSound.play();
        messageBox.textContent = "Bonne réponse ! Continuez.";
        messageBox.style.color = "#4CAF50";
        moveCharacterTo(correctDoor);

        // Augmenter la difficulté progressivement
        if (currentQuestion % 3 === 0) difficulty++;

        if (currentQuestion >= 10) {
            endGame();
            return;
        }
        nextRound();
    } else {
        // Appliquer l'animation de secousse
        doors.forEach(door => door.classList.add('shake'));
        setTimeout(() => {
            doors.forEach(door => door.classList.remove('shake'));
        }, 500);

        wrongSound.play();
        messageBox.textContent = "Mauvaise réponse, essayez encore.";
        messageBox.style.color = "#FF5733";
    }
}

// Fonction de déplacement du personnage vers la porte correcte
function moveCharacterTo(doorIndex) {
    const door = doors[doorIndex];
    const doorRect = door.getBoundingClientRect();
    const containerRect = door.parentElement.getBoundingClientRect();
    const leftPosition = ((doorRect.left - containerRect.left) + doorRect.width / 2) / containerRect.width * 100;
    character.style.left = `${leftPosition}%`;
}

// Fonction pour terminer le jeu
function endGame() {
    messageBox.textContent = `Félicitations ! Vous avez terminé avec un score de ${score}/10 🎉`;
    submitButton.style.display = "none";
    startButton.style.display = "inline";
    startButton.textContent = "Rejouer";
    answerInput.style.display = "none";

    // Stocker le score
    let highScore = localStorage.getItem('highScore') || 0;
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        messageBox.textContent += ` Nouveau record !`;
    } else {
        messageBox.textContent += ` Record actuel : ${highScore}/10`;
    }
}

// Écouteurs d'événements
submitButton.addEventListener('click', checkAnswer);
startButton.addEventListener('click', startGame);

// Permettre de soumettre la réponse en appuyant sur "Entrée"
answerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

// Optionnel : Permettre de cliquer sur une porte pour sélectionner la réponse
doors.forEach((door, index) => {
    door.addEventListener('click', () => {
        answerInput.value = door.dataset.answer;
        checkAnswer();
    });
});
