import { combineRgb } from '@companion-module/base'

/**
 * Drag-and-drop presets for the Shure SLX-D+ family (`family === 'slxplus'`).
 *
 * Each preset is a self-contained button configuration (style + actions +
 * feedbacks) that the user can drop onto an empty Companion button. The
 * presets only wire together actions/feedbacks/variables that are already
 * registered elsewhere in this module — they don't introduce any new
 * back-end mechanism.
 *
 * For non-slxplus models (ULX / QLX / AD / SLX) the function clears the
 * preset list, so the upstream behaviour for those families is preserved.
 *
 * @since 2.4.0
 */

const COLOR_FG = combineRgb(255, 255, 255)
const COLOR_BG_DARK = combineRgb(20, 20, 20)
const COLOR_BG_ACCENT = combineRgb(40, 40, 60)
const COLOR_GREEN = combineRgb(0, 200, 0)
const COLOR_YELLOW = combineRgb(200, 200, 0)
const COLOR_GREY = combineRgb(80, 80, 80)
const COLOR_RED = combineRgb(200, 0, 0)
const COLOR_ORANGE = combineRgb(255, 165, 0)
const COLOR_BLACK = combineRgb(0, 0, 0)

function baseStyle(text) {
	return {
		text,
		size: 'auto',
		color: COLOR_FG,
		bgcolor: COLOR_BG_DARK,
		alignment: 'center:center',
	}
}

