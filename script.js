// script.js

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
const spaceshipSound = document.getElementById('spaceshipSound');
const jetpackSound = document.getElementById('jetpackSound');
const scoreDisplay = document.getElementById('score');
const gaugeFill = document.getElementById('gaugeFill');

const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const saveScoreButton = document.getElementById('saveScore');
const playerNameInput = document.getElementById('playerName');

const highScoresDiv = document.getElementById('highScores');
const highScoresBody = document.getElementById('highScoresBody');
const closeHighScoresButton = document.getElementById('closeHighScores');

let currentQuestion = 0;
let score = 0;
let selectedDoor = null;
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

// Fonction pour générer 3 opérateurs uniques
function getUniqueOperators() {
    const operators = ['+', '-', '*', '/'];
    // Shuffle les opérateurs
    for (let i = operators.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [operators[i], operators[j]] = [operators[j], operators[i]];
    }
    return operators.slice(0, 3);
}

// Fonction pour générer des questions pour chaque porte
function generateQuestions() {
    const selectedOperators = getUniqueOperators();
    doors.forEach((door, index) => {
        const operator = selectedOperators[index];
        let num1 = Math.floor(Math.random() * (10 * difficulty)) + 1;
        let num2 = Math.floor(Math.random() * (10 * difficulty)) + 1;

        if (operator === '/' && num2 === 0) num2 = 1; // Éviter la division par zéro
        if (operator === '/' && num1 % num2 !== 0) {
            num1 = num1 * num2;
        }

        let answer = calculateAnswer(num1, num2, operator);
        let question = `${num1} ${operator} ${num2}`;

        const questionText = door.querySelector('.question-text');
        questionText.textContent = question;
        door.dataset.answer = answer;
        door.dataset.operator = operator;
    });

    // Déplacer le personnage aléatoirement devant une porte
    const newSelectedDoor = Math.floor(Math.random() * doors.length);
    selectDoor(newSelectedDoor);
}

// Fonction pour sélectionner une porte
function selectDoor(doorIndex) {
    if (selectedDoor !== null && selectedDoor !== doorIndex) {
        // Jouer le son du jetpack lorsqu'on change de porte
        jetpackSound.currentTime = 0;
        jetpackSound.play();
    }

    selectedDoor = doorIndex;
    moveCharacterTo(doorIndex);
    // Mettre en évidence la porte sélectionnée
    doors.forEach((door, index) => {
        if (index === doorIndex) {
            door.style.border = '2px solid #00FF00'; // Bordure verte pour la porte sélectionnée
        } else {
            door.style.border = '2px solid #ffffff'; // Bordure blanche pour les autres portes
        }
    });
}

// Fonction pour démarrer le jeu
function startGame() {
    currentQuestion = 0;
    score = 0;
    difficulty = 1;
    scoreDisplay.textContent = score;
    updateGauge();
    nextRound();
    startButton.style.display = "none";
    submitButton.style.display = "inline";
    answerInput.style.display = "inline";
    answerInput.value = "";
    answerInput.focus();
    messageBox.textContent = "";
    character.style.left = "50%";
    selectedDoor = null;
    // Réinitialiser les portes
    doors.forEach(door => {
        door.style.border = '2px solid #ffffff';
        door.classList.remove('open', 'rotate');
    });
    // Démarrer le son d'ambiance
    spaceshipSound.volume = 0.2; // Faible volume
    spaceshipSound.play();
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
    selectedDoor = null;
    // Réinitialiser les styles des portes
    doors.forEach(door => {
        door.style.border = '2px solid #ffffff';
        door.classList.remove('open', 'rotate');
    });
}

// Fonction pour vérifier la réponse
function checkAnswer() {
    if (selectedDoor === null) {
        messageBox.textContent = "Veuillez sélectionner une porte.";
        messageBox.style.color = "#FF5733";
        return;
    }

    const userAnswer = parseInt(answerInput.value, 10);

    if (isNaN(userAnswer)) {
        messageBox.textContent = "Veuillez entrer un nombre valide.";
        messageBox.style.color = "#FF5733";
        return;
    }

    const door = doors[selectedDoor];
    const correctAnswer = parseInt(door.dataset.answer, 10);

    if (userAnswer === correctAnswer) {
        currentQuestion++;
        // Attribuer des points selon l'opération
        let points = 0;
        const operator = door.dataset.operator;
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
        // Animer la rotation de la porte
        door.classList.add('rotate');

        // Mettre à jour la jauge
        updateGauge();

        // Augmenter la difficulté progressivement
        if (currentQuestion % 3 === 0 && difficulty < 5) { // Limite de difficulté pour éviter des nombres trop grands
            difficulty++;
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
    // Arrêter le son d'ambiance
    spaceshipSound.pause();
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

// Fonction pour mettre à jour la jauge verticale
function updateGauge() {
    const progress = (currentQuestion / maxQuestions) * 100;
    gaugeFill.style.height = `${progress}%`;
}

// Génération des étoiles pour le fond étoilé
function generateStars() {
    const starfield = document.querySelector('.starfield');
    const numberOfStars = 150; // Ajustez ce nombre selon vos préférences

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Taille des étoiles (plus petite pour les étoiles lointaines)
        const size = Math.random() * 2 + 1; // Taille entre 1px et 3px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Position aléatoire
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;

        // Animation
        const animationDuration = Math.random() * 50 + 50; // Durée entre 50s et 100s
        star.style.animationDuration = `${animationDuration}s`;

        // Différencier les étoiles en fonction de leur taille
        if (size > 2) {
            star.style.background = '#ffffff';
            star.style.animationName = 'twinkle';
            star.style.animationDuration = `${animationDuration}s`;
        } else {
            star.style.background = '#aaaaaa';
            star.style.animationName = 'twinkle';
            star.style.animationDuration = `${animationDuration + 20}s`; // Plus lent pour les petites étoiles
        }

        // Ajouter une classe spéciale pour certaines étoiles proches
        if (Math.random() < 0.05) { // 5% des étoiles seront des étoiles proches
            star.classList.add('fast-star');
            star.style.animation = `twinkle ${animationDuration / 2}s infinite, moveStar ${animationDuration / 2}s linear forwards`;
        }

        starfield.appendChild(star);
    }
}

// Fonction pour initialiser le fond étoilé
function initStarfield() {
    generateStars();
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

// Enregistrer le score
saveScoreButton.addEventListener('click', saveScore);

// Gestion de l'affichage du tableau des scores
closeHighScoresButton.addEventListener('click', closeHighScores);

// Permettre de cliquer sur une porte pour sélectionner la réponse
doors.forEach((door, index) => {
    door.addEventListener('click', () => {
        // Sélectionner la porte cliquée
        selectDoor(index);
        // Ne pas remplir automatiquement la réponse
        // Laisser l'utilisateur saisir la réponse
    });
});

// Fonction pour afficher les scores au chargement (optionnel)
function loadHighScores() {
    // Vous pouvez appeler cette fonction si vous voulez afficher les scores au début
}

// Animation pour les étoiles proches
@keyframes moveStar {
    0% { transform: translate(0, 0); }
    100% { transform: translate(200px, -200px); } /* Ajustez selon l'effet désiré */
}

// Initialiser le fond étoilé au chargement de la fenêtre
window.onload = () => {
    loadHighScores();
    initStarfield();
};
