import assert from 'node:assert/strict'
import { test } from 'node:test'
import { updateFeedbacks } from '../src/feedback.js'
import Icons from '../src/icons.js'
import { updatePresets } from '../src/presets.js'

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

					assert.notEqual(firstImage, expected, 'Zero and hidden must produce different pixels')
					assert.equal(cached[family.method](image, ...next), expected, 'Cached pixels must match a fresh render')
					assert.equal(
						cached[family.method](image, ...initial),
						firstImage,
						'Returning to the initial state must match'
					)
				})
			}
		}
	}

	test(`${family.name}: identical zero-valued states reuse the cache`, () => {
		const icons = new Icons({})
		const args = [...family.args]
		for (const index of Object.values(family.fields)) args[index] = 0
		const image = { width: 72, height: 72 }
		const firstImage = icons[family.method](image, ...args)
		assert.equal(Object.keys(icons.savedIcons).length, 1)
		icons.drawFromPNGdata = () => {
			throw new Error('Unchanged state should use the cached image')
		}
		assert.equal(icons[family.method](image, ...args), firstImage)
	})
}

function createFeedbackContext() {
	let definitions
	return {
		context: {
			model: { family: 'ad' },
			CHANNELS_FIELD: {},
			SLOTS_FIELD: {},
			api: {
				getChannel: () => ({
					name: 'AD4Q',
					frequency: '600.000',
					txType: 'ADX2',
					txPowerLevel: 10,
				}),
				getIcon: (_options, image) => Buffer.alloc(image.width * image.height * 4).toString('base64'),
			},
			setFeedbackDefinitions: (value) => {
				definitions = value
			},
		},
		getDefinitions: () => definitions,
	}
}

test('channel status returns the Companion 5 image buffer shape', () => {
	const { context, getDefinitions } = createFeedbackContext()
	updateFeedbacks.call(context)
	const image = { width: 72, height: 72 }
	const result = getDefinitions().sample.callback({
		image,
		options: { channel: '1', labels: [], icons: [], barlevel: 2 },
	})

	assert.equal(typeof result.imageBuffer, 'string')
	assert.deepEqual(result.imageBufferEncoding, { pixelFormat: 'ARGB' })
	assert.deepEqual(result.imageBufferPosition, { x: 0, y: 0, width: 72, height: 72 })
	assert.deepEqual(result.imageBuffers, [{ buffer: result.imageBuffer }])
})

test('channel status falls back to a 72x58 buffer when image dimensions are absent', () => {
	const { context, getDefinitions } = createFeedbackContext()
	updateFeedbacks.call(context)
	const result = getDefinitions().sample.callback({
		options: { channel: '1', labels: [], icons: [], barlevel: 2 },
	})

	assert.equal(Buffer.from(result.imageBuffer, 'base64').length, 72 * 58 * 4)
	assert.deepEqual(result.imageBufferPosition, { x: 0, y: 0, width: 72, height: 58 })
})

test('presets provide one ready-to-use status display per configured channel', () => {
	let presets
	updatePresets.call({
		model: { family: 'ad', channels: 4 },
		setPresetDefinitions: (value) => {
			presets = value
		},
	})

	assert.deepEqual(Object.keys(presets), [
		'channel_status_1',
		'channel_status_2',
		'channel_status_3',
		'channel_status_4',
	])
	assert.equal(presets.channel_status_1.feedbacks[0].feedbackId, 'sample')
	assert.equal(presets.channel_status_4.feedbacks[0].options.channel, 4)
	assert.ok(presets.channel_status_1.feedbacks[0].options.icons.includes('quality'))
})
