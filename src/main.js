import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Caméra
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 20, 100);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls (APRES camera + renderer)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.enablePan = false; // Désactiver le pan (déplacement)
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI; // Permettre une rotation complète (voir le dessous)
controls.update();

// Lumières
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Lumières additionnelles pour éclairer toutes les faces
const light1 = new THREE.PointLight(0xffffff, 0.5);
light1.position.set(50, 50, 50);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 0.5);
light2.position.set(-50, -50, -50);
scene.add(light2);



// Référence au cube central
let cubeMesh = null;
let cubeColorsEnabled = true; // Variable pour tracker si les couleurs sont activées

// Fonction pour créer/mettre à jour le cube central
function createCentralCube(size, useColors = true) {
  // Supprimer l'ancien cube s'il existe
  if (cubeMesh) {
    scene.remove(cubeMesh);
  }
  
  // Adapter la taille du cube en fonction de gridSize
  const baseCubeSize = 50;
  const cubeSize = baseCubeSize + (size - 2) * 15; // Augmente avec la taille de la grille
  
  const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  
  // Créer 6 matériaux (un par face) : avant, arrière, droite, gauche, haut, bas
  const cubeMaterials = useColors ? [
    new THREE.MeshStandardMaterial({ color: 0xe74c3c }), // Z+ rouge vif
    new THREE.MeshStandardMaterial({ color: 0x16a085 }), // Z- vert canard
    new THREE.MeshStandardMaterial({ color: 0x2980b9 }), // X+ bleu profond
    new THREE.MeshStandardMaterial({ color: 0xf1c40f }), // X- jaune éclatant
    new THREE.MeshStandardMaterial({ color: 0x8e44ad }), // Y+ violet saturé
    new THREE.MeshStandardMaterial({ color: 0xdc7633 })  // Y- orange foncé

  ] : [
    new THREE.MeshStandardMaterial({ color: '#b3b4bcff' }), // gris
    new THREE.MeshStandardMaterial({ color: '#b3b4bcff' }),
    new THREE.MeshStandardMaterial({ color: '#b3b4bcff' }),
    new THREE.MeshStandardMaterial({ color: '#b3b4bcff' }),
    new THREE.MeshStandardMaterial({ color: '#b3b4bcff' }),
    new THREE.MeshStandardMaterial({ color: '#b3b4bcff' })
  ];
  
  cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterials);
  cubeMesh.position.set(0, 0, 0);
  cubeMesh.castShadow = true;
  cubeMesh.receiveShadow = true;
  scene.add(cubeMesh);
}

//CARTES
const cardsTab = []; //tableau pour stocker les cartes

// Couleurs pour les paires
const colors = [
    0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf7b731,
    0x5f27cd, 0x00d2d3, 0xff9ff3, 0x54a0ff,
    0x48dbfb, 0xff6348, 0x1dd1a1, 0xfeca57,
    0xee5a6f, 0xc44569, 0x786fa6, 0xf19066,
    0xea8685, 0x596275
];

// Symboles pour créer plus de paires
const symbols = ['★', '♥', '♦', '◆', '●', '■', '▲', '✓', '☆', '◇', '△', '♣', '♠', '◎', '∆', '◈'];

// Fonction pour obtenir la couleur et le symbole d'une paire
function getColorAndSymbol(pairId) {
  const totalColors = colors.length;
  const totalSymbols = symbols.length;
  const colorIndex = pairId % totalColors;
  const symbolIndex = Math.floor(pairId / totalColors) % totalSymbols;
  return {
    color: colors[colorIndex],
    symbol: symbols[symbolIndex],
    colorHex: '#' + colors[colorIndex].toString(16).padStart(6, '0')
  };
}

// Créer une texture Canvas avec texte
function createCardTexture(pairId) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  
  // Obtenir la couleur et le symbole
  const { color, symbol, colorHex } = getColorAndSymbol(pairId);
  
  // Fond coloré
  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Dessiner le symbole au centre en blanc
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, canvas.width / 2, canvas.height / 2);
  
  // Créer une texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

