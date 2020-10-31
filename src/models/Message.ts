import admin from 'firebase-admin'

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

export const getMessages = async (limit: number = 100) =>
	(await firestore.collection('messages').limit(limit).get())
		.docs
		.map(snapshot => snapshot.data() as Message)

export const addMessage = async (message: Message) =>
	(await firestore.collection('messages').add(message)).id
