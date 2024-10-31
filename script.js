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
// const gaugeFill = document.getElementById('gaugeFill'); // Plus nécessaire
// const oxygenFill = document.getElementById('oxygenFill'); // Plus nécessaire

// Sélection du canvas pour la jauge d'oxygène
const oxygenCanvas = document.getElementById('oxygenCanvas');
const ctx = oxygenCanvas.getContext('2d');

// Sélection du son de bip
const beepSound = document.getElementById('beepSound');

// Autres sélections...

let currentStreak = 0;
const requiredStreak = 7;
let score = 0;
let targetNumber = 0;

// Variables pour la jauge d'oxygène
let oxygenLevel = 60; // Temps en secondes (1 minute)
const totalOxygenTime = 60; // Durée totale en secondes

let oxygenInterval; // Pour stocker l'intervalle de déplétion

// Fonction pour dessiner la jauge d'oxygène
function drawOxygenGauge() {
    const remainingTimeRatio = oxygenLevel / totalOxygenTime;

    // Effacer le canvas
    ctx.clearRect(0, 0, oxygenCanvas.width, oxygenCanvas.height);

    // Définir les couleurs
    let color = '#ffffff'; // Blanc par défaut
    if (oxygenLevel <= 10) {
        color = '#ff0000'; // Rouge si <= 10 secondes
    }

    // Dessiner le fond du cercle (gris clair)
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

    // Ajouter du texte pour le temps restant
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${oxygenLevel}s`, oxygenCanvas.width / 2, oxygenCanvas.height / 2);
}

// Fonction pour démarrer la déplétion de l'oxygène
function startOxygenDepletion() {
    oxygenLevel = totalOxygenTime; // Réinitialiser à 60 secondes
    drawOxygenGauge(); // Dessiner la jauge initiale

    oxygenInterval = setInterval(() => {
        oxygenLevel--;
        if (oxygenLevel < 0) oxygenLevel = 0;
        drawOxygenGauge();
        updateOxygenGauge(); // Pour gérer la fin du jeu

        // Gérer les bips sonores
        handleBeepSounds();
    }, 1000); // Décrémenter chaque seconde
}

// Fonction pour gérer les bips sonores
function handleBeepSounds() {
    if (oxygenLevel > 10) {
        if (oxygenLevel % 10 === 0) {
            beepSound.play();
        }
    } else if (oxygenLevel <= 10 && oxygenLevel > 0) {
        // Jouer le bip chaque seconde
        beepSound.play();
    }
}

// Fonction pour arrêter la déplétion de l'oxygène
function stopOxygenDepletion() {
    clearInterval(oxygenInterval);
}

// Fonction pour mettre à jour la jauge d'oxygène
function updateOxygenGauge() {
    // Vérifier si l'oxygène est épuisé
    if (oxygenLevel <= 0) {
        endGame(false); // Passer un paramètre pour indiquer l'échec
    }
}

// Fonction pour terminer le jeu
function endGame(victory = false) {
    // Arrêter la déplétion de l'oxygène
    stopOxygenDepletion();

    // Arrêter les sons en cours
    spaceshipSound.pause();
    lowOxygenSound.pause();
    beepSound.pause();

    if(victory) {
        messageBox.textContent = `Mission Accomplie ! Tu as atteint ${requiredStreak} bonnes réponses consécutives 🎉`;
        messageBox.style.color = "#00ff99";

        // Faire apparaître la station spatiale
        const spaceStation = document.getElementById('spaceStation');
        spaceStation.style.display = 'block';

        // Jouer le son final
        const finalSound = new Audio('sounds/final.mp3');
        finalSound.play();

        // Déplacer le personnage vers la station
        moveCharacterToStation(spaceStation);

        // Après un délai, afficher la fenêtre modale pour le score
        setTimeout(() => {
            modal.style.display = "block";
        }, 5000); // 5 secondes pour laisser le temps à l'animation
    } else {
        messageBox.textContent = `Mission Terminée ! Ton score est de ${score} points ⭐`;
        messageBox.style.color = "#ff5722";
        // Afficher la fenêtre modale pour entrer le nom
        modal.style.display = "block";
    }
}

// Fonction pour déplacer le personnage vers la station
function moveCharacterToStation(spaceStation) {
    // Obtenir les positions du personnage et de la station
    const characterRect = character.getBoundingClientRect();
    const stationRect = spaceStation.getBoundingClientRect();

    // Calculer la distance à parcourir
    const deltaX = stationRect.left - characterRect.left;
    const deltaY = stationRect.top - characterRect.top;

    // Appliquer une transition au personnage
    character.style.transition = "transform 5s linear";
    character.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.5)`;
}

// Autres fonctions existantes...

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
