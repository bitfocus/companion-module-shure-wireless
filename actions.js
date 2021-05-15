module.exports = {
	/**
	 * INTERNAL: Set the available actions.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	 initActions() {
		this.setupChannelChoices()

		let actions = {}

		actions['set_channel_name'] = {
			label: 'Set channel name',
			options: [this.CHANNELS_FIELD, this.NAME_FIELD],
			callback: ({ options }) => {
				this.sendCommand(`SET ${options.channel} CHAN_NAME {${options.name.substr(0, 8)}}`)
			},
		}

		if (this.model.family == 'ulx' || this.model.family == 'ad') {
			actions['channel_mute'] = {
				label: 'Mute or unmute channel',
				options: [this.CHANNELS_A_FIELD, this.MUTE_FIELD],
				callback: ({ options }) => {
					this.sendCommand(`SET ${options.channel} AUDIO_MUTE ${options.choice}`)
				},
			}
		}

		actions['channel_setaudiogain'] = {
			label: 'Set audio gain of channel',
			options: [this.CHANNELS_A_FIELD, this.GAIN_SET_FIELD(this.model.family)],
			callback: ({ options }) => {
				let value = options.gain
				if (this.model.family == 'mxw') {
					value += 25
				} else {
					value += 18
				}
				this.sendCommand(`SET ${options.channel} AUDIO_GAIN ${value}`)
			},
		}

		actions['channel_increasegain'] = {
			label: 'Increase audio gain of channel',
			options: [this.CHANNELS_A_FIELD, this.GAIN_INC_FIELD(this.model.family)],
			callback: ({ options }) => {
				this.sendCommand(`SET ${options.channel} AUDIO_GAIN INC ${options.gain}`)
			},
		}

		actions['channel_decreasegain'] = {
			label: 'Decrease audio gain of channel',
			options: [this.CHANNELS_A_FIELD, this.GAIN_INC_FIELD(this.model.family)],
			callback: ({ options }) => {
				this.sendCommand(`SET ${options.channel} AUDIO_GAIN DEC ${options.gain}`)
			},
		}

		if (this.model.family != 'mxw') {
			actions['channel_frequency'] = {
				label: 'Set frequency of channel',
				options: [this.CHANNELS_FIELD, this.FREQUENCY_FIELD],
				callback: ({ options }) => {
					this.sendCommand(`SET ${options.channel} FREQUENCY ${options.value.replace('.', '')}`)
				},
			}
		}

		if (this.model.family != 'qlx') {
			actions['flash_lights'] = {
				label: 'Flash lights on receiver',
				tooltip: 'It will automatically turn off after 30 seconds',
				callback: ({ options }) => {
					this.sendCommand(`SET FLASH ON`)
				},
			}
		}

		if (this.model.family == 'ad' || this.model.family == 'mxw' || this.model.family == 'slx') {
			actions['flash_channel'] = {
				label: 'Flash lights on receiver channel',
				tooltip: 'It will automatically turn off after 60 seconds',
				options: [this.CHANNELS_FIELD],
				callback: ({ options }) => {
					this.sendCommand(`SET ${options.channel} FLASH ON`)
				},
			}
		}

		if (this.model.family == 'ad') {
			actions['slot_rf_output'] = {
				label: 'Set slot RF output (ADX)',
				options: [this.SLOTS_A_FIELD, this.RFOUTPUT_FIELD],
				callback: ({ options }) => {
					let slot = options.slot.split(':')
					this.sendCommand(`SET ${slot[0]} SLOT_RF_OUTPUT ${slot[1]} ${options.onoff}`)
				},
			}
			actions['slot_rf_power'] = {
				label: 'Set slot RF power level (ADX)',
				options: [this.SLOTS_A_FIELD, this.RFPOWER_FIELD],
				callback: ({ options }) => {
					let slot = options.slot.split(':')
					this.sendCommand(`SET ${slot[0]} SLOT_RF_POWER_MODE ${slot[1]} ${options.power}`)
				},
			}
		}

		this.setActions(actions)
	},
}
