// script.js

/* -------------------- Sélection des Éléments DOM -------------------- */

// Portails de réponses
const portals = [
    document.getElementById('portal1'),
    document.getElementById('portal2'),
    document.getElementById('portal3')
];

// Affichage du nombre cible
const targetNumberDisplay = document.getElementById('targetNumber');

// Bouton de démarrage du jeu
const startButton = document.getElementById('start');

// Boîte de message pour les feedbacks
const messageBox = document.getElementById('message');

// Personnage astronaut
const character = document.getElementById('character');

// Sons du jeu
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const spaceshipSound = document.getElementById('spaceshipSound');
const jetpackSound = document.getElementById('jetpackSound');
const lowOxygenSound = document.getElementById('lowOxygenSound');
const beepSound = document.getElementById('beepSound');
const comSound = document.getElementById('comSound');
const finalSound = document.getElementById('finalSound');
const gameOverSound = document.getElementById('gameOverSound');

// Barre de progression
const progressFill = document.getElementById('progressFill');

// Canvas pour la jauge d'oxygène
const oxygenCanvas = document.getElementById('oxygenCanvas');
const ctx = oxygenCanvas.getContext('2d');

// Modale pour entrer le nom du joueur
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const saveScoreButton = document.getElementById('saveScore');
const playerNameInput = document.getElementById('playerName');

// Tableau des meilleurs scores
const highScoresDiv = document.getElementById('highScores');
const highScoresBody = document.getElementById('highScoresBody');
const closeHighScoresButton = document.getElementById('closeHighScores');

// Station spatiale (séquence de victoire)
const spaceStation = document.getElementById('spaceStation');

// Section Game Over
const gameOverDiv = document.getElementById('gameOver');
const gameOverImage = gameOverDiv.querySelector('.game-over-image');
const gameOverText = gameOverDiv.querySelector('h2');

// Variables de jeu
let currentStreak = 0;
const requiredStreak = 7; // Nombre de bonnes réponses consécutives requises pour gagner
let score = 60.0; // Initialisé à 60 secondes
let targetNumber = 0;

// Variables pour la jauge d'oxygène
let oxygenLevel = 60; // Temps en secondes (1 minute)
const totalOxygenTime = 60; // Durée totale en secondes

let oxygenInterval; // Interval pour la déplétion de l'oxygène
let comSoundTimeout; // Timeout pour le son com.mp3

/* -------------------- Fonctions Principales -------------------- */

/**
 * Fonction pour dessiner la jauge d'oxygène sur le canvas
 */
