import Coordinate from './Coordinate'

export default interface UserJson {
	cursor: Coordinate
	name: string
	color: string
	message: string | null
}
