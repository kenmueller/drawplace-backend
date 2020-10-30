import { Socket } from 'socket.io'
import generateName from '../generateName'

import UserJson from './UserJson'
import Coordinate from './Coordinate'
import Line, { lines } from './Line'
import Message, { UserMessage, JoinMessage, LeaveMessage, messages } from './Message'

let users: User[] = []

export default class User {
	private cursor?: Coordinate
	private name: string = generateName()
	private color: string = '#000000'
	private message?: string
	
	constructor(private io: Socket) {
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
			
			messages.push(message)
			
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
			
			messages.push(message)
			
			for (const user of users = this.otherUsers) {
				user.emitOtherUsers()
				user.emitMessage(message)
			}
		})
	}
	
	private get json(): UserJson | null {
		return this.cursor
			? {
				cursor: this.cursor,
				name: this.name,
				color: this.color,
				message: this.message ?? null
			}
			: null
	}
	
	private get otherUsers() {
		return users.filter(user => user !== this)
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
	
	private emitMessages = () => {
		this.io.emit('messages', messages)
	}
	
	private emitMessage = (message: Message) => {
		this.io.emit('message', message)
	}
	
	private emitJoinMessage = () => {
		const message: JoinMessage = {
			type: 'join',
			name: this.name
		}
		
		messages.push(message)
		
		for (const user of this.otherUsers)
			user.emitMessage(message)
	}
}
