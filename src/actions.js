import { Fields, Regex } from './setup.js'

/**
 * INTERNAL: Set the available actions.
 *
 * @access protected
 * @since 1.0.0
 */
export function updateActions() {
	this.setupChannelChoices()

	let actions = {}

	actions['set_channel_name'] = {
		name: 'Set channel name',
		options: [this.CHANNELS_FIELD, Fields.Name],
		callback: async (event, context) => {
			const options = event.options
			let name = await this.parseActionOption(event, 'name', context, Regex.Name)
			if (name) {
				this.sendCommand(`SET ${options.channel} CHAN_NAME {${name}}`)
			}
		},
	}

	if (this.model.family == 'ulx' || this.model.family == 'ad') {
		actions['channel_mute'] = {
			name: 'Mute or unmute channel',
			options: [this.CHANNELS_A_FIELD, Fields.Mute],
			callback: async ({ options }) => {
				this.sendCommand(`SET ${options.channel} AUDIO_MUTE ${options.choice}`)
			},
		}
	}

	actions['channel_setaudiogain'] = {
		name: 'Set audio gain of channel',
		options: [this.CHANNELS_A_FIELD, Fields.GainSet],
		callback: async (event, context) => {
			const options = event.options
			let gainValue = await this.parseActionOption(event, 'gain', context, Regex.GainSet)
			if (gainValue) {
				gainValue = 18 + parseInt(gainValue)
				this.sendCommand(`SET ${options.channel} AUDIO_GAIN ${gainValue}`)
			}
		},
	}

	actions['channel_increasegain'] = {
		name: 'Increase audio gain of channel',
		options: [this.CHANNELS_A_FIELD, Fields.GainIncrement],
		callback: async (event, context) => {
			const options = event.options
			let gainIncrement = await this.parseActionOption(event, 'gain', context, Regex.GainIncrement)
			if (gainIncrement) {
				this.sendCommand(`SET ${options.channel} AUDIO_GAIN INC ${gainIncrement}`)
			}
		},
	}

	actions['channel_decreasegain'] = {
		name: 'Decrease audio gain of channel',
		options: [this.CHANNELS_A_FIELD, Fields.GainIncrement],
		callback: async (event, context) => {
			const options = event.options
			let gainIncrement = await this.parseActionOption(event, 'gain', context, Regex.GainIncrement)
			if (gainIncrement) {
				this.sendCommand(`SET ${options.channel} AUDIO_GAIN DEC ${gainIncrement}`)
			}
		},
	}

	actions['channel_frequency'] = {
		name: 'Set frequency of channel',
		options: [this.CHANNELS_FIELD, Fields.Frequency],
		callback: async (event, context) => {
			const options = event.options
			let freq = await this.parseActionOption(event, 'value', context, Regex.Frequency)
			if (freq) {
				this.sendCommand(`SET ${options.channel} FREQUENCY ${freq.replace('.', '')}`)
			}
			// this.sendCommand(`SET ${options.channel} FREQUENCY ${options.value.replace('.', '')}`)
		},
	}

	if (this.model.family != 'qlx') {
		actions['flash_lights'] = {
			name: 'Flash lights on receiver',
			tooltip: 'It will automatically turn off after 30 seconds',
			options: [],
			callback: async ({ options }) => {
				this.sendCommand(`SET FLASH ON`)
			},
		}
	}

	if (this.model.family == 'ad' || this.model.family == 'slx') {
		actions['flash_channel'] = {
			name: 'Flash lights on receiver channel',
			tooltip: 'It will automatically turn off after 60 seconds',
			options: [this.CHANNELS_FIELD],
			callback: async ({ options }) => {
				this.sendCommand(`SET ${options.channel} FLASH ON`)
			},
		}
	}

	if (this.model.family == 'ad') {
		actions['slot_rf_output'] = {
			name: 'Set slot RF output (ADX)',
			options: [this.SLOTS_A_FIELD, Fields.RfOutput],
			callback: async ({ options }) => {
				let slot = options.slot.split(':')
				this.sendCommand(`SET ${slot[0]} SLOT_RF_OUTPUT ${slot[1]} ${options.onoff}`)
			},
		}
		actions['slot_rf_power'] = {
			name: 'Set slot RF power level (ADX)',
			options: [this.SLOTS_A_FIELD, Fields.RfPower],
			callback: async ({ options }) => {
				let slot = options.slot.split(':')
				this.sendCommand(`SET ${slot[0]} SLOT_RF_POWER_MODE ${slot[1]} ${options.power}`)
			},
		}
	}

	this.setActionDefinitions(actions)
}
