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
const scoreDisplay = document.getElementById('score');

const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const saveScoreButton = document.getElementById('saveScore');
const playerNameInput = document.getElementById('playerName');

const highScoresDiv = document.getElementById('highScores');
const highScoresBody = document.getElementById('highScoresBody');
const closeHighScoresButton = document.getElementById('closeHighScores');

let currentQuestion = 0;
let score = 0;
let correctDoor = 0;
let difficulty = 1;
const maxQuestions = 10;

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
        door.dataset.operator = operator; // Stocker l'opérateur pour le score
    });

    // Choisir une porte correcte au hasard
    correctDoor = Math.floor(Math.random() * doors.length);

    // Déplacer le personnage aléatoirement devant une porte
    moveCharacterTo(Math.floor(Math.random() * doors.length));
}

// Fonction pour démarrer le jeu
function startGame() {
    currentQuestion = 0;
    score = 0;
    difficulty = 1;
    scoreDisplay.textContent = score;
    nextRound();
    startButton.style.display = "none";
    submitButton.style.display = "inline";
    answerInput.style.display = "inline";
    answerInput.value = "";
    answerInput.focus();
    messageBox.textContent = "";
    character.style.left = "50%";
}

// Fonction pour le prochain tour de questions
function nextRound() {
    if (currentQuestion >= maxQuestions) {
        endGame();
        return;
    }
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

    const correctAnswer = parseInt(doors[correctDoor].dataset.answer, 10);
    const operator = doors[correctDoor].dataset.operator;

    if (userAnswer === correctAnswer) {
        currentQuestion++;
        // Attribuer des points selon l'opération
        let points = 0;
        switch(operator) {
            case '+':
                points = 2;
                break;
            case '-':
                points = 3;
                break;
            case '*':
                points = 4;
                break;
            case '/':
                points = 6;
                break;
            default:
                points = 0;
        }
        score += points;
        scoreDisplay.textContent = score;
        correctSound.play();
        messageBox.textContent = `Bonne réponse ! +${points} points.`;
        messageBox.style.color = "#4CAF50";
        // Déplacer le personnage devant une nouvelle porte aléatoirement
        moveCharacterTo(Math.floor(Math.random() * doors.length));

        // Augmenter la difficulté progressivement
        if (currentQuestion % 3 === 0) difficulty++;

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

// Fonction de déplacement du personnage vers une porte spécifique
function moveCharacterTo(doorIndex) {
    const door = doors[doorIndex];
    const doorRect = door.getBoundingClientRect();
    const containerRect = door.parentElement.getBoundingClientRect();
    const leftPosition = ((doorRect.left - containerRect.left) + doorRect.width / 2) / containerRect.width * 100;
    character.style.left = `${leftPosition}%`;
}

// Fonction pour terminer le jeu
function endGame() {
    submitButton.style.display = "none";
    answerInput.style.display = "none";
    messageBox.textContent = `Félicitations ! Vous avez terminé avec un score de ${score} points 🎉`;
    // Afficher la fenêtre modale pour entrer le nom
    modal.style.display = "block";
}

// Fonction pour enregistrer le score
function saveScore() {
    const playerName = playerNameInput.value.trim();
    if (playerName === "") {
        alert("Veuillez entrer un nom.");
        return;
    }

    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.push({ name: playerName, score: score });

    // Trier les scores par ordre décroissant
    highScores.sort((a, b) => b.score - a.score);

    // Limiter le tableau à 10 meilleurs scores
    if (highScores.length > 10) {
        highScores.pop();
    }

    localStorage.setItem('highScores', JSON.stringify(highScores));

    // Fermer la modale et afficher le tableau des scores
    modal.style.display = "none";
    displayHighScores();
}

// Fonction pour afficher le tableau des scores
function displayHighScores() {
    highScoresBody.innerHTML = "";
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    highScores.forEach(scoreEntry => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const scoreCell = document.createElement('td');

        nameCell.textContent = scoreEntry.name;
        scoreCell.textContent = scoreEntry.score;

        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        highScoresBody.appendChild(row);
    });

    highScoresDiv.style.display = "block";
}

// Fonction pour fermer le tableau des scores
function closeHighScores() {
    highScoresDiv.style.display = "none";
    // Réinitialiser le jeu
    startButton.style.display = "inline";
    startButton.textContent = "Rejouer";
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

// Gestion de la modale
closeModal.addEventListener('click', () => {
    modal.style.display = "none";
});

saveScoreButton.addEventListener('click', saveScore);

// Gestion de l'affichage du tableau des scores
closeHighScoresButton.addEventListener('click', closeHighScores);

// Permettre de cliquer sur une porte pour sélectionner la réponse
doors.forEach((door, index) => {
    door.addEventListener('click', () => {
        answerInput.value = door.dataset.answer;
        checkAnswer();
    });
});

// Fonction pour afficher les scores au chargement (optionnel)
function loadHighScores() {
    // Vous pouvez appeler cette fonction si vous voulez afficher les scores au début
}

// Appeler la fonction au chargement
window.onload = loadHighScores;
