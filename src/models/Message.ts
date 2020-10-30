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

type Message = UserMessage | JoinMessage

export default Message

export const messages: Message[] = []
