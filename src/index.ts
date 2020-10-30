import { createServer } from 'http'
import IO from 'socket.io'

import User from './models/User'

const server = createServer((_req, res) => {
	res.writeHead(301, { Location: 'https://draw.place' })
	res.end()
})

IO(server).on('connect', socket => new User(socket))

;(async () => {
	const port = process.env.PORT ?? 5000
	server.listen(port, () => console.log(`Listening on http://localhost:${port}`))
})()
