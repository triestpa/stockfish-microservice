const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

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
