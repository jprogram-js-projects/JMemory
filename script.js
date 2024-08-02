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
let dirImage = "images";
const totalPairs = 4;


const cardsData = [
  { name: 'img1', img: `${dirImage}/donald.png`,  curiosity: 'Curiosidade sobre a imagem 1' },
  { name: 'img2', img: `${dirImage}/goofy.png`,   curiosity: 'Curiosidade sobre a imagem 2' },
  { name: 'img3', img: `${dirImage}/mickey.png`,  curiosity: 'Curiosidade sobre a imagem 3' },
  { name: 'img4', img: `${dirImage}/minnie.png`,  curiosity: 'Curiosidade sobre a imagem 4' }
];

function createCard({ name, img, curiosity }) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.name = name;
  card.dataset.curiosity = curiosity;

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
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');
  curiosityElement.textContent = `Curiosidade: ${this.dataset.curiosity}`;

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
  }, 1200);
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
    timerElement.textContent = `Tempo: ${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function showConfetti() {
  const colors = ['#ff0', '#f00', '#0f0', '#00f', '#ff7f00', '#9400d3'];
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = `${Math.random() * 2}s`;

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 2000);
  }
}

initializeGame();
