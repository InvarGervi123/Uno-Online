const socket = io();

document.getElementById('join').onclick = () => {
  const name = document.getElementById('name').value;
  if (name) {
    socket.emit('join', name);
  }
};

document.getElementById('draw').onclick = () => {
  socket.emit('drawCard');
};

socket.on('welcome', (data) => {
  alert(data.message);
  updatePlayers(data.players);
});

socket.on('updatePlayers', (players) => {
  updatePlayers(players);
});

socket.on('drawnCard', (card) => {
  const hand = document.getElementById('hand');
  const cardElement = document.createElement('div');
  cardElement.innerText = `${card.color} ${card.value}`;
  hand.appendChild(cardElement);
});

socket.on('cardPlayed', (data) => {
  alert(`${data.player} played ${data.card.color} ${data.card.value}`);
});

function updatePlayers(players) {
  const playersDiv = document.getElementById('players');
  playersDiv.innerHTML = '';
  players.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.innerText = player.name;
    playersDiv.appendChild(playerDiv);
  });
}
