// Cross-family behavioural regression suite.
//
// Why this file exists: when SLX-D+ support was added (v2.4.0) it introduced
// a new `slxplus` family with parsers that share command keywords with the
// existing AD / ULX / QLX / SLX families (e.g. `ENCRYPTION_MODE`, `RSSI`,
// `AUDIO_LEVEL_PEAK`). A handful of those branches must be family-gated or
// they will corrupt state for the older families. This suite locks in
// "what each family is supposed to do" by driving a fake instance through
// the actual parser code and asserting on the resulting state.
//
// Runs with the built-in `node:test` runner — no extra dependencies needed.
//
//   yarn test     (or `npm test`, or `node --test tests/`)

import { test } from 'node:test'
import assert from 'node:assert/strict'

import WirelessApi from '../src/internalAPI.js'
import { Models } from '../src/setup.js'
import { updateActions } from '../src/actions.js'
import { updateFeedbacks } from '../src/feedback.js'
import { updateVariables } from '../src/variables.js'
import { updatePresets } from '../src/presets.js'

function makeFakeInstance(modelKey) {
	const captured = { variables: [], actions: null, feedbacks: null, presets: null, varDefs: null }
	const inst = {
		model: Models[modelKey],
		config: { variableFormat: 'units', meteringOn: false, meteringInterval: 5000 },
		CHOICES_CHANNELS: [],
		CHOICES_CHANNELS_A: [],
		CHOICES_SLOTS: [],
		CHOICES_SLOTS_A: [],
		setVariableValues: (v) => captured.variables.push(v),
		setVariableDefinitions: (defs) => (captured.varDefs = defs),
		setActionDefinitions: (defs) => (captured.actions = defs),
		setFeedbackDefinitions: (defs) => (captured.feedbacks = defs),
		setPresetDefinitions: (defs) => (captured.presets = defs),
		checkFeedbacks: () => {},
		updateActions: () => {},
		updateFeedbacks: () => {},
		updateStatus: () => {},
		log: () => {},
	}
	inst.api = new WirelessApi(inst)

	const fakeFields = (label) => ({ type: 'dropdown', label, choices: [] })
	inst.CHANNELS_FIELD = fakeFields('channel')
	inst.CHANNELS_A_FIELD = fakeFields('channel-all')
	inst.SLOTS_FIELD = fakeFields('slot')
	inst.SLOTS_A_FIELD = fakeFields('slot-all')
	inst.setupChannelChoices = function () {
		this.CHOICES_CHANNELS = []
		this.CHOICES_CHANNELS_A = []
		this.CHOICES_SLOTS = []
		this.CHOICES_SLOTS_A = []
		if (this.model.channels > 1) this.CHOICES_CHANNELS_A.push({ id: '0', label: 'All Channels' })
		if (this.model.slots > 0) this.CHOICES_SLOTS_A.push({ id: '0:0', label: 'All Channels & Slots' })
		for (let i = 1; i <= this.model.channels; i++) {
			const data = `Channel ${i}`
			this.CHOICES_CHANNELS.push({ id: i, label: data })
			this.CHOICES_CHANNELS_A.push({ id: i, label: data })
			if (this.model.slots > 0) {
				this.CHOICES_SLOTS_A.push({ id: `${i}:0`, label: `${data}, All Slots` })
				for (let j = 1; j <= this.model.slots; j++) {
					this.CHOICES_SLOTS.push({ id: `${i}:${j}`, label: `${i}:${j}` })
					this.CHOICES_SLOTS_A.push({ id: `${i}:${j}`, label: `${i}:${j}` })
				}
			}
		}
	}
	inst.parseActionOption = async (e, key) => String(e.options?.[key] ?? '').trim()
	inst.updateActions = updateActions.bind(inst)
	inst.updateFeedbacks = updateFeedbacks.bind(inst)
	inst.updateVariables = updateVariables.bind(inst)
	inst.updatePresets = updatePresets.bind(inst)

	inst.updateActions()
	inst.updateFeedbacks()
	inst.updateVariables()
	inst.updatePresets()

	return { inst, captured }
}

test('ULX-D family: encryption transform, mute, sample parser, preset gate', () => {
	const { inst, captured } = makeFakeInstance('ulxd4')

	inst.api.updateReceiver('ENCRYPTION', 'MANUAL')
	inst.api.updateChannel(1, 'AUDIO_MUTE', 'ON')
	inst.api.updateChannel(1, 'TX_TYPE', 'ULXD2')
	inst.api.parseULXSample(1, 'SAMPLE 1 ALL AX 050 040')

	assert.equal(inst.api.receiver.encryption, 'ON', 'ULX maps MANUAL → ON')
	assert.equal(inst.api.getChannel(1).audioMute, 'ON')
	assert.equal(inst.api.getChannel(1).txType, 'ULXD2')
	assert.equal(inst.api.getChannel(1).antenna, 'AX')
	const rfBitmapA = inst.api.getChannel(1).rfBitmapA
	assert.ok(rfBitmapA >= 0 && rfBitmapA <= 5, `ULX rfBitmapA should be a 0–5 bar count, got ${rfBitmapA}`)
	assert.ok(captured.actions && captured.feedbacks && captured.varDefs, 'ULX registers actions/feedbacks/vars')
	assert.equal(Object.keys(captured.presets ?? {}).length, 0, 'ULX gets no presets (slxplus-gated)')
})

