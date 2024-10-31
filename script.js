// script.js

// Sélection des éléments
const portals = [
    document.getElementById('portal1'),
    document.getElementById('portal2'),
    document.getElementById('portal3')
];
const targetNumberDisplay = document.getElementById('targetNumber');
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

let currentStreak = 0;
const requiredStreak = 7;
let score = 0;
let targetNumber = 0;

// Fonction pour générer un nombre cible
function generateTargetNumber() {
    // Par exemple, entre 10 et 100
    targetNumber = Math.floor(Math.random() * 91) + 10;
    targetNumberDisplay.textContent = targetNumber;
}

// Fonction pour générer des propositions de calculs
function generateCalculations() {
    const correctCalculation = generateCorrectCalculation(targetNumber);
    const wrongCalculations = generateWrongCalculations(targetNumber, correctCalculation);
    const allCalculations = [...wrongCalculations, correctCalculation];
    
    // Shuffle les calculs
    for(let i = allCalculations.length -1; i > 0; i--){
        const j = Math.floor(Math.random() * (i +1));
        [allCalculations[i], allCalculations[j]] = [allCalculations[j], allCalculations[i]];
    }

    // Assigner les calculs aux portails
    portals.forEach((portal, index) => {
        portal.querySelector('.calculation').textContent = allCalculations[index].expression;
        portal.dataset.answer = allCalculations[index].result;
        portal.dataset.isCorrect = allCalculations[index].isCorrect;
    });
}

// Fonction pour générer une calcul correcte
function generateCorrectCalculation(target) {
    // Choisir un opérateur aléatoire parmi +, -, *, /
    const operators = ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, expression, result;

    switch(operator) {
        case '+':
            num1 = Math.floor(Math.random() * (target)) + 1;
            num2 = target - num1;
            expression = `${num1} + ${num2}`;
            result = target;
            break;
        case '-':
            num2 = Math.floor(Math.random() * (target)) + 1;
            num1 = target + num2;
            expression = `${num1} - ${num2}`;
            result = target;
            break;
        case '*':
            // Choisir un diviseur de target
            const divisors = getDivisors(target);
            if (divisors.length < 2) { // target est 1 ou un nombre premier
                // Fallback à addition
                num1 = Math.floor(Math.random() * (target)) + 1;
                num2 = target - num1;
                expression = `${num1} + ${num2}`;
                result = target;
            } else {
                num2 = divisors[Math.floor(Math.random() * (divisors.length -1)) +1]; // exclure 1
                num1 = target / num2;
                expression = `${num1} * ${num2}`;
                result = target;
            }
            break;
        case '/':
            // target doit être le résultat d'une division entière
            num2 = Math.floor(Math.random() * 9) + 1; // éviter num2 =0
            num1 = target * num2;
            expression = `${num1} / ${num2}`;
            result = target;
            break;
        default:
            // Fallback
            num1 = Math.floor(Math.random() * (target)) + 1;
            num2 = target - num1;
            expression = `${num1} + ${num2}`;
            result = target;
    }

    return { expression, result, isCorrect: true };
}

// Fonction pour obtenir les diviseurs d'un nombre
function getDivisors(n) {
    let divisors = [];
    for(let i=1; i<=Math.floor(n/2); i++) {
        if(n % i === 0) divisors.push(i);
    }
    return divisors;
}

