import Coordinate from './Coordinate'

export default interface Bounds {
	lower: Coordinate
	upper: Coordinate
}

export const areBoundsNaN = ({ lower, upper }: Bounds) =>
	Number.isNaN(lower.x) || Number.isNaN(lower.y) ||
	Number.isNaN(upper.x) || Number.isNaN(upper.y)
