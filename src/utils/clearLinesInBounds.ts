import admin from 'firebase-admin'

import Bounds from '../models/Bounds'
import { areCoordinatesInOrder } from '../models/Coordinate'
import Line from '../models/Line'
import deleteDocs from './deleteDocs'

const firestore = admin.firestore()

const clearLinesInBounds = async (chunkId: string, bounds: Bounds) => {
	const { docs } = await firestore.collection(`chunks/${chunkId}/lines`).get()
	
	return deleteDocs(docs.reduce((acc: FirebaseFirestore.DocumentReference[], snapshot) => {
		const line = snapshot.data() as Line
		
		if (areCoordinatesInOrder(bounds.lower, line.from, bounds.upper))
			acc.push(snapshot.ref)
		
		return acc
	}, []))
}

export default clearLinesInBounds
