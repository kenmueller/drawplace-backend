import { Socket } from 'socket.io'

import Cursor from './Cursor'

let users: User[] = []

export default class User {
	private cursor?: Cursor
	
	constructor(private socket: Socket) {
		users.push(this)
		
		this.emitOtherCursors()
		
		socket.on('cursor', (cursor: Cursor) => {
			this.cursor = cursor
			
			for (const user of this.otherUsers)
				user.emitOtherCursors()
		})
		
		socket.on('disconnect', () => users = this.otherUsers)
	}
	
	private get otherUsers() {
		return users.filter(user => user !== this)
	}
	
	private emitOtherCursors = () => {
		this.socket.emit(
			'cursors',
			this.otherUsers.reduce((cursors: Cursor[], { cursor }) => (
				cursor ? [...cursors, cursor] : cursors
			), [])
		)
	}
}