// créer une carte (ne l'ajoute pas au plateau)
function createCard(pairId, width = 8, height = 12, depth = 0.5){
const cardGeometry = new THREE.BoxGeometry(width, height, depth);
const backTexture = createCardTexture(pairId);

const cardMaterial = [
  new THREE.MeshStandardMaterial({ color: 0x34495e }), // côtés
  new THREE.MeshStandardMaterial({ color: 0x34495e }), // côtés
  new THREE.MeshStandardMaterial({ color: 0x2c3e50 }), // côtés
  new THREE.MeshStandardMaterial({ color: 0x34495e }), // côtés
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a }), // face avant - noire unie (visible)
  new THREE.MeshStandardMaterial({ map: backTexture })// face arrière - texture colorée avec symbole (cachée au cube)
];
  const card = new THREE.Mesh(cardGeometry, cardMaterial);
  card.castShadow = true;
  card.receiveShadow = true;
  return card;
}

// Génère un tableau de pairId mélangés (2 de chaque)
function generatePairIds(totalCards) {
  const pairIds = [];

  const totalPairs = totalCards / 2;
  for (let i = 0; i < totalPairs; i++) {
    pairIds.push(i);
    pairIds.push(i);
  }

  //mélanger le tableau 
  for (let i = pairIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairIds[i], pairIds[j]] = [pairIds[j], pairIds[i]];
  }

  return pairIds;
}

// Crée une grille de cartes autour d'un cube et les ajoute à la scène
function createCardsGrid(size = 2) {
  // Retirer toutes les cartes précédentes de la scène
  cardsTab.forEach(card => {
    scene.remove(card.mesh);
  });
  cardsTab.length = 0; // supprimer les cartes précédentes
  const cardsPerFace = size * size;
  const totalCards = cardsPerFace * 6; // 6 faces
  const pairIds = generatePairIds(totalCards);

  // Calculer la taille du cube (doit correspondre à createCentralCube)
  const baseCubeSize = 50;
  const cubeSize = baseCubeSize + (size - 2) * 15;
  const halfCubeSize = cubeSize / 2;

  let cardIndex = 0;
  const cardDepth = 0.5;
  
  // Adapter l'espacement en fonction de la taille du cube et du nombre de cartes
  // Multiplié par 0.65 pour rapprocher les cartes
  const spacing = ((cubeSize - 4) / size);
  
  // Dimensions de chaque face
  const faceWidth = spacing * size;
  const faceHeight = spacing * size;
  const startOffset = -faceWidth / 2 + spacing / 2;
  const heightOffset = -faceHeight / 2 + spacing / 2;

  // Fonction pour créer les cartes sur une face
  function createFaceCards(faceNormal, rotX, rotY, rotZ) {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (cardIndex >= pairIds.length) return;

        const pairId = pairIds[cardIndex];
        const cardMesh = createCard(pairId);

        // Position locale sur la face
        const localX = startOffset + col * spacing;
        const localY = heightOffset + row * spacing;
        const faceDistance = halfCubeSize + cardDepth / 2;

        let posX, posY, posZ;

        // Positionner les cartes directement sur les faces du cube
        if (faceNormal === 'Z+') {
          posX = localX;
          posY = localY;
          posZ = faceDistance;
        } else if (faceNormal === 'Z-') {
          posX = -localX;
          posY = localY;
          posZ = -faceDistance;
        } else if (faceNormal === 'X+') {
          posX = faceDistance;
          posY = localY;
          posZ = localX;
        } else if (faceNormal === 'X-') {
          posX = -faceDistance;
          posY = localY;
          posZ = -localX;
        } else if (faceNormal === 'Y+') {
          posX = localX;
          posY = faceDistance;
          posZ = -localY;
        } else if (faceNormal === 'Y-') {
          posX = localX;
          posY = -faceDistance;
          posZ = localY;
        }

        cardMesh.position.set(posX, posY, posZ);

        // Appliquer la rotation correcte pour chaque face
        cardMesh.rotation.set(rotX, rotY, rotZ);
        // Sauvegarder la rotation initiale en quaternion
        const baseQuaternion = cardMesh.quaternion.clone();
        // Inverser la géométrie pour que la face colorée soit collée au cube
        cardMesh.scale.z = -1;

        scene.add(cardMesh);
        
        // Déterminer l'axe de rotation pour le flip selon la face
        let flipAxis = 'y'; // Par défaut pour les faces verticales
        if (faceNormal === 'Y+' || faceNormal === 'Y-') {
          flipAxis = 'x'; // Pour les faces horizontales
        }
        
        // Déterminer le vecteur de direction du flottement (vers l'extérieur du cube)
        let floatDirectionVec = { x: 0, y: 0, z: 0 };
        if (faceNormal === 'Y+') {
          floatDirectionVec = { x: 0, y: 1, z: 0 };  // Top: vers le haut
        } else if (faceNormal === 'Y-') {
          floatDirectionVec = { x: 0, y: 0, z: -1 }; // Bottom: vers l'arrière pour sortir du cube
        } else if (faceNormal === 'Z+') {
          floatDirectionVec = { x: 0, y: 0, z: 1 };  // Front: vers l'avant
        } else if (faceNormal === 'Z-') {
          floatDirectionVec = { x: 0, y: 0, z: -1 }; // Back: vers l'arrière
        } else if (faceNormal === 'X+') {
          floatDirectionVec = { x: 1, y: 0, z: 0 };  // Right: vers la droite
        } else if (faceNormal === 'X-') {
          floatDirectionVec = { x: -1, y: 0, z: 0 }; // Left: vers la gauche
        }
        
        // Multiplicateur pour inverser la direction pour Y-
        let floatMultiplier = 1;
        if (faceNormal === 'Y-') {
          floatMultiplier = -1; // Inverser la direction pour la face inférieure
        }

        cardsTab.push({
          id: cardIndex,
          pairId,
          mesh: cardMesh,
          isFlipped: false,
          isMatched: false,
          flipAxis: flipAxis,
          floatDirectionVec: floatDirectionVec,
          floatMultiplier: floatMultiplier,
          basePosition: { x: posX, y: posY, z: posZ },
          baseQuaternion: baseQuaternion,
          currentFlipRotation: 0,
          targetFlipRotation: 0,
          isFlipping: false,
          baseY: cardMesh.position.y,
          hoverOffset: 0,
          targetHoverOffset: 0,
          currentScale: 1,
          targetScale: 1,
          isHinting: false,
          hintStartTime: 0
        });

        cardIndex++;
      }
    }
  }

  // Créer les cartes sur les 6 faces du cube avec leurs rotations respectives
  // Pour chaque face, la profondeur des cartes pointe vers la face du cube
  createFaceCards('Z+', 0, 0, 0);                    // Face avant
  createFaceCards('Z-', 0, Math.PI, 0);              // Face arrière
  createFaceCards('X+', 0, Math.PI/2, 0);            // Face droite
  createFaceCards('X-', 0, -Math.PI/2, 0);           // Face gauche
  createFaceCards('Y+', -Math.PI/2, 0, 0);           // Face haut
  createFaceCards('Y-', Math.PI/2, 0, 0);            // Face bas

  console.log('Cartes créées :', cardsTab.length, 'cartesTab :', cardsTab);
}

