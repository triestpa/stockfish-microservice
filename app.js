const app = require('express')()
const bodyParser = require('body-parser')
const http = require('http').Server(app)
const chess = require('chess.js').Chess
const Stockfish = require('./stockfish')


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/bestmove', async (req, res) => {
  // Initialize new stockfish instance
  const stockfish = new Stockfish()
  stockfish.setupBoard()

  let fen = req.query.fen
  if (!fen) {
    // Get new game board
    fen = chess().fen()
  } else if (!chess().load(fen)) {
    // Reject if invalid FEN
    return res.status(400).send('Invalid FEN')
  }

  const bestmove = await stockfish.getBestMove(fen)
  res.send(bestmove)
})

// const io = require('socket.io')(http)

// io.on('connection', (socket) => {
//   io.emit('new connection', null)

//   socket.on('newmove', async (moveObj) => {
//     game.move(moveObj.move)
//     const fen = game.fen()
//     const bestmove = await Stockfish.getBestMove(fen)
//     console.log('socket', bestmove)
//     game.move(bestmove, {sloppy: true})

//     io.emit('newmove', {
//       move: bestmove,
//       sender: -1
//     })
//   })

//   socket.on('disconnect', () => {
//     console.log('user disconnected')
//   })
// })

const port = process.env.PORT || 3000
http.listen(port, () => {
  console.log(`Sever listening on *:${port}`)
})
