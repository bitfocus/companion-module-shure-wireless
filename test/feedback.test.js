import assert from 'node:assert/strict'
import test from 'node:test'
import { updateFeedbacks } from '../src/feedback.js'

function feedbacksFor(family, txTalkSwitch) {
	const instance = {
		model: { family },
		CHANNELS_FIELD: { type: 'dropdown', id: 'channel' },
		SLOTS_FIELD: { type: 'dropdown', id: 'slot' },
		api: {
			getChannel: () => ({ txTalkSwitch }),
		},
		setFeedbackDefinitions: (feedbacks) => {
			instance.feedbacks = feedbacks
		},
	}

	updateFeedbacks.call(instance)
	return instance.feedbacks
}

for (const family of ['ad', 'qlx', 'ulx']) {
	test(`${family} exposes transmitter talk switch feedback`, () => {
		const feedback = feedbacksFor(family, 'PRESSED').transmitter_talk_switch

		assert.ok(feedback)
		assert.equal(feedback.callback({ options: { channel: '1' } }), true)
	})
}

test('slx does not expose transmitter talk switch feedback', () => {
	assert.equal(feedbacksFor('slx', 'PRESSED').transmitter_talk_switch, undefined)
})
