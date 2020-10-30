import Coordinate from './Coordinate'

export default interface Line {
	from: Coordinate
	to: Coordinate
	color: string
}

export const lines: Line[] = []
