import { CHUNK_DIMENSION } from './Chunk'

export default interface Coordinate {
	x: number
	y: number
}

export const getChunkIdForCoordinate = ({ x, y }: Coordinate) =>
	`${Math.floor(x / CHUNK_DIMENSION)}x${Math.floor(y / CHUNK_DIMENSION)}`
