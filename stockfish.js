const spawn = require('child_process').spawn
const stockfish = spawn('stockfish')

module.exports.setupBoard = () => {
  stockfish.stdin.write('position startpos\n')
}

module.exports.getBestMove = (fen) => {
  return new Promise((resolve, reject) => {
    stockfish.stdout.on('data', (data) => processOutput(data))

    console.log('fen', fen)
    stockfish.stdin.write(`position fen ${fen}\n`)
    stockfish.stdin.write('go depth 10\n')

    function processOutput (data) {
      let message = String(data)
      const moveIndex = message.indexOf('bestmove')
      message = message.slice(moveIndex, message.length - 1)
      message = message.split('\n')[0]
      const bestmove = message.slice(9, 13)

      stockfish.stdin.removeListener('data', processOutput)
      if (bestmove.length > 0) {
        resolve(bestmove)
      }
    }
  })
}

stockfish.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`)
})

stockfish.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})

