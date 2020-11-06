import admin from 'firebase-admin'
import _ from 'lodash'

const CHUNK_SIZE = 500

const firestore = admin.firestore()

const deleteDocs = (docs: FirebaseFirestore.DocumentReference[]) => {
	const chunks = _.chunk(docs, CHUNK_SIZE)
	
	return Promise.all(chunks.map(async chunk => {
		const batch = firestore.batch()
		
		for (const doc of chunk)
			batch.delete(doc)
		
		return batch.commit()
	}))
}

export default deleteDocs
