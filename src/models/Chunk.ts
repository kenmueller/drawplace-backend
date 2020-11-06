import admin from 'firebase-admin'

import Line from './Line'
import Coordinate, { addCoordinates } from './Coordinate'
import Bounds from './Bounds'

export const CHUNK_DIMENSION = 2500

const firestore = admin.firestore()

export default interface Chunk {
	id: string
	x: number
	y: number
	lines: Line[]
}

export const isChunkInBounds = (chunk: Coordinate, bounds: Bounds) =>
	chunk.x + CHUNK_DIMENSION >= bounds.lower.x &&
	chunk.x <= bounds.upper.x &&
	chunk.y <= bounds.upper.y &&
	chunk.y + CHUNK_DIMENSION >= bounds.lower.y

export const getChunksInBounds = (bounds: Bounds) => {
	const chunks: Coordinate[] = []
	const offset: Coordinate = { x: 0, y: 0 }
	
	const start: Coordinate = {
		x: Math.floor(bounds.lower.x / CHUNK_DIMENSION) * CHUNK_DIMENSION,
		y: Math.floor(bounds.lower.y / CHUNK_DIMENSION) * CHUNK_DIMENSION
	}
	
	while (true) {
		const chunk = addCoordinates(start, {
			x: offset.x * CHUNK_DIMENSION,
			y: offset.y * CHUNK_DIMENSION
		})
		
		if (isChunkInBounds(chunk, bounds)) {
			chunks.push(chunk)
			offset.x++
		} else {
			if (!offset.x) // You've gone too far down
				return chunks
			
			offset.x = 0
			offset.y++
		}
	}
}

export const getChunkId = ({ x, y }: Coordinate) =>
	`${Math.floor(x / CHUNK_DIMENSION)}x${Math.floor(y / CHUNK_DIMENSION)}`

export const getChunk = async ({ x, y }: Coordinate): Promise<Chunk> => {
	x = Math.floor(x / CHUNK_DIMENSION)
	y = Math.floor(y / CHUNK_DIMENSION)
	
	const id = `${x}x${y}`
	
	return {
		id,
		x: x * CHUNK_DIMENSION,
		y: y * CHUNK_DIMENSION,
		lines: (await firestore.collection(`chunks/${id}/lines`).get())
			.docs
			.map(snapshot => snapshot.data() as Line)
	}
}
