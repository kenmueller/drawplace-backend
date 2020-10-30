import { Socket } from 'socket.io'

import Coordinate from './Coordinate'
import Line from './Line'

let users: User[] = []
const lines: Line[] = []

export default class User {
	private cursor?: Coordinate
	
	constructor(private socket: Socket) {
		users.push(this)
		
		this.emitOtherCursors()
		this.emitLines()
		
		socket.on('cursor', (cursor: Coordinate) => {
			this.cursor = cursor
			
			for (const user of this.otherUsers)
				user.emitOtherCursors()
		})
		
		socket.on('line', (line: Line) => {
			lines.push(line)
			
			for (const user of this.otherUsers)
				user.emitLine(line)
		})
		
		socket.on('disconnect', () => {
			for (const user of users = this.otherUsers)
				user.emitOtherCursors()
		})
	}
	
	private get otherUsers() {
		return users.filter(user => user !== this)
	}
	
	private get otherCursors() {
		return this.otherUsers.reduce((cursors: Coordinate[], { cursor }) => (
			cursor ? [...cursors, cursor] : cursors
		), [])
	}
	
	private emitOtherCursors = () => {
		this.socket.emit('cursors', this.otherCursors)
	}
	
	private emitLines = () => {
		this.socket.emit('lines', lines)
	}
	
	private emitLine = (line: Line) => {
		this.socket.emit('line', line)
	}
}