test('QLX-D family: encryption, TX type, interference_status feedback retained', () => {
	const { inst, captured } = makeFakeInstance('qlxd4')

	inst.api.updateReceiver('ENCRYPTION', 'ON')
	inst.api.updateChannel(1, 'TX_TYPE', 'QLXD1')

	assert.equal(inst.api.receiver.encryption, 'ON')
	assert.equal(inst.api.getChannel(1).txType, 'QLXD1')
	// Regression check from commit ea4cca4 — interference_status must remain
	// on QLX. An earlier draft of the slxplus gate narrowed it to AD/ULX/slxplus
	// only and dropped QLX.
	assert.ok('interference_status' in (captured.feedbacks ?? {}), 'QLX must keep interference_status feedback')
})

test('Axient Digital family: ENCRYPTION_MODE uses old regex branch, RSSI stays raw 0–255', () => {
	const { inst, captured } = makeFakeInstance('ad4q')

	inst.api.updateReceiver('ENCRYPTION_MODE', 'ON')
	inst.api.updateReceiver('QUADVERSITY_MODE', 'ON')
	inst.api.updateChannel(1, 'TX_MODEL', 'ADX1')
	inst.api.updateSlot(1, 1, 'SLOT_STATUS', 'LINKED.ACTIVE')
	inst.api.updateSlot(1, 1, 'SLOT_TX_MODEL', 'ADX2')
	inst.api.parseADSample(1, 'SAMPLE 1 ALL 100 050 060 070 BB 128 200 130 210')

	assert.equal(inst.api.receiver.encryption, 'ON', 'AD ENCRYPTION_MODE → encryption (regex path)')
	assert.equal(
		inst.api.receiver.encryptionMode,
		'OFF',
		'AD must NOT trigger the slxplus encryptionMode branch (family gate works)'
	)
	assert.equal(inst.api.receiver.quadversityMode, 'ON')
	assert.equal(inst.api.getChannel(1).txType, 'ADX1')
	assert.equal(inst.api.getSlot(1, 1).status, 'LINKED.ACTIVE')
	assert.equal(inst.api.getSlot(1, 1).txType, 'ADX2')
	assert.equal(inst.api.getChannel(1).antenna, 'BB')
	// rfBitmapA on AD is the raw 0–255 colour byte from the SAMPLE message.
	// If the slxplus RSSI branch ever runs for AD it would overwrite this with
	// a 0–5 bar count, corrupting the icon renderer.
	assert.equal(
		inst.api.getChannel(1).rfBitmapA,
		128,
		'AD rfBitmapA stays as raw 0–255 colour byte (slxplus RSSI branch must not fire)'
	)
	assert.equal(Object.keys(captured.presets ?? {}).length, 0, 'AD gets no presets')

	inst.setupChannelChoices()
	assert.equal(inst.CHOICES_SLOTS.length, 4 * 8, 'AD4Q slot dropdown = 4 channels × 8 slots')
})

test('SLX-D family: audio level switch, TX type, sample parser', () => {
	const { inst, captured } = makeFakeInstance('slxd4d')

	inst.api.updateChannel(1, 'AUDIO_OUT_LVL_SWITCH', 'LINE')
	inst.api.updateChannel(1, 'TX_TYPE', 'SLXD2')
	inst.api.parseSLXSample(1, 'SAMPLE 1 ALL 080 050 070')

	assert.equal(inst.api.getChannel(1).audioOutLevelSwitch, 'LINE')
	assert.equal(inst.api.getChannel(1).txType, 'SLXD2')
	assert.equal(inst.api.getChannel(1).rfLevel, -50, 'SLX parseSLXSample: rfLevel = raw 070 − 120')
	assert.equal(Object.keys(captured.presets ?? {}).length, 0, 'SLX gets no presets')
})

test('SLX-D+ family (Dante): new ENCRYPTION_MODE/REM_PAIR/AUDIO_LEVEL/slot branches + 57 presets', () => {
	const { inst, captured } = makeFakeInstance('slxd4qdanplus')

	inst.api.updateReceiver('ENCRYPTION_MODE', 'ON')
	inst.api.updateReceiver('NA_DEVICE_NAME', '{SLXD4Q-ffc8ec                  }')
	inst.api.updateChannel(1, 'REM_PAIR', 'REQUEST {MyBodypack}')
	inst.api.updateChannel(1, 'AUDIO_LEVEL_PEAK', '105')
	inst.api.updateSlot(1, 1, 'LINK_TX_MODEL', 'SLXD1+')
	inst.api.updateSlot(1, 1, 'LINK_STATUS', 'LINKED.ACTIVE')

	assert.equal(inst.api.receiver.encryptionMode, 'ON', 'slxplus ENCRYPTION_MODE handled')
	assert.equal(inst.api.receiver.encryption, 'OFF', 'slxplus must NOT pollute AD/ULX encryption field')
	assert.equal(inst.api.receiver.naDeviceName, 'SLXD4Q-ffc8ec', 'NA_DEVICE_NAME trimmed of padding')
	assert.equal(inst.api.getChannel(1).remPairState, 'REQUEST')
	assert.equal(inst.api.getChannel(1).remPairTxName, 'MyBodypack')
	assert.equal(inst.api.getChannel(1).audioLevelPeak, -15, 'AUDIO_LEVEL_PEAK = raw 105 − 120')
	assert.equal(inst.api.getSlot(1, 1).txType, 'SLXD1+')
	assert.equal(inst.api.getSlot(1, 1).status, 'LINKED.ACTIVE')

	const presetCount = Object.keys(captured.presets ?? {}).length
	// 4 channels × 13 presets (11 channel + 1 encoder + 1 Dante) + 5 device presets = 57
	assert.equal(presetCount, 57, `SLXD4QDAN+ should ship 57 presets, got ${presetCount}`)
})
