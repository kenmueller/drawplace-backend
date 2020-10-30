import { createServer } from 'http'
import IO from 'socket.io'

import User from './models/User'

const http = createServer((_req, res) => res.end())
const io = IO(http)

io.on('connect', socket => new User(socket))

;(async () => {
	const port = process.env.PORT ?? 5000
	http.listen(port, () => console.log(`Listening on http://localhost:${port}`))
})()
