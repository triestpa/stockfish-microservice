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

app.get('/bestmove', async (req, res) => {
  // Initialize new stockfish instance
  const stockfish = new Stockfish()
  stockfish.setupBoard()

  let fen = req.query.fen
  let difficulty = req.query.difficulty

  if (!fen) {
    // Get new game board
    fen = chess().fen()
  } else if (!chess().load(fen)) {
    // Reject if invalid FEN
    return res.status(400).send('Invalid FEN')
  }

  const bestmove = await stockfish.getBestMove(fen, difficulty)
  res.send(bestmove)
})

const port = process.env.PORT || 3000
http.listen(port, () => {
  console.log(`Sever listening on *:${port}`)
})
