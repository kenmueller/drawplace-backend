import { Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'

import UserJson from './UserJson'
import Coordinate from './Coordinate'
import Line, { lines } from './Line'
import Message, { UserMessage, JoinMessage, LeaveMessage, addMessage, getMessages } from './Message'
import generateName from '../utils/generateName'
import removeElement from '../utils/removeElement'

const users: User[] = []

export default class User {
	private id: string = uuid()
	private cursor?: Coordinate
	private name: string = generateName()
	private color: string = '#000000'
	private otherUsers: User[]
	
	constructor(private io: Socket) {
		this.otherUsers = [...users]
		users.push(this)
		
		this.emitName()
		this.emitOtherUsers()
		this.emitLines()
		this.emitMessages()
		this.emitJoinMessage()
		
		io.on('name', (name: string) => {
			this.name = name
			
			for (const user of this.otherUsers)
				user.emitOtherUsers()
		})
		
		io.on('color', (color: string) => {
			this.color = color
			
			for (const user of this.otherUsers)
				user.emitOtherUsers()
		})
		
		io.on('message', (body: string) => {
			const message: UserMessage = {
				type: 'user',
				name: this.name,
				color: this.color,
				body
			}
			
			addMessage(message)
			
			for (const user of this.otherUsers)
				user.emitMessage(message)
		})
		
		io.on('cursor', (cursor: Coordinate) => {
			this.cursor = cursor
			
			for (const user of this.otherUsers)
				user.emitOtherUsers()
		})
		
		io.on('line', (line: Line) => {
			lines.push(line)
			
			for (const user of this.otherUsers)
				user.emitLine(line)
		})
		
		io.on('disconnect', () => {
			const message: LeaveMessage = {
				type: 'leave',
				name: this.name
			}
			
			addMessage(message)
			
			for (const user of removeElement(users, this)) {
				removeElement(user.otherUsers, this)
				
				user.emitOtherUsers()
				user.emitMessage(message)
			}
		})
	}
	
	private get json(): UserJson | null {
		return this.cursor
			? {
				id: this.id,
				cursor: this.cursor,
				name: this.name,
				color: this.color
			}
			: null
	}
	
	private get jsonOtherUsers() {
		return this.otherUsers.reduce((users: UserJson[], { json }) => (
			json ? [...users, json] : users
		), [])
	}
	
	private emitName = () => {
		this.io.emit('name', this.name)
	}
	
	private emitOtherUsers = () => {
		this.io.emit('users', this.jsonOtherUsers)
	}
	
	private emitLines = () => {
		this.io.emit('lines', lines)
	}
	
	private emitLine = (line: Line) => {
		this.io.emit('line', line)
	}
	
	private emitMessages = async () => {
		this.io.emit('messages', await getMessages())
	}
	
	private emitMessage = (message: Message) => {
		this.io.emit('message', message)
	}
	
	private emitJoinMessage = () => {
		const message: JoinMessage = {
			type: 'join',
			name: this.name
		}
		
		addMessage(message)
		
		for (const user of this.otherUsers)
			user.emitMessage(message)
	}
}
