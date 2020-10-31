import { Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'

import UserJson from './UserJson'
import Coordinate, { getChunkIdForCoordinate } from './Coordinate'
import { getChunk } from './Chunk'
import Line, { addLine, getChunkIdForLine } from './Line'
import Message, { UserMessage, JoinMessage, LeaveMessage, addMessage, getMessages } from './Message'
import generateName from '../utils/generateName'

const users = new Set<User>()

export default class User {
	private id: string = uuid()
	private cursor?: Coordinate
	private name: string = generateName()
	private color: string = '#000000'
	private chunks: Set<string> = new Set() // Chunk IDs
	private otherUsers: Set<User>
	
	constructor(private io: Socket) {
		this.otherUsers = new Set(users)
		users.add(this)
		
		this.emitName()
		this.emitOtherUsers()
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
			this.addChunksIfNeeded()
			
			for (const user of this.otherUsers)
				user.emitOtherUsers()
		})
		
		io.on('line', (line: Line) => {
			const chunkId = getChunkIdForLine(line)
			
			addLine(chunkId, line)
			
			for (const user of this.otherUsers)
				user.emitLine(chunkId, line)
		})
		
		io.on('disconnect', () => {
			const message: LeaveMessage = {
				type: 'leave',
				name: this.name
			}
			
			addMessage(message)
			users.delete(this)
			
			for (const user of users) {
				user.otherUsers.delete(this)
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
		const users: UserJson[] = []
		
		for (const { json } of this.otherUsers)
			if (json)
				users.push(json)
		
		return users
	}
	
	private emitName = () => {
		this.io.emit('name', this.name)
	}
	
	private emitOtherUsers = () => {
		this.io.emit('users', this.jsonOtherUsers)
	}
	
	private addChunksIfNeeded = async () => {
		if (!this.cursor)
			return
		
		const chunkId = getChunkIdForCoordinate(this.cursor)
		
		if (this.chunks.has(chunkId))
			return // Already loaded chunk
		
		this.chunks.add(chunkId)
		this.io.emit('add-chunk', await getChunk(this.cursor))
	}
	
	private emitLine = (chunkId: string, line: Line) => {
		if (this.chunks.has(chunkId))
			this.io.emit('line', chunkId, line)
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