// Raycaster + coordonnées souris (NDC)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('mousedown', onMouseDown);


function onMouseMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(
    cardsTab.map(c => c.mesh)
  );

  let hoveredMesh = null;
  if (intersects.length > 0) {
    hoveredMesh = intersects[0].object;
  }

  cardsTab.forEach(card => {
    if (card.mesh === hoveredMesh) {
      card.targetHoverOffset = 1.0; // flotte
      card.targetScale = 1.1;       // agrandit
    } else {
      card.targetHoverOffset = 0;
      card.targetScale = 1.0;
    }
  });
}

function onMouseDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(
    cardsTab.map(c => c.mesh)
  );

  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    handleCardClick(clickedMesh); // flip seulement
  }
}


// Variable pour tracker les cartes retournées
let flippedCards = [];
let isCheckingPair = false;

// Variables pour la grille
let gridSize = 2; // Nombre de cartes par face (2x2, 3x3, etc.)

// Variables pour les indices - calculées dynamiquement
let hintsRemaining = 3;
let MAX_HINTS = 3;

// Fonction pour calculer le nombre d'indices (10% du nombre total de cartes)
function calculateMaxHints(size) {
  const cardsPerFace = size * size;
  const totalCards = cardsPerFace * 6; // 6 faces
  return Math.max(1, Math.ceil(totalCards * 0.1)); // Au minimum 1 indice, arrondi vers le haut
}