function drawOxygenGauge() {
    const remainingTimeRatio = oxygenLevel / totalOxygenTime;

    // Effacer le canvas
    ctx.clearRect(0, 0, oxygenCanvas.width, oxygenCanvas.height);

    // Définir la couleur de la jauge
    let color = '#ffffff'; // Blanc par défaut
    if (oxygenLevel <= 10) {
        color = '#ff0000'; // Rouge si <= 10 secondes
    }

    // Dessiner le fond du cercle (gris foncé)
    ctx.beginPath();
    ctx.arc(oxygenCanvas.width / 2, oxygenCanvas.height / 2, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();

    // Dessiner le secteur représentant l'oxygène restant
    ctx.beginPath();
    ctx.moveTo(oxygenCanvas.width / 2, oxygenCanvas.height / 2);
    ctx.arc(
        oxygenCanvas.width / 2,
        oxygenCanvas.height / 2,
        40,
        -Math.PI / 2,
        -Math.PI / 2 + 2 * Math.PI * remainingTimeRatio,
        false
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Ajouter du texte 'O₂' au centre
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('O₂', oxygenCanvas.width / 2, oxygenCanvas.height / 2);
}

/**
 * Fonction pour démarrer la déplétion de l'oxygène
 */
function startOxygenDepletion() {
    oxygenLevel = totalOxygenTime; // Réinitialiser à 60 secondes
    drawOxygenGauge(); // Dessiner la jauge initiale

    oxygenInterval = setInterval(() => {
        oxygenLevel -= 0.1; // Décrémenter au dixième de seconde
        if (oxygenLevel < 0) oxygenLevel = 0;
        drawOxygenGauge();
        updateOxygenGauge(); // Pour gérer la fin du jeu

        // Gérer les bips sonores
        handleBeepSounds();

        // Mettre à jour le score (60 - temps restant)
        score = (60 - oxygenLevel).toFixed(1);
        document.getElementById('score').textContent = score;
    }, 100); // Décrémenter chaque 0.1 seconde
}

/**
 * Fonction pour gérer les bips sonores de l'oxygène
 */
function handleBeepSounds() {
    if (oxygenLevel > 10) {
        if (Math.floor(oxygenLevel) % 10 === 0 && oxygenLevel % 1 === 0) {
            beepSound.play();
        }
    } else if (oxygenLevel <= 10 && oxygenLevel > 0) {
        // Jouer le bip chaque seconde
        if (Math.floor(oxygenLevel) === oxygenLevel) {
            beepSound.play();
        }
    }
}

/**
 * Fonction pour arrêter la déplétion de l'oxygène
 */
function stopOxygenDepletion() {
    clearInterval(oxygenInterval);
    clearTimeout(comSoundTimeout);
}

/**
 * Fonction pour mettre à jour la jauge d'oxygène
 */
function updateOxygenGauge() {
    // Vérifier si l'oxygène est épuisé
    if (oxygenLevel <= 0) {
        endGame(false, true); // Passer un paramètre pour indiquer Game Over
    }
}

/**
 * Fonction pour générer un nombre cible
 */
function generateTargetNumber() {
    // Par exemple, entre 10 et 100
    targetNumber = Math.floor(Math.random() * 91) + 10;
    targetNumberDisplay.textContent = targetNumber;
}

/**
 * Fonction pour générer des propositions de calculs
 */
function generateCalculations() {
    const correctCalculation = generateCorrectCalculation(targetNumber);
    const wrongCalculations = generateWrongCalculations(targetNumber, correctCalculation);
    const allCalculations = [...wrongCalculations, correctCalculation];
    
    // Mélanger les calculs
    for(let i = allCalculations.length -1; i > 0; i--){
        const j = Math.floor(Math.random() * (i +1));
        [allCalculations[i], allCalculations[j]] = [allCalculations[j], allCalculations[i]];
    }

    // Assigner les calculs aux portails
    portals.forEach((portal, index) => {
        portal.querySelector('.calculation').textContent = allCalculations[index].expression;
        portal.dataset.answer = allCalculations[index].result;
        portal.dataset.isCorrect = allCalculations[index].isCorrect; // 'true' ou 'false'
        
        // **Réinitialiser les classes visuelles des portails**
        portal.classList.remove('correct', 'wrong');
    });
}

/**
 * Fonction pour générer un calcul correct
 */
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

/**
 * Fonction pour obtenir les diviseurs d'un nombre
 */
function getDivisors(n) {
    let divisors = [];
    for(let i=1; i<=Math.floor(n/2); i++) {
        if(n % i === 0) divisors.push(i);
    }
    return divisors;
}

/**
 * Fonction pour générer des calculs incorrects
 */
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

/**
 * Fonction pour sélectionner un portail
 */
function selectPortal(portal) {
    const isCorrect = portal.dataset.isCorrect === 'true'; // Correction ici
    const calculation = portal.querySelector('.calculation').textContent;

    if(isCorrect) {
        // Jouer le son correct
        correctSound.play();
        messageBox.textContent = `Bravo ! ${calculation} = ${targetNumber}.`;
        messageBox.style.color = "#00ff99";
        
        // Ajouter la classe pour l'animation de rotation
        portal.classList.add('correct');
        
        // Incrémenter le streak
        currentStreak++;
        updateGauge();

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

        // Dépléter l'oxygène en cas d'erreur
        oxygenLevel -= 15; // Perdre 15% d'oxygène
        if (oxygenLevel < 0) oxygenLevel = 0;
        drawOxygenGauge();
        updateOxygenGauge();

        // Ajouter l'animation de secousse
        portal.classList.add('wrong');
        setTimeout(() => {
            portal.classList.remove('wrong');
        }, 500);
    }
}

/**
 * Fonction pour démarrer le jeu
 */
function startGame() {
    currentStreak = 0; // Réinitialisation du streak
    score = 60.0; // Réinitialiser le score à 60.0
    oxygenLevel = 60; // Réinitialiser l'oxygène à 60 secondes
    document.getElementById('score').textContent = score.toFixed(1);
    updateGauge();
    drawOxygenGauge(); // Mettre à jour la jauge d'oxygène
    startButton.style.display = "none";
    messageBox.textContent = "";
    nextRound();

    // Démarrer le son d'ambiance
    spaceshipSound.volume = 0.2; // Faible volume
    spaceshipSound.play();

    // Démarrer le son com.mp3 après 35 secondes
    comSoundTimeout = setTimeout(() => {
        comSound.play();
    }, 35000); // 35 000 ms = 35 secondes

    // Démarrer la déplétion de l'oxygène
    startOxygenDepletion();
}

/**
 * Fonction pour passer au prochain tour
 */
function nextRound() {
    generateTargetNumber();
    generateCalculations();
    
    // Réinitialiser les animations des portails
    portals.forEach(portal => {
        portal.classList.remove('correct', 'wrong');
    });

    // Réinitialiser le message
    messageBox.textContent = "";
    messageBox.style.color = "#ff5722";
}

/**
 * Fonction pour terminer le jeu
 */
function endGame(victory = false, gameOver = false) {
    // Arrêter la déplétion de l'oxygène
    stopOxygenDepletion();

    // Arrêter les sons en cours
    spaceshipSound.pause();
    lowOxygenSound.pause();
    beepSound.pause();
    comSound.pause();

    if(victory) {
        messageBox.textContent = `Mission Accomplie ! Tu as atteint ${requiredStreak} bonnes réponses consécutives 🎉`;
        messageBox.style.color = "#00ff99";

        // Mettre à jour la barre de progression à 100%
        progressFill.style.width = `100%`;

        // Faire disparaître les portails
        portals.forEach(portal => {
            portal.style.display = 'none';
        });

        // Faire apparaître la station spatiale
        spaceStation.style.display = 'block';
        spaceStation.classList.add('animate-station');

        // Jouer le son final
        finalSound.play();

        // Déplacer le personnage vers la station
        moveCharacterToStation(spaceStation);

        // Après un délai, afficher la fenêtre modale pour le score
        setTimeout(() => {
            modal.style.display = "block";
        }, 5000); // 5 secondes pour laisser le temps à l'animation
    } else if(gameOver) {
        // Afficher la section Game Over
        gameOverDiv.style.display = 'block';

        // Appliquer l'animation de disparition lente à l'image
       //  gameOverImage.style.animation = 'fadeOutShrinkSlow 8s ease forwards';

        // Jouer le son Game Over
        gameOverSound.play();

        // Optionnel : Arrêter tous les sons sauf Game Over
        // Vous pouvez également ajouter des effets supplémentaires ici
    } else {
        messageBox.textContent = `Mission Terminée ! Ton score est de ${score} points ⭐`;
        messageBox.style.color = "#ff5722";
        // Afficher la fenêtre modale pour entrer le nom
        modal.style.display = "block";
    }
}

/**
 * Fonction pour déplacer le personnage vers la station spatiale
 */
function moveCharacterToStation(spaceStation) {
    // Obtenir les positions du personnage et de la station
    const characterRect = character.getBoundingClientRect();
    const stationRect = spaceStation.getBoundingClientRect();
    const gameContainerRect = document.querySelector('.game-container').getBoundingClientRect();

    // Calculer la position relative dans le conteneur du jeu
    const deltaX = stationRect.left - characterRect.left + (stationRect.width / 2) - (characterRect.width / 2);
    const deltaY = stationRect.top - characterRect.top;

    // Appliquer une transition au personnage
    character.style.transition = "transform 5s linear";
    character.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.5)`;
}

/**
 * Fonction pour déplacer le personnage à travers le portail avec animation de réduction
 */
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

/**
 * Fonction pour enregistrer le score
 */
function saveScore() {
    const playerName = playerNameInput.value.trim();
    if(playerName === "") {
        alert("Veuillez entrer un nom.");
        return;
    }

    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.push({ name: playerName, score: parseFloat(score) });

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

/**
 * Fonction pour afficher le tableau des scores
 */
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

/**
 * Fonction pour fermer le tableau des scores
 */
function closeHighScores() {
    highScoresDiv.style.display = "none";
    // Réinitialiser le jeu
    startButton.style.display = "inline";
    startButton.textContent = "Rejouer la Mission";
}

/**
 * Fonction pour mettre à jour la jauge de progression
 */
function updateGauge() {
    const progress = (currentStreak / requiredStreak) * 100;
    progressFill.style.width = `${progress}%`;
}

/**
 * Fonction pour ajouter les écouteurs d'événements aux portails
 */
function addPortalEventListeners() {
    portals.forEach(portal => {
        portal.addEventListener('click', () => {
            selectPortal(portal);
        });
    });
}

/**
 * Fonction pour générer les étoiles du fond étoilé avec effet de zoom continu
 */
function generateStars() {
    const starfield = document.querySelector('.starfield');
    const numberOfStars = window.innerWidth <= 600 ? 150 : 300; // Moins d'étoiles sur mobile

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

/**
 * Fonction pour initialiser le fond étoilé
 */
function initStarfield() {
    generateStars();
}

/**
 * Fonction pour fermer le Game Over
 */
function closeGameOver() {
    gameOverDiv.style.display = 'none';
    // Réinitialiser le jeu
    resetGame();
}

/**
 * Fonction pour réinitialiser le jeu après Game Over
 */
function resetGame() {
    currentStreak = 0;
    score = 60.0;
    oxygenLevel = 60;
    document.getElementById('score').textContent = score.toFixed(1);
    updateGauge();
    drawOxygenGauge();
    messageBox.textContent = "";
    nextRound();

    // Réinitialiser les animations et positions
    spaceStation.style.display = 'none';
    spaceStation.classList.remove('animate-station');
    character.style.transform = "translate(0, 0) scale(1)";
}

/* -------------------- Gestion des Événements -------------------- */

// Écouteurs d'événements
startButton.addEventListener('click', startGame);
saveScoreButton.addEventListener('click', saveScore);
closeHighScoresButton.addEventListener('click', closeHighScores);
closeModal.addEventListener('click', () => {
    modal.style.display = "none";
});

// Écouteur pour fermer la Game Over en cliquant dessus
gameOverDiv.addEventListener('click', closeGameOver);

// Fermer la modale en cliquant en dehors de celle-ci
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
    if (event.target == highScoresDiv) {
        highScoresDiv.style.display = "none";
        // Réinitialiser le jeu
        startButton.style.display = "inline";
        startButton.textContent = "Rejouer la Mission";
    }
});

// Initialisation au chargement de la fenêtre
window.onload = () => {
    initStarfield();
    addPortalEventListeners();
};
