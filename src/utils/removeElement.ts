const removeElement = <T>(array: T[], element: T) => {
	const index = array.indexOf(element)
	
	if (~index)
		array.splice(index, 1)
	
	return array
}

export default removeElement
