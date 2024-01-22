const downSampleArray = (input, period) => {
	if (period < 1 || period % 1 !== 0) {
		throw new TypeError('Period must be an integer greater than or equal to 1')
	}

	if (period === 1) {
		// Return a copy of input
		return [...input]
	}

	const output = []

	for (let i = 0; i < input.length; i += period) {
		output.push(input[i])
	}

	return output
}

export {
	downSampleArray
}
