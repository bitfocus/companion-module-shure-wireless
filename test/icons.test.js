import assert from 'node:assert/strict'
import { test } from 'node:test'
import { updateFeedbacks } from '../src/feedback.js'
import Icons from '../src/icons.js'

const families = [
	{
		name: 'Axient',
		method: 'getADStatus',
		args: ['BB', 2, 2, 2, 4, 2, 'ALL', 'ON', 3],
		fields: { audio: 1, rfA: 2, rfB: 3, battery: 4, quality: 8 },
	},
	{
		name: 'QLX-D / ULX-D',
		method: 'getULXStatus',
		args: ['AX', 2, 2, 4, 2, 'ALL', 'ON'],
		fields: { audio: 1, rf: 2, battery: 3 },
	},
	{
		name: 'SLX-D',
		method: 'getSLXStatus',
		args: [2, 2, 4, 2],
		fields: { audio: 0, rf: 1, battery: 2 },
	},
]

for (const family of families) {
	for (const height of [58, 72]) {
		const image = { width: 72, height }
		for (const [field, index] of Object.entries(family.fields)) {
			for (const [before, after] of [
				[undefined, 0],
				[0, undefined],
			]) {
				test(`${family.name} ${height}px ${field}: ${before} -> ${after} matches a fresh render`, () => {
					const initial = [...family.args]
					initial[index] = before
					const next = [...family.args]
					next[index] = after
					const cached = new Icons({})
					const firstImage = cached[family.method](image, ...initial)
					const expected = new Icons({})[family.method](image, ...next)

					// The real pixel output differs: zero is a visible state, not an omitted icon.
					assert.ok(firstImage !== expected, 'Zero and hidden must produce different pixels')
					assert.ok(cached[family.method](image, ...next) === expected, 'Cached pixels must match a fresh render')
					assert.ok(
						cached[family.method](image, ...initial) === firstImage,
						'Returning to the initial state must match'
					)
				})
			}
		}
	}

	test(`${family.name}: identical zero-valued states still reuse the cache`, () => {
		const icons = new Icons({})
		const args = [...family.args]
		for (const index of Object.values(family.fields)) args[index] = 0
		const image = { width: 72, height: 72 }
		const first = icons[family.method](image, ...args)
		assert.equal(Object.keys(icons.savedIcons).length, 1)
		icons.drawFromPNGdata = () => {
			throw new Error('Unchanged state should use the cached image')
		}
		assert.equal(icons[family.method](image, ...args), first)
	})
}

test('channel status returns the current Companion imageBuffer property', () => {
	let definitions
	const context = {
		model: { family: 'ad' },
		CHANNELS_FIELD: {},
		SLOTS_FIELD: {},
		api: {
			getChannel: () => ({
				name: 'AD4Q',
				frequency: 600000,
				txType: 'ADX2',
				txPowerLevel: 10,
			}),
			getIcon: () => 'base64-png',
		},
		setFeedbackDefinitions: (value) => {
			definitions = value
		},
	}

	updateFeedbacks.call(context)
	const result = definitions.sample.callback({
		image: { width: 72, height: 72 },
		options: { channel: '1', labels: [], icons: [], barlevel: 1 },
	})

	assert.equal(result.imageBuffer, 'base64-png')
	assert.equal('imageBuffers' in result, false)
})