// Variables pour les modes de difficulté
let limitedMovesMode = false;
let limitedTimeMode = false;
let difficultyBonus = 0;
let grayModeBonus = false; // Bonus si le cube est gris

// Variables pour le score
let score = 0;
let totalScoreAcrossGames = 0; // Score cumulé entre les parties
let moves = 0;
let gameStartTime = 0;
let gameTimerInterval = null;
let BONUS_MOVES = { threshold: 20, points: 5 };
let BONUS_TIME = { threshold: 60, points: 5 };
let usedHintsForPairs = new Set(); // Tracker quelles paires ont utilisé un indice
let lastBonusMovesEarned = false;
let lastBonusTimeEarned = false;

// Éléments de la GUI
const rowsSlider = document.getElementById('grid-size-slider');
const gridSizeValue = document.getElementById('grid-size-value');
const gridSizeValueCopy = document.getElementById('grid-size-value-copy');
const hintBtn = document.getElementById('hint-btn');
const resetBtn = document.getElementById('reset-btn');
const bonusMovesThreshold = document.getElementById('bonus-moves-threshold');
const bonusTimeThreshold = document.getElementById('bonus-time-threshold');

// Éléments du score
const scoreDisplay = document.getElementById('score-display');
const movesDisplay = document.getElementById('moves-display');
const timeDisplay = document.getElementById('time-display');
const hintTimerDisplay = document.getElementById('hint-timer-display');
const movesCondition = document.getElementById('moves-condition');
const timeCondition = document.getElementById('time-condition');

// Éléments du modal
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreDisplay = document.getElementById('final-score-display');
const finalMovesDisplay = document.getElementById('final-moves-display');
const finalTimeDisplay = document.getElementById('final-time-display');
const bonusMovesResult = document.getElementById('bonus-moves-result');
const bonusTimeResult = document.getElementById('bonus-time-result');
const bonusDifficultyResult = document.getElementById('bonus-difficulty-result');
const bonusGrayResult = document.getElementById('bonus-gray-result');
const continueBtn = document.getElementById('continue-btn');
const newGameBtnModal = document.getElementById('new-game-btn');

// Éléments des modes de difficulté
const limitedMovesCheckbox = document.getElementById('limited-moves-checkbox');
const limitedTimeCheckbox = document.getElementById('limited-time-checkbox');
const cubeColorsCheckbox = document.getElementById('cube-colors-checkbox');

// Fonction pour calculer les seuils de bonus en fonction de la taille de la grille
function calculateBonusThresholds(size) {
  const cardsPerFace = size * size;
  const totalPairs = (cardsPerFace * 6) / 2; // 6 faces
  // Coups: 2.5x le nombre de paires
  BONUS_MOVES.threshold = Math.floor(totalPairs * 2.5);
  // Temps: 8 secondes par paire
  BONUS_TIME.threshold = Math.floor(totalPairs * 8);
  // Calculer le nombre d'indices (10% du nombre total de cartes)
  MAX_HINTS = calculateMaxHints(size);
}

// Variable pour empêcher les indices simultanés
let isShowingHint = false;
let hintEndTime = 0; // Pour tracker quand l'indice se termine

// Mettre à jour l'affichage du bouton indice
function updateHintButton() {
  hintBtn.textContent = `Indice (${hintsRemaining}/${MAX_HINTS})`;
  if (hintsRemaining === 0) {
    hintBtn.disabled = true;
    hintBtn.style.opacity = '0.5';
    hintBtn.style.cursor = 'not-allowed';
  } else {
    hintBtn.disabled = false;
    hintBtn.style.opacity = '1';
    hintBtn.style.cursor = 'pointer';
  }
}

