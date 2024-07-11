const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let players = [];
let deck = [];

function createDeck() {
  const colors = ['red', 'green', 'blue', 'yellow'];
  const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', '+2'];
  for (let color of colors) {
    for (let value of values) {
      deck.push({ color, value });
      if (value !== '0') deck.push({ color, value });
    }
  }
  const wildCards = ['wild', 'wild+4'];
  for (let card of wildCards) {
    for (let i = 0; i < 4; i++) deck.push({ color: null, value: card });
  }
}

io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);
  socket.on('join', (name) => {
    players.push({ id: socket.id, name, hand: [] });
    if (players.length === 1) createDeck();
    socket.emit('welcome', { message: 'Welcome to UNO!', players });
    io.emit('updatePlayers', players);
  });

  socket.on('disconnect', () => {
    players = players.filter(player => player.id !== socket.id);
    io.emit('updatePlayers', players);
  });

  socket.on('drawCard', () => {
    let player = players.find(p => p.id === socket.id);
    if (deck.length === 0) createDeck();
    let card = deck.pop();
    player.hand.push(card);
    socket.emit('drawnCard', card);
    io.emit('updatePlayers', players);
  });

  socket.on('playCard', (card) => {
    let player = players.find(p => p.id === socket.id);
    player.hand = player.hand.filter(c => c.color !== card.color || c.value !== card.value);
    io.emit('cardPlayed', { player: player.name, card });
    io.emit('updatePlayers', players);
  });
});

app.use(express.static('public'));

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