function buildChannelPresets(n, model) {
	const presets = {}
	const category = `SLX-D+ Channel ${n}`
	const channelId = String(n)
	const slotPad = '01'
	const slotComposite = `${n}:1`

	// 1. Channel Status Display (advanced sample feedback)
	presets[`ch${n}_status_display`] = {
		type: 'button',
		category,
		name: `CH${n} Status Display`,
		style: baseStyle(`CH${n}`),
		steps: [{ down: [], up: [] }],
		feedbacks: [
			{
				feedbackId: 'sample',
				options: {
					channel: channelId,
					labels: ['name', 'frequency', 'audioGain', 'txType'],
					icons: ['battery', 'rf', 'audio'],
					barlevel: 2,
				},
			},
		],
	}

	// 2. Linked TX status (Bodypack vs Handheld) — colour reflects link state
	presets[`ch${n}_link_status`] = {
		type: 'button',
		category,
		name: `CH${n} Link Status (Bodypack / Handheld)`,
		style: {
			...baseStyle(`CH${n}\\n$(shure-wireless:slot_${n}-${slotPad}_tx_model)`),
			bgcolor: COLOR_GREY,
		},
		steps: [
			{
				down: [{ actionId: 'flash_channel', options: { channel: channelId } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'slot_link_active',
				options: { slot: slotComposite },
				style: { bgcolor: COLOR_GREEN, color: COLOR_BLACK },
			},
			{
				feedbackId: 'slot_link_inactive',
				options: { slot: slotComposite },
				style: { bgcolor: COLOR_YELLOW, color: COLOR_BLACK },
			},
			{
				feedbackId: 'slot_link_empty',
				options: { slot: slotComposite },
				style: { bgcolor: COLOR_GREY, color: COLOR_FG },
			},
		],
	}

	// 3. Frequency display + edit
	presets[`ch${n}_frequency`] = {
		type: 'button',
		category,
		name: `CH${n} Frequency`,
		style: baseStyle(`CH${n}\\n$(shure-wireless:ch_${n}_frequency)`),
		steps: [
			{
				down: [
					{
						actionId: 'channel_frequency',
						options: { channel: channelId, value: '470.000' },
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	// 4. Battery indicator (channel-scoped TX_BATT_*) with alert feedback
	presets[`ch${n}_battery`] = {
		type: 'button',
		category,
		name: `CH${n} Battery`,
		style: baseStyle(`CH${n}\\n$(shure-wireless:ch_${n}_battery_runtime)\\n$(shure-wireless:ch_${n}_battery_bars)/5`),
		steps: [{ down: [], up: [] }],
		feedbacks: [
			{
				feedbackId: 'battery_level',
				options: { channel: channelId, barlevel: 2 },
				style: { bgcolor: COLOR_RED, color: COLOR_FG },
			},
		],
	}

	// 5. Audio gain with +3 dB increment on press
	presets[`ch${n}_audio_gain_inc`] = {
		type: 'button',
		category,
		name: `CH${n} Audio Gain +3dB`,
		style: baseStyle(`CH${n}\\n$(shure-wireless:ch_${n}_audio_gain)\\n+3 dB`),
		steps: [
			{
				down: [{ actionId: 'channel_increasegain', options: { channel: channelId, gain: '3' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets[`ch${n}_audio_gain_dec`] = {
		type: 'button',
		category,
		name: `CH${n} Audio Gain -3dB`,
		style: baseStyle(`CH${n}\\n$(shure-wireless:ch_${n}_audio_gain)\\n-3 dB`),
		steps: [
			{
				down: [{ actionId: 'channel_decreasegain', options: { channel: channelId, gain: '3' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	// 6. Encryption error indicator
	presets[`ch${n}_encryption_error`] = {
		type: 'button',
		category,
		name: `CH${n} Encryption Error Indicator`,
		style: { ...baseStyle(`CH${n}\\n🔒`), bgcolor: COLOR_BG_ACCENT },
		steps: [{ down: [], up: [] }],
		feedbacks: [
			{
				feedbackId: 'encryption_error',
				options: { channel: channelId },
				style: { bgcolor: COLOR_RED, color: COLOR_FG },
			},
		],
	}

	// 7. Interference indicator
	presets[`ch${n}_interference`] = {
		type: 'button',
		category,
		name: `CH${n} Interference Indicator`,
		style: { ...baseStyle(`CH${n}\\n⚠`), bgcolor: COLOR_BG_ACCENT },
		steps: [{ down: [], up: [] }],
		feedbacks: [
			{
				feedbackId: 'interference_status',
				options: { channel: channelId },
				style: { bgcolor: COLOR_RED, color: COLOR_FG },
			},
		],
	}

	// 8. Flash / Identify channel
	presets[`ch${n}_flash`] = {
		type: 'button',
		category,
		name: `CH${n} Flash / Identify`,
		style: baseStyle(`🔆\\nCH${n}`),
		steps: [
			{
				down: [{ actionId: 'flash_channel', options: { channel: channelId } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	// 9. Reboot the linked transmitter
	presets[`ch${n}_link_tx_reboot`] = {
		type: 'button',
		category,
		name: `CH${n} Reboot Linked TX`,
		style: { ...baseStyle(`↻\\nReboot\\nCH${n} TX`), bgcolor: COLOR_BG_ACCENT },
		steps: [
			{
				down: [{ actionId: 'slxplus_link_tx_reboot', options: { channel: channelId } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	// 10. Remote-pair listener — press to enable BLE pairing, lights up while waiting
	presets[`ch${n}_rem_pair_listen`] = {
		type: 'button',
		category,
		name: `CH${n} Remote Pair: listen`,
		style: { ...baseStyle(`📡\\nPair\\nCH${n}`), bgcolor: COLOR_BG_ACCENT },
		steps: [
			{
				down: [{ actionId: 'slxplus_rem_pair_enable', options: { channel: channelId } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'rem_pair_request',
				options: { channel: channelId },
				style: { bgcolor: COLOR_ORANGE, color: COLOR_BLACK },
			},
		],
	}

	// 11. Rotary encoder for audio gain (Stream Deck Plus / Loupedeck).
	// Falls back to a regular pushbutton on non-encoder surfaces — the button
	// still works (the push action resets gain to 0 dB) but rotation is ignored.
	presets[`ch${n}_gain_encoder`] = {
		type: 'button',
		category: `SLX-D+ Channel ${n} (Encoder)`,
		name: `CH${n} Gain Encoder (turn ±1 dB, push = reset to 0)`,
		style: baseStyle(`CH${n}\\n$(shure-wireless:ch_${n}_audio_gain)\\ndB`),
		options: { rotaryActions: true },
		steps: [
			{
				down: [{ actionId: 'channel_setaudiogain', options: { channel: channelId, gain: '0' } }],
				up: [],
				rotate_left: [{ actionId: 'channel_decreasegain', options: { channel: channelId, gain: '1' } }],
				rotate_right: [{ actionId: 'channel_increasegain', options: { channel: channelId, gain: '1' } }],
			},
		],
		feedbacks: [],
	}

	// 12. Dante channel name (only on Dante-equipped models)
	if (model.dante === true) {
		presets[`ch${n}_dante_name`] = {
			type: 'button',
			category,
			name: `CH${n} Dante Channel Name`,
			style: baseStyle(`Dante CH${n}\\n$(shure-wireless:ch_${n}_na_chan_name)`),
			steps: [
				{
					down: [
						{
							actionId: 'slxplus_set_dante_chan_name',
							options: { channel: channelId, name: `CH${n}` },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	return presets
}

function buildDevicePresets(model) {
	const presets = {}
	const category = 'SLX-D+ Device'

	presets['device_flash'] = {
		type: 'button',
		category,
		name: 'Device: Flash / Identify',
		style: baseStyle('🔆\\nIdentify'),
		steps: [{ down: [{ actionId: 'flash_lights', options: {} }], up: [] }],
		feedbacks: [],
	}

	presets['device_encryption_on'] = {
		type: 'button',
		category,
		name: 'Device: Encryption ON',
		style: { ...baseStyle('🔒\\nEncrypt\\nON'), bgcolor: COLOR_BG_ACCENT },
		steps: [
			{
				down: [{ actionId: 'slxplus_set_encryption_mode', options: { value: 'ON' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['device_encryption_off'] = {
		type: 'button',
		category,
		name: 'Device: Encryption OFF',
		style: { ...baseStyle('🔓\\nEncrypt\\nOFF'), bgcolor: COLOR_BG_ACCENT },
		steps: [
			{
				down: [{ actionId: 'slxplus_set_encryption_mode', options: { value: 'OFF' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['device_app_on'] = {
		type: 'button',
		category,
		name: 'Device: App Connection ON',
		style: { ...baseStyle('📱\\nApp\\nON'), bgcolor: COLOR_BG_ACCENT },
		steps: [
			{
				down: [{ actionId: 'slxplus_set_app_conn_enabled', options: { value: 'ON' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['device_app_off'] = {
		type: 'button',
		category,
		name: 'Device: App Connection OFF',
		style: { ...baseStyle('📱\\nApp\\nOFF'), bgcolor: COLOR_BG_ACCENT },
		steps: [
			{
				down: [{ actionId: 'slxplus_set_app_conn_enabled', options: { value: 'OFF' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	return presets
}

/**
 * INTERNAL: register the preset definitions for the current instance.
 *
 * Bound to the instance in `src/index.js` and called from `init()` plus
 * `configUpdated()` parallel to the other `update*` functions.
 *
 * @access protected
 * @since 2.4.0
 */
export function updatePresets() {
	if (!this.model || this.model.family !== 'slxplus') {
		// Non-slxplus models keep the existing (empty) preset behaviour.
		this.setPresetDefinitions({})
		return
	}

	const presets = {}

	for (let n = 1; n <= this.model.channels; n++) {
		Object.assign(presets, buildChannelPresets(n, this.model))
	}

	Object.assign(presets, buildDevicePresets(this.model))

	this.setPresetDefinitions(presets)
}