// Mettre à jour le score affiché
function updateScoreDisplay() {
  scoreDisplay.textContent = totalScoreAcrossGames;
  movesDisplay.textContent = moves;
  
  // Mettre à jour les conditions de bonus
  const movesPourcent = Math.min(moves, BONUS_MOVES.threshold);
  const timePourcent = Math.min(gameStartTime === 0 ? 0 : Math.floor((Date.now() - gameStartTime) / 1000), BONUS_TIME.threshold);
  
  movesCondition.textContent = `${moves} / ${BONUS_MOVES.threshold}`;
  timeCondition.textContent = `${timePourcent} / ${BONUS_TIME.threshold}s`;
  
  // Changer la couleur si le bonus est atteint
  if (moves <= BONUS_MOVES.threshold) {
    movesCondition.style.color = '#4ecdc4';
  } else {
    movesCondition.style.color = '#999';
  }
  
  if (timePourcent <= BONUS_TIME.threshold) {
    timeCondition.style.color = '#4ecdc4';
  } else {
    timeCondition.style.color = '#999';
  }
}

// Démarrer le timer du jeu
function startGameTimer() {
  if (gameStartTime === 0) {
    gameStartTime = Date.now();
    gameTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      timeDisplay.textContent = `${elapsed}s`;
    }, 1000);
  }
}

// Arrêter le timer et appliquer les bonus
function finishGame() {
  if (gameTimerInterval) {
    clearInterval(gameTimerInterval);
  }
  
  const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
  
  // Réinitialiser les flags de bonus
  lastBonusMovesEarned = false;
  lastBonusTimeEarned = false;
  difficultyBonus = 0;
  
  // Vérifier les bonus de coups
  if (moves <= BONUS_MOVES.threshold) {
    score += BONUS_MOVES.points;
    lastBonusMovesEarned = true;
    console.log(`Bonus coups ! +${BONUS_MOVES.points} points`);
  }
  
  // Vérifier les bonus de temps
  if (elapsed <= BONUS_TIME.threshold) {
    score += BONUS_TIME.points;
    lastBonusTimeEarned = true;
    console.log(`Bonus temps ! +${BONUS_TIME.points} points`);
  }
  
  // Vérifier les bonus de difficulté (10 points par mode activé)
  if (limitedMovesMode) {
    difficultyBonus += 10;
    score += 10;
    console.log(`Bonus difficulté (coups limités) ! +10 points`);
  }
  
  if (limitedTimeMode) {
    difficultyBonus += 10;
    score += 10;
    console.log(`Bonus difficulté (temps limité) ! +10 points`);
  }
  
  // Vérifier le bonus des couleurs grises
  if (!cubeColorsEnabled) {
    grayModeBonus = true;
    score += 10;
    console.log(`Bonus mode gris ! +10 points`);
  } else {
    grayModeBonus = false;
  }
  
  updateScoreDisplay();
  showGameOverModal(elapsed);
}

function showGameOverModal(elapsed, loseReason = null) {
  // Ajouter le score à la somme totale
  totalScoreAcrossGames += score;
  
  // Afficher les détails
  finalScoreDisplay.textContent = totalScoreAcrossGames;
  finalMovesDisplay.textContent = moves;
  finalTimeDisplay.textContent = `${elapsed}s`;
  
  // Si le joueur a perdu
  if (loseReason) {
    document.querySelector('.modal-content h2').textContent = 'Partie perdue!';
    document.querySelector('.modal-content h2').style.color = '#ff6b6b';
    bonusMovesResult.textContent = loseReason;
    bonusTimeResult.textContent = '-';
    bonusMovesResult.parentElement.style.display = 'none';
    bonusTimeResult.parentElement.style.display = 'none';
    bonusDifficultyResult.parentElement.style.display = 'none';
    
    // Masquer le bouton continuer et afficher seulement nouvelle partie
    continueBtn.style.display = 'none';
    newGameBtnModal.style.display = 'block';
  } else {
    // Si le joueur a gagné
    document.querySelector('.modal-content h2').textContent = 'Partie terminée!';
    document.querySelector('.modal-content h2').style.color = '#4ecdc4';
    bonusMovesResult.parentElement.style.display = 'flex';
    bonusTimeResult.parentElement.style.display = 'flex';
    bonusDifficultyResult.parentElement.style.display = 'flex';
    
    // Afficher les bonus obtenus
    bonusMovesResult.textContent = lastBonusMovesEarned ? `✓ +${BONUS_MOVES.points}` : '✗ Non atteint';
    bonusMovesResult.className = lastBonusMovesEarned ? '' : 'not-earned';
    
    bonusTimeResult.textContent = lastBonusTimeEarned ? `✓ +${BONUS_TIME.points}` : '✗ Non atteint';
    bonusTimeResult.className = lastBonusTimeEarned ? '' : 'not-earned';
    
    // Afficher les bonus de difficulté
    if (difficultyBonus > 0) {
      bonusDifficultyResult.textContent = `✓ +${difficultyBonus}`;
      bonusDifficultyResult.className = '';
    } else {
      bonusDifficultyResult.textContent = '✗ Désactivé';
      bonusDifficultyResult.className = 'not-earned';
    }
    
    // Afficher le bonus de mode gris
    bonusGrayResult.textContent = grayModeBonus ? '✓ +10' : '✗ Couleur activée';
    bonusGrayResult.className = grayModeBonus ? '' : 'not-earned';
    
    // Afficher les deux boutons
    continueBtn.style.display = 'block';
    newGameBtnModal.style.display = 'block';
  }
  
  // Afficher le modal
  gameOverModal.classList.remove('hidden');
}

