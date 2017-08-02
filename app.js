const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const chess = require('chess.js').Chess
const Stockfish = require('./stockfish')

let game = chess()

Stockfish.setupBoard()

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/bestmove', async (req, res) => {
  const fen = game.fen()
  const bestmove = await Stockfish.getBestMove(fen)
  res.send(bestmove)
})

app.post('/actions/reset', (req, res) => {
  game.reset()
  res.send('OK')
})

function respond (msg) {
  io.emit('message', {
    sender: -1,
    encrypted: false,
    content: 'hello world'
  })
}

io.on('connection', (socket) => {
  io.emit('new connection', null)

  socket.on('newmove', async (moveObj) => {
    game.move(moveObj.move)
    const fen = game.fen()
    const bestmove = await Stockfish.getBestMove(fen)
    console.log('socket', bestmove)
    game.move(bestmove, {sloppy: true})

    io.emit('newmove', {
      move: bestmove,
      sender: -1
    })
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

const port = process.env.PORT || 3000
http.listen(port, () => {
  console.log(`Sever listening on *:${port}`)
})
