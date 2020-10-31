# drawplace backend

- Chunks
	- 1000x1000
	- Contains lines with a starting point in the current chunk
	- Document ID is `{x / 1000}x{y / 1000}`
		- Examples: `-1x-1`, `0x0`, `1x0`
