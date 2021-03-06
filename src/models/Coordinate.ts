import { CHUNK_DIMENSION } from './Chunk'

export default interface Coordinate {
	x: number
	y: number
}

export const getChunkIdForCoordinate = ({ x, y }: Coordinate) =>
	`${Math.floor(x / CHUNK_DIMENSION)}x${Math.floor(y / CHUNK_DIMENSION)}`

export const addCoordinates = (a: Coordinate, b: Coordinate): Coordinate => ({
	x: a.x + b.x,
	y: a.y + b.y
})

export const areCoordinatesInOrder = (a: Coordinate, b: Coordinate, c: Coordinate) =>
	a.x <= b.x && b.x <= c.x && a.y <= b.y && b.y <= c.y