function continueWithIncreasedDifficulty() {
  // Augmenter la difficulté
  gridSize = Math.min(gridSize + 1, 5);
  
  // Mettre à jour le slider
  rowsSlider.value = gridSize;
  gridSizeValue.textContent = gridSize;
  gridSizeValueCopy.textContent = gridSize;
  
  // Calculer les nouveaux seuils
  calculateBonusThresholds(gridSize);
  
  // Lancer une nouvelle partie
  resetGame();
}

function resetTotalScore() {
  totalScoreAcrossGames = 0;
}

function loseGame(reason) {
  if (gameTimerInterval) {
    clearInterval(gameTimerInterval);
  }
  
  isCheckingPair = true; // Empêcher d'autres actions
  score = 0; // Pas de points en cas de défaite
  
  const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
  showGameOverModal(elapsed, reason);
}

// Listeners pour le slider
rowsSlider.addEventListener('input', (e) => {
  gridSize = parseInt(e.target.value);
  gridSizeValue.textContent = gridSize;
  gridSizeValueCopy.textContent = gridSize;
  calculateBonusThresholds(gridSize);
  // Recréer le cube et les cartes avec la nouvelle taille
  createCentralCube(gridSize, cubeColorsEnabled);
  createCardsGrid(gridSize);
  resetGame();
});

// Listener pour le bouton de réinitialisation
resetBtn.addEventListener('click', () => {
  resetTotalScore();
  gridSize = 2;
  rowsSlider.value = 2;
  gridSizeValue.textContent = 2;
  gridSizeValueCopy.textContent = 2;
  calculateBonusThresholds(2);
  resetGame();
});

// Listener pour le bouton d'indice
hintBtn.addEventListener('click', () => {
  showHint();
});

// Listeners pour le modal
continueBtn.addEventListener('click', () => {
  continueWithIncreasedDifficulty();
});

newGameBtnModal.addEventListener('click', () => {
  resetTotalScore();
  resetGame();
});

// Listeners pour les modes de difficulté
limitedMovesCheckbox.addEventListener('change', (e) => {
  limitedMovesMode = e.target.checked;
});

limitedTimeCheckbox.addEventListener('change', (e) => {
  limitedTimeMode = e.target.checked;
});

cubeColorsCheckbox.addEventListener('change', (e) => {
  cubeColorsEnabled = e.target.checked;
  createCentralCube(gridSize, cubeColorsEnabled);
});

function resetGame() {
  // Réinitialiser les variables de score
  score = 0;
  moves = 0;
  gameStartTime = 0;
  hintEndTime = 0;
  usedHintsForPairs.clear();
  lastBonusMovesEarned = false;
  lastBonusTimeEarned = false;
  difficultyBonus = 0;
  grayModeBonus = false;
  if (gameTimerInterval) {
    clearInterval(gameTimerInterval);
  }
  
  // Réinitialiser les variables de jeu
  flippedCards = [];
  isCheckingPair = false;
  isShowingHint = false;
  MAX_HINTS = calculateMaxHints(gridSize);
  hintsRemaining = MAX_HINTS;
  
  // Fermer le modal
  gameOverModal.classList.add('hidden');
  
  // Mettre à jour l'affichage
  updateHintButton();
  updateScoreDisplay();
  timeDisplay.textContent = '0s';
  
  // Retirer toutes les cartes de la scène
  cardsTab.forEach(card => {
    scene.remove(card.mesh);
  });
  
  // Créer le cube central adapté à la nouvelle taille
  createCentralCube(gridSize);
  
  // Créer une nouvelle grille avec la taille actuelle
  createCardsGrid(gridSize);
}

