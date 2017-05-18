const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const chess = require('chess.js').Chess
const Ai = require('./ai')
const Stockfish = require('./console')

// let pgn = game.pgn()
const ai = new Ai()
let game = chess()

Stockfish.setupBoard()

app.get('/', (req, res) => {
  res.send('Hello World')
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

  socket.on('message', (msg) => {
    console.log('message', msg)

    if (!msg.encrypted) {
      respond(msg)
    }

    io.emit('message', msg)
  })

  socket.on('newgame', () => {
    // resetGame()
  })

  socket.on('newmove', (moveObj) => {
    game.move(moveObj.move)
    const fen = game.fen()
    return Stockfish.getBestMove(fen)
      .then((bestmoveStock) => {
        console.log('socket', bestmoveStock)
        game.move(bestmoveStock, {sloppy: true})

        io.emit('newmove', {
          move: bestmoveStock,
          sender: -1
        })
      })
  })
    //
    // console.log(tempGame.ascii())
    // const bestmove = await ai.getBestMove(tempGame)
    // tempGame.move(bestmove)
    // game = tempGame
    // console.log(tempGame.ascii())


  socket.on('publickey', (key) => {
    console.log('publickey', key)
    io.emit('publickey', key)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

http.listen(3000, () => {
  console.log('listening on *:3000')
})