// Fonction pour générer des calculs incorrects
function generateWrongCalculations(target, correctCalculation) {
    const wrongCalculations = [];
    const operators = ['+', '-', '*', '/'];

    while(wrongCalculations.length < 2) {
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let num1, num2, expression, result;

        switch(operator) {
            case '+':
                num1 = Math.floor(Math.random() * (target)) + 1;
                num2 = Math.floor(Math.random() * (target)) + 1;
                result = num1 + num2;
                expression = `${num1} + ${num2}`;
                break;
            case '-':
                num1 = Math.floor(Math.random() * (target * 2)) + 1;
                num2 = Math.floor(Math.random() * (num1)) + 1;
                result = num1 - num2;
                expression = `${num1} - ${num2}`;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                result = num1 * num2;
                expression = `${num1} * ${num2}`;
                break;
            case '/':
                num2 = Math.floor(Math.random() * 9) + 1; // éviter num2 =0
                num1 = Math.floor(Math.random() * (target * num2 * 2)) + 1;
                result = Math.floor(num1 / num2);
                expression = `${num1} / ${num2}`;
                break;
            default:
                num1 = Math.floor(Math.random() * (target)) + 1;
                num2 = Math.floor(Math.random() * (target)) + 1;
                result = num1 + num2;
                expression = `${num1} + ${num2}`;
        }

        // Assurer que le calcul incorrect ne soit pas égal à la cible et différent du calcul correct
        if(result !== target && expression !== correctCalculation.expression) {
            wrongCalculations.push({ expression, result, isCorrect: false });
        }
    }

    return wrongCalculations;
}

// Fonction pour sélectionner un portail
function selectPortal(portal) {
    const isCorrect = portal.dataset.isCorrect === 'true';
    const calculation = portal.querySelector('.calculation').textContent;

    if(isCorrect) {
        // Jouer le son correct
        correctSound.play();
        messageBox.textContent = `Bravo ! ${calculation} = ${targetNumber}.`;
        messageBox.style.color = "#00ff99";
        
        // Ajouter la classe pour l'animation de rotation
        portal.classList.add('correct');
        
        // Mettre à jour le score (par exemple, +10 points)
        score += 10;
        scoreDisplay.textContent = score;

        // Incrémenter le streak
        currentStreak++;
        updateGauge();

        // Déplacer le personnage à travers le portail avec animation de réduction
        moveCharacterThroughPortal(portal);
        
        // Vérifier si le streak requis est atteint
        if(currentStreak >= requiredStreak) {
            endGame(true); // Passer un paramètre pour indiquer la victoire
        } else {
            // Générer une nouvelle cible et de nouveaux calculs après un court délai
            setTimeout(() => {
                nextRound();
            }, 1500); // 1.5 secondes pour voir l'animation
        }
    } else {
        // Jouer le son incorrect
        wrongSound.play();
        messageBox.textContent = `Mauvaise réponse, le streak est réinitialisé !`;
        messageBox.style.color = "#ff5722";

        // Réinitialiser le streak
        currentStreak = 0;
        updateGauge();

        // Ajouter l'animation de secousse
        portal.classList.add('wrong');
        setTimeout(() => {
            portal.classList.remove('wrong');
        }, 500);
    }
}

// Fonction pour démarrer le jeu
function startGame() {
    currentStreak = 0; // Réinitialisation du streak
    score = 0;
    scoreDisplay.textContent = score;
    updateGauge();
    startButton.style.display = "none";
    messageBox.textContent = "";
    nextRound();
    // Démarrer le son d'ambiance
    spaceshipSound.volume = 0.2; // Faible volume
    spaceshipSound.play();
}

// Fonction pour passer au prochain tour
function nextRound() {
    generateTargetNumber();
    generateCalculations();
    
    // Réinitialiser les animations des portails
    portals.forEach(portal => {
        portal.classList.remove('correct');
    });

    // Réinitialiser le message
    messageBox.textContent = "";
    messageBox.style.color = "#ff5722";
}

// Fonction pour terminer le jeu
function endGame(victory = false) {
    if(victory) {
        messageBox.textContent = `Mission Accomplie ! Tu as atteint ${requiredStreak} bonnes réponses consécutives 🎉`;
        messageBox.style.color = "#00ff99";
    } else {
        messageBox.textContent = `Mission Terminée ! Ton score est de ${score} points ⭐`;
        messageBox.style.color = "#ff5722";
    }
    // Arrêter le son d'ambiance
    spaceshipSound.pause();
    // Afficher la fenêtre modale pour entrer le nom
    modal.style.display = "block";
}

