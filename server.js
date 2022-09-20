if (process.env.NODE_ENV !== "production") {
  console.log(process.env.NODE_ENV);
  require('dotenv').config();
}

const PORT = process.env.PORT || 3000;

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  const newRandom = require("crypto").randomBytes(2).toString('hex');
  console.log(newRandom);
  res.redirect(`/${newRandom}`)
  // res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})


// Server will wait for peers to connect which happens when on the client side they execute socket = io('/');
io.on('connection', socket => {
  socket.on('join-room', (roomId, peerId) => {

    // When a peer joins the room, execute join and then broadcast 'peer-join-room' with that peerId
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('peer-joined-room', peerId)

    // Wait for disconnect event and then broadcast 'peer-exited-room' event to clients
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('peer-exited-room', peerId)
    })
  })
})

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));