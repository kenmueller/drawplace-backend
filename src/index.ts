import { createServer } from 'http'
import IO from 'socket.io'

const http = createServer((_req, res) => res.end())
const io = IO(http)

io.on('connect', socket => console.log('connect'))

;(async () => {
	const port = process.env.PORT ?? 5000
	http.listen(port, () => console.log(`Listening on http://localhost:${port}`))
})()