function showHint() {
  // Éviter les indices simultanés ou pendant une vérification
  if (isShowingHint || isCheckingPair || hintsRemaining === 0) return;
  
  // Trouver une paire non trouvée
  const unmatchedPairs = [];
  const foundPairIds = new Set();
  
  cardsTab.forEach(card => {
    if (!card.isMatched && !foundPairIds.has(card.pairId)) {
      const otherCard = cardsTab.find(c => c.pairId === card.pairId && c !== card);
      if (otherCard) {
        unmatchedPairs.push([card, otherCard]);
        foundPairIds.add(card.pairId);
      }
    }
  });
  
  // Si pas de paires non trouvées, on peut retourner
  if (unmatchedPairs.length === 0) return;
  
  // Décramenter le nombre d'indices restants
  hintsRemaining--;
  updateHintButton();
  
  // Sélectionner une paire aléatoire
  const [card1, card2] = unmatchedPairs[Math.floor(Math.random() * unmatchedPairs.length)];
  
  // Marquer cette paire comme ayant utilisé un indice
  usedHintsForPairs.add(card1.pairId);
  
  isShowingHint = true;
  
  // Ajouter les cartes en mode indice
  card1.isHinting = true;
  card1.hintStartTime = Date.now();
  
  card2.isHinting = true;
  card2.hintStartTime = Date.now();
  
  // Enregistrer quand l'indice se termine
  hintEndTime = Date.now() + 10000;
  
  // Les remettre à la normale après 10 secondes
  setTimeout(() => {
    card1.isHinting = false;
    card2.isHinting = false;
    isShowingHint = false;
    hintEndTime = 0;
  }, 10000);
}

function handleCardClick(clickedMesh) {
  const card = cardsTab.find(c => c.mesh === clickedMesh);
  if (!card) return;

  // Démarrer le timer au premier clic
  if (gameStartTime === 0) {
    startGameTimer();
  }

  // Si déjà trouvée, déjà en flip ou en train de vérifier une paire → on ignore
  if (card.isMatched || card.isFlipping || isCheckingPair) return;

  // Si déjà retournée dans cette séquence, on ignore
  if (flippedCards.includes(card)) return;

  // Retourner la carte
  card.isFlipped = true;
  card.targetFlipRotation = Math.PI; // 180°
  card.isFlipping = true;

  flippedCards.push(card);

  // Si 2 cartes sont retournées, vérifier si c'est une paire
  if (flippedCards.length === 2) {
    moves++;
    updateScoreDisplay();
    
    // Vérifier si le mode "coups limités" est activé et dépassé
    if (limitedMovesMode && moves > BONUS_MOVES.threshold) {
      loseGame('Vous avez dépassé le nombre de coups limité !');
      return;
    }
    
    checkPair();
  }
}

function checkPair() {
  isCheckingPair = true;
  const [card1, card2] = flippedCards;

  // Attendre la fin de l'animation de flip avant de vérifier
  setTimeout(() => {
    if (card1.pairId === card2.pairId) {
      // C'est une paire ! Les cartes restent retournées
      card1.isMatched = true;
      card2.isMatched = true;
      
      // Ajouter les points
      let pairPoints = 1;
      
      // Vérifier si un indice a été utilisé pour cette paire
      if (usedHintsForPairs.has(card1.pairId)) {
        pairPoints -= 0.5; // Pénalité de -0.5 point
      }
      
      score += pairPoints;
      updateScoreDisplay();
      
      // Vérifier si toutes les paires sont trouvées
      const allMatched = cardsTab.every(card => card.isMatched);
      if (allMatched) {
        console.log('Jeu terminé !');
        finishGame();
      }
      
      flippedCards = [];
      isCheckingPair = false;
    } else {
      // Ce n'est pas une paire, les remettre face cachée
      setTimeout(() => {
        card1.isFlipped = false;
        card1.targetFlipRotation = 0;
        card1.isFlipping = true;

        card2.isFlipped = false;
        card2.targetFlipRotation = 0;
        card2.isFlipping = true;

        flippedCards = [];
        isCheckingPair = false;
      }, 800); // délai de 800ms pour voir les cartes avant qu'elles se retournent
    }
  }, 200); // délai pour attendre la fin de l'animation
}



