const gameContainer = document.querySelector('.game-container');
const curiosityElement = document.getElementById('curiosity');
const timerElement = document.getElementById('timer');
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let timerInterval;
let seconds = 0;
let minutes = 0;
let matchedPairs = 0;
let dirImages = "images";
let curiosities = [];
const totalPairs = 4;

const defaultCuriosities = [
  {"name": "img1", "curiosity": "Curiosidade sobre a imagem 1"},
  {"name": "img2", "curiosity": "Curiosidade sobre a imagem 2"},
  {"name": "img3", "curiosity": "Curiosidade sobre a imagem 3"},
  {"name": "img4", "curiosity": "Curiosidade sobre a imagem 4"},
  {"name": "img5", "curiosity": "Curiosidade sobre a imagem 5"},
  {"name": "img6", "curiosity": "Curiosidade sobre a imagem 6"}
];

async function fetchCuriosities() {
  try {
    const storedCuriosities = localStorage.getItem('curiosities');
    
    if (storedCuriosities) {
      curiosities = JSON.parse(storedCuriosities);
    } else {
      const response = await fetch('curiosities.json');
      if (response.ok) {
        const data = await response.json();
        curiosities = data;
        localStorage.setItem('curiosities', JSON.stringify(curiosities));
      } else {
        throw new Error('HTTP request failed');
      }
    }

  } catch (error) {
    console.error('Erro ao carregar as curiosidades:', error);
    curiosities = defaultCuriosities;
    localStorage.setItem('curiosities', JSON.stringify(curiosities));
  }
}

function getRandomCuriosity() {
  if (curiosities.length > 0) {
    const randomIndex = Math.floor(Math.random() * curiosities.length);
    return curiosities[randomIndex].curiosity;
  }
  return "Curiosidade não disponível.";
}

const cardsData = [
  { name: 'img1', img: `${dirImages}/donald.png`  },
  { name: 'img2', img: `${dirImages}/goofy.png`   },
  { name: 'img3', img: `${dirImages}/mickey.png`  },
  { name: 'img4', img: `${dirImages}/minnie.png`  }
];

function createCard({ name, img }) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.name = name;

  card.innerHTML = `
    <div class="front-face"></div>
    <div class="back-face">
      <img src="${img}" alt="Imagem">
    </div>
  `;

  card.addEventListener('click', flipCard);
  return card;
}

function initializeGame() {
  const doubledCards = [...cardsData, ...cardsData];
  const shuffledCards = doubledCards.sort(() => 0.5 - Math.random());

  shuffledCards.forEach(cardData => {
    const card = createCard(cardData);
    gameContainer.appendChild(card);
  });

  curiosityElement.textContent = `Curiosidade: ${getRandomCuriosity()}`;

  const bestTime = localStorage.getItem('bestTime');
  if (bestTime) {
    document.getElementById('best-time').textContent = `Melhor Tempo: ${bestTime}`;
  }

  // Iniciar a animação de embaralhamento
  shuffleAnimation().then(() => {
    // Finalizar a animação e permitir o início do jogo
    document.querySelectorAll('.card').forEach(card => card.style.animation = 'none');
  });
}

function shuffleAnimation() {
  return new Promise(resolve => {
    const cards = document.querySelectorAll('.card');
    
    // Animação de juntar no centro
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const centerX = window.innerWidth / 2 - rect.left - rect.width / 2;
      const centerY = window.innerHeight / 2 - rect.top - rect.height / 2;
      card.style.transform = `translate(${centerX}px, ${centerY}px)`;
      card.classList.add('merge');
    });

    setTimeout(() => {
      // Animação de distribuir para suas posições finais
      cards.forEach(card => {
        card.classList.remove('merge');
        card.style.transform = '';
        card.classList.add('distribute');
      });

      setTimeout(resolve, 500); // Tempo da segunda animação
    }, 500); // Tempo da primeira animação
  });
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');
  curiosityElement.textContent = `Curiosidade: ${getRandomCuriosity()}`;

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    if (seconds === 0 && minutes === 0) startTimer();
    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.name === secondCard.dataset.name;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  matchedPairs++;

  if (matchedPairs === totalPairs) {
    stopTimer();
    saveBestTime();
    showConfetti();
  }
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard();
  }, 1500);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    timerElement.textContent = `Tempo: ${minutes}m ${seconds}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function saveBestTime() {
  const currentTime = `${minutes}m ${seconds}s`;
  const bestTime = localStorage.getItem('bestTime');
  if (!bestTime || currentTime < bestTime) {
    localStorage.setItem('bestTime', currentTime);
    document.getElementById('best-time').textContent = `Melhor Tempo: ${currentTime}`;
  }
}

function showConfetti() {
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchCuriosities().then(initializeGame);
})
