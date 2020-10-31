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

const port = process.env.PORT ?? 5000
const app = express()
const http = createServer(app)

app.get('/', (_req, res) => {
	res.redirect(301, 'https://draw.place')
})

IO(http).on('connect', io => new User(io))

http.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`)
})