// Fonction pour enregistrer le score
function saveScore() {
    const playerName = playerNameInput.value.trim();
    if(playerName === "") {
        alert("Veuillez entrer un nom.");
        return;
    }

    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.push({ name: playerName, score: score });

    // Trier les scores par ordre décroissant
    highScores.sort((a, b) => b.score - a.score);

    // Limiter le tableau à 10 meilleurs scores
    if(highScores.length > 10) {
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
    startButton.textContent = "Rejouer la Mission";
}

// Fonction pour mettre à jour la jauge horizontale
function updateGauge() {
    const progress = (currentStreak / requiredStreak) * 100;
    gaugeFill.style.width = `${progress}%`;
}

// Fonction pour déplacer le personnage à travers le portail avec animation de réduction
function moveCharacterThroughPortal(portal) {
    // Ajouter la classe de déplacement
    character.classList.add('travel');

    // Déplacer le personnage
    const isMobile = window.innerWidth <= 600;
    let translateX = 0;
    let translateY = 0;

    if(isMobile) {
        // Sur mobile, déplacer vers le bas
        translateY = 100;
    } else {
        // Sur desktop/tablette, déplacer vers la droite
        translateX = 200;
    }

    // Appliquer la transformation avec translation et réduction de la taille
    character.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.2)`;

    // Après l'animation, réinitialiser la transformation et la taille
    setTimeout(() => {
        character.style.transition = "transform 0.5s ease-in-out";
        character.style.transform = "translate(0, 0) scale(1)";
        character.classList.remove('travel');
    }, 1000); // Durée de l'animation
}

// Fonction pour ajouter les écouteurs d'événements aux portails
function addPortalEventListeners() {
    portals.forEach(portal => {
        portal.addEventListener('click', () => {
            selectPortal(portal);
        });
    });
}

// Génération des étoiles pour le fond étoilé avec zoom continu
function generateStars() {
    const starfield = document.querySelector('.starfield');
    const numberOfStars = 300; // Augmenté pour plus d'étoiles

    for(let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Taille des étoiles (plus petite pour les étoiles lointaines)
        const size = Math.random() * 2 + 1; // Taille entre 1px et 3px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Position aléatoire : couvrant toute la surface
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;

        // Profondeur pour l'effet 3D
        const depth = Math.random() * 1000; // Profondeur entre 0 et 1000px
        star.style.transform = `translateZ(${depth}px)`;

        // Ajouter une classe spéciale pour certaines étoiles rapides
        if(Math.random() < 0.05) { // 5% des étoiles seront des étoiles rapides
            star.classList.add('fast-star');
        }

        // Assignation de délais et durées aléatoires pour éviter les regroupements
        const twinkleDuration = Math.random() * 2 + 3; // 3s à 5s pour twinkle
        const moveDuration = Math.random() * 5 + 5; // 5s à 10s pour moveStar
        const animationDelay = Math.random() * 10; // 0s à 10s de délai

        star.style.animationDuration = `twinkle ${twinkleDuration}s infinite, moveStar ${moveDuration}s linear infinite`;
        star.style.animationDelay = `${animationDelay}s, ${animationDelay}s`; // Même délai pour les deux animations

        starfield.appendChild(star);
    }
}

// Fonction pour initialiser le fond étoilé
function initStarfield() {
    generateStars();
}

// Écouteurs d'événements
startButton.addEventListener('click', startGame);
saveScoreButton.addEventListener('click', saveScore);
closeHighScoresButton.addEventListener('click', closeHighScores);
closeModal.addEventListener('click', () => {
    modal.style.display = "none";
});

// Initialisation au chargement de la fenêtre
window.onload = () => {
    initStarfield();
    addPortalEventListeners();
};
