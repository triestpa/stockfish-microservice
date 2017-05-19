// var os = require('os')
// var pty = require('node-pty')
// var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'

// var ptyProcess = pty.spawn(shell, [], {
//   name: 'xterm-color',
//   cols: 80,
//   rows: 30,
//   cwd: process.env.HOME,
//   env: process.env
// })

// ptyProcess.on('data', function (data) {
//   console.log(data)
// })

// ptyProcess.write('ls\r')
// ptyProcess.resize(100, 40)
// ptyProcess.write('ls\r')

const spawn = require('child_process').spawn
const stockfish = spawn('stockfish')

// stockfish.stdin.write('position startpos\n')
// stockfish.stdin.write('go depth 10\n')

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
      // console.log('console', message)
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

