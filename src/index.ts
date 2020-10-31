import express from 'express'
import { createServer } from 'http'
import IO from 'socket.io'
import admin from 'firebase-admin'

admin.initializeApp({
	credential: admin.credential.cert(
		JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG!, 'base64').toString())
	),
	databaseURL: process.env.FIREBASE_DATABASE_URL
})

import User from './models/User'
import { lines } from './models/Line'

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

IO(http).on('connect', io => new User(io))

http.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`)
})
