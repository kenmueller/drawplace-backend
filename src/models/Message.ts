import admin from 'firebase-admin'

const { FieldValue } = admin.firestore
const firestore = admin.firestore()

export interface UserMessage {
	type: 'user'
	name: string
	color: string
	body: string
}

export interface JoinMessage {
	type: 'join'
	name: string
}

export interface LeaveMessage {
	type: 'leave'
	name: string
}

type Message = UserMessage | JoinMessage | LeaveMessage

export default Message

export const getMessages = async (limit: number = 50) =>
	(await firestore.collection('messages').orderBy('date', 'desc').limit(limit).get())
		.docs
		.map(snapshot => {
			const data = snapshot.data()
			delete data.date // Only used for ordering
			return data as Message
		})
		.reverse()

export const addMessage = async (message: Message) =>
	(await firestore
		.collection('messages')
		.add({ ...message, date: FieldValue.serverTimestamp() })
	).id
