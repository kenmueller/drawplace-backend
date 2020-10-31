import admin from 'firebase-admin'

import Line from './Line'
import Coordinate from './Coordinate'

export const CHUNK_DIMENSION = 1000

const firestore = admin.firestore()

export default interface Chunk {
	id: string
	x: number
	y: number
	lines: Line[]
}

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