// Boucle de rendu
function animate() {
  requestAnimationFrame(animate);
  const hoverSpeed = 0.15;
  
  // Mettre à jour l'affichage des conditions si le jeu est en cours
  if (gameStartTime !== 0) {
    updateScoreDisplay();
    
    // Vérifier si le temps limité est dépassé
    if (limitedTimeMode && !isCheckingPair) {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      if (elapsed > BONUS_TIME.threshold) {
        loseGame('Vous avez dépassé le temps limité !');
      }
    }
  }
  
  // Afficher le timer d'indice (à tout moment, pas seulement quand le jeu a commencé)
  if (hintEndTime > 0) {
    const remainingTime = Math.max(0, Math.ceil((hintEndTime - Date.now()) / 1000));
    hintTimerDisplay.textContent = 'Durée restante de l\'indice: ' +  remainingTime + 's';
  } else {
    hintTimerDisplay.textContent = '-';
  }

  // Mettre à jour la rotation de chaque carte
cardsTab.forEach(card => {
  // --- Flip (rotation Y) ---
  // --- Flip (rotation) ---
  if (card.isFlipping) {
    const current = card.currentFlipRotation;
    const target = card.targetFlipRotation;
    const speed = 0.15;

    card.currentFlipRotation += (target - current) * speed;

    // Créer une rotation de flip sur l'axe approprié
    const flipQuat = new THREE.Quaternion();
    if (card.flipAxis === 'x') {
      flipQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), card.currentFlipRotation);
    } else {
      flipQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), card.currentFlipRotation);
    }
    
    // Combiner la rotation de base avec le flip
    card.mesh.quaternion.copy(card.baseQuaternion).multiplyQuaternions(flipQuat, card.baseQuaternion);

    if (Math.abs(target - card.currentFlipRotation) < 0.01) {
      card.currentFlipRotation = target;
      // Appliquer la rotation finale
      const finalFlipQuat = new THREE.Quaternion();
      if (card.flipAxis === 'x') {
        finalFlipQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), target);
      } else {
        finalFlipQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), target);
      }
      card.mesh.quaternion.copy(card.baseQuaternion).multiplyQuaternions(finalFlipQuat, card.baseQuaternion);
      card.isFlipping = false;
    }
  }

  // --- Hover (position Y + scale) --- toujours exécuté
  if (card.isHinting) {
    // Animation d'indice : agrandissement oscillant en boucle (10 secondes)
    const elapsed = Date.now() - card.hintStartTime;
    const progress = Math.min(elapsed / 10000, 1);
    
    // Oscillation sinusoïdale pour agrandissement/rétrécissement (4 cycles en 10s)
    const scaleOscillation = Math.sin(progress * Math.PI * 4);
    const targetScale = 1.0 + scaleOscillation * 0.2; // Varie entre 0.8 et 1.2
    
    card.currentScale = targetScale;
    card.mesh.scale.set(card.currentScale, card.currentScale, card.currentScale);
    
    // Changer la face avant en blanc pour indiquer l'indice
    card.mesh.material[4].color.setHex(0xffffff);
  } else {
    // Comportement normal du hover - juste agrandissement/rétrécissement
    card.currentScale += (card.targetScale - card.currentScale) * hoverSpeed;
    card.mesh.scale.set(card.currentScale, card.currentScale, card.currentScale);
    
    // Remettre la face avant en noir si elle n'est pas retournée
    if (!card.isFlipped) {
      card.mesh.material[4].color.setHex(0x1a1a1a);
    }
  }
});


  controls.update();
  renderer.render(scene, camera);
}


// Crée une grille de cartes autour du cube
createCentralCube(gridSize, cubeColorsEnabled);
createCardsGrid(gridSize);

// Calculer les seuils de bonus initiaux
calculateBonusThresholds(gridSize);

// Mettre à jour le bouton indice au démarrage
updateHintButton();

animate();



