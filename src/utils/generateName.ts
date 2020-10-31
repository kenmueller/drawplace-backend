import { Config, adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator'

const config: Config = {
	dictionaries: [adjectives, animals],
	separator: ' '
}

const generateName = () =>
	uniqueNamesGenerator(config)

export default generateName
