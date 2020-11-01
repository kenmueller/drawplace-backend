import { Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'

import UserJson from './UserJson'
import Coordinate, { getChunkIdForCoordinate, areCoordinatesInOrder } from './Coordinate'
import { getChunk, getChunksInBounds } from './Chunk'
import Bounds from './Bounds'
import Line, { addLine, getChunkIdForLine } from './Line'
import Message, { UserMessage, JoinMessage, LeaveMessage, addMessage, getMessages } from './Message'
import generateName from '../utils/generateName'

const users = new Set<User>()

export default class User {
	private id: string = uuid()
	private cursor?: Coordinate
	private name: string = generateName()
	private color: string = '#000000'
	private bounds?: Bounds
	private chunks: Set<string> = new Set() // Chunk IDs
	private otherUsers: Set<User>
	private hasEmittedOtherUsers: boolean = false
	
	constructor(private io: Socket) {
		this.otherUsers = new Set(users)
		users.add(this)
		
		this.emitName()
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
		
		io.on('bounds', (bounds: Bounds) => {
			this.bounds = bounds
			this.addChunksIfNeeded()
			
			if (!this.hasEmittedOtherUsers)
				this.emitOtherUsers()
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
	
	private get jsonOtherUsers() {
		if (!this.bounds)
			return null
		
		const users: UserJson[] = []
		
		for (const user of this.otherUsers) {
			if (!(user.cursor && areCoordinatesInOrder(this.bounds.lower, user.cursor, this.bounds.upper)))
				continue
			
			const json: UserJson = {
				id: user.id,
				cursor: user.cursor,
				name: user.name,
				color: user.color
			}
			
			users.push(json)
		}
		
		return users
	}
	
	private emitName = () => {
		this.io.emit('name', this.name)
	}
	
	private emitOtherUsers = () => {
		const { jsonOtherUsers } = this
		
		if (!jsonOtherUsers)
			return
		
		this.hasEmittedOtherUsers = true
		this.io.emit('users', jsonOtherUsers)
	}
	
	private addChunksIfNeeded = async () => {
		if (!this.bounds)
			return
		
		await Promise.all(getChunksInBounds(this.bounds).map(async coordinate => {
			const chunkId = getChunkIdForCoordinate(coordinate)
			
			if (this.chunks.has(chunkId))
				return // Already loaded chunk
			
			this.chunks.add(chunkId)
			this.io.emit('chunk', await getChunk(coordinate))
		}))
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
