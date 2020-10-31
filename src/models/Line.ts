import admin from 'firebase-admin'

import Coordinate, { getChunkIdForCoordinate } from './Coordinate'

const firestore = admin.firestore()

export default interface Line {
	from: Coordinate
	to: Coordinate
	color: string
}

export const getChunkIdForLine = ({ from }: Line) =>
	getChunkIdForCoordinate(from)

export const addLine = async (chunkId: string, line: Line) =>
	(await firestore.collection(`chunks/${chunkId}/lines`).add(line)).id
