const spawn = require('child_process').spawn
const stockfish = spawn('stockfish')

class Stockfish {
  constructor () {
    this.stockfish = spawn('stockfish')

    this.setErrorListener((data) => {
      console.log(`stderr: ${data}`)
    })

    this.setOnCloseListener((code) => {
      console.log(`child process exited with code ${code}`)
    })
  }

  setErrorListener (listener) {
    this.stockfish.stderr.on('data', listener)
  }

  setOnCloseListener (listener) {
    this.stockfish.on('close', listener)
  }

  /** Initialize stockfish with clean board */
  setupBoard () {
    this.stockfish.stdin.write('position startpos\n')
  }

  /**
   * Receive a FEN string, and return a promise
   * that will resolve with the recommended move.
  */
  getBestMove (fen) {
    return new Promise((resolve, reject) => {
      /** Process the stockfish output */
      const processOutput = (data) => {
        let message = String(data)

        // Parse the best move from the output message
        const moveIndex = message.indexOf('bestmove')
        message = message.slice(moveIndex, message.length - 1)
        message = message.split('\n')[0]
        const bestmove = message.slice(9, 13)

        this.stockfish.stdin.removeListener('data', processOutput)
        if (bestmove.length > 0) {
          resolve(bestmove)
        }
      }

      // Set result processing function
      this.stockfish.stdout.on('data', (data) => processOutput(data))

      // Write current FEN position to Stockfish process
      this.stockfish.stdin.write(`position fen ${fen}\n`)

      // Set difficulty
      this.stockfish.stdin.write('go depth 10\n')
    })
  }
}

module.exports = Stockfish
