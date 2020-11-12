import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import admin from 'firebase-admin'

admin.initializeApp({
	credential: admin.credential.cert(
		JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG!, 'base64').toString())
	),
	databaseURL: process.env.FIREBASE_DATABASE_URL
})

import User from './models/User'
import Bounds, { areBoundsNaN } from './models/Bounds'
import { getChunksInBounds, getChunkId } from './models/Chunk'
import clearLinesInBounds from './utils/clearLinesInBounds'

const port = process.env.PORT ?? 5000
const origin = process.env.NODE_ENV === 'production'
	? 'https://draw.place'
	: 'http://localhost:3000'

const app = express()
const http = createServer(app)

app.use((_req, res, next) => {
	res.header('Access-Control-Allow-Origin', origin)
	next()
})

app.get('/', (_req, res) => {
	res.redirect(301, 'https://draw.place')
})

app.post('/clear/:x1/:y1/:x2/:y2', async ({
	params: { x1, y1, x2, y2 },
	query: { pass }
}, res) => {
	if (pass !== process.env.PASSWORD) {
		res.status(401).send('Incorrect password')
		return
	}
	
	const bounds: Bounds = {
		lower: { x: parseInt(x1, 10), y: parseInt(y1, 10) },
		upper: { x: parseInt(x2, 10), y: parseInt(y2, 10) }
	}
	
	if (areBoundsNaN(bounds)) {
		res.status(400).send('Invalid coordinates')
		return
	}
	
	await Promise.all(getChunksInBounds(bounds).map(coordinate =>
		clearLinesInBounds(getChunkId(coordinate), bounds)
	))
	
	res.send(`Cleared lines between ${bounds.lower.x}/${bounds.lower.y} and ${bounds.upper.x}/${bounds.upper.y}`)
})

new Server(http, { cors: { origin } })
	.on('connect', (io: Socket) => new User(io))

http.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`)
})
