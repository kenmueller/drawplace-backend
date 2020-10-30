import express from 'express'
import { createServer } from 'http'
import IO from 'socket.io'

import User from './models/User'
import { lines } from './models/Line'
import { messages } from './models/Message'

const port = process.env.PORT ?? 5000
const app = express()
const http = createServer(app)

app.get('/', (_req, res) => {
	res.redirect(301, 'https://draw.place')
})

app.post('/clear-lines', (req, res) => {
	if (req.query.pass !== process.env.PASSWORD) {
		res.status(403).send('Incorrect password')
		return
	}
	
	lines.splice(0, lines.length)
	res.send('Cleared lines')
})

app.post('/clear-messages', (req, res) => {
	if (req.query.pass !== process.env.PASSWORD) {
		res.status(403).send('Incorrect password')
		return
	}
	
	messages.splice(0, messages.length)
	res.send('Cleared messages')
})

IO(http).on('connect', io => new User(io))

http.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`)
})
