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

	if (this.model.family == 'ad' || this.model.family == 'slx' || this.model.family == 'slxplus') {
		actions['flash_channel'] = {
			name: 'Flash lights on receiver channel',
			tooltip: 'It will automatically turn off after 60 seconds',
			options: [this.CHANNELS_FIELD],
			callback: async ({ options }) => {
				this.sendCommand(`SET ${options.channel} FLASH ON`)
			},
		}
	}

	if (this.model.family == 'slxplus') {
		// SLX-D+ specific actions. Strings sourced from
		// "Shure SLXD+ Command Strings" v1.0 (2026-A).

		actions['slxplus_set_group_channel'] = {
			name: 'SLX-D+: Set Group/Channel',
			tooltip: 'Setting Group/Channel also updates the channel frequency. Wildcard "--,--" cannot be set.',
			options: [this.CHANNELS_FIELD, Fields.GroupChannel],
			callback: async (event, context) => {
				const options = event.options
				let value = await this.parseActionOption(event, 'value', context)
				if (value) {
					this.sendCommand(`SET ${options.channel} GROUP_CHANNEL {${value}}`)
				}
			},
		}

		actions['slxplus_set_meter_rate'] = {
			name: 'SLX-D+: Set channel meter rate',
			tooltip: '0 disables metering. Range 100-65535 ms.',
			options: [this.CHANNELS_A_FIELD, Fields.MeterRate],
			callback: async ({ options }) => {
				const rate = String(options.rate).padStart(5, '0')
				this.sendCommand(`SET ${options.channel} METER_RATE ${rate}`)
			},
		}

		actions['slxplus_set_encryption_mode'] = {
			name: 'SLX-D+: Set audio encryption (device)',
			tooltip: 'Linked transmitters must be re-synced via IR after toggling encryption.',
			options: [Fields.OnOff],
			callback: async ({ options }) => {
				this.sendCommand(`SET ENCRYPTION_MODE ${options.value}`)
			},
		}

		actions['slxplus_set_app_conn_enabled'] = {
			name: 'SLX-D+: Enable / disable app (Bluetooth) connection',
			options: [Fields.OnOff],
			callback: async ({ options }) => {
				// Firmware 2.0.38.9 replies with the expanded name
				// `APP_CONNECTION_ENABLED` but accepts both forms on SET.
				// Using the expanded form here keeps SET and observed
				// REP symmetric, which is nicer for debugging logs.
				this.sendCommand(`SET APP_CONNECTION_ENABLED ${options.value}`)
			},
		}

		actions['slxplus_set_audio_summing_mode'] = {
			name: 'SLX-D+: Set device audio summing mode',
			tooltip:
				'Discovered in firmware 2.0.38.9 via the per-channel ALL dump; not listed in the Strings PDF v1.0 (2026-A) but the device accepts it.',
			options: [Fields.OnOff],
			callback: async ({ options }) => {
				this.sendCommand(`SET AUDIO_SUMMING_MODE ${options.value}`)
			},
		}

		actions['slxplus_rem_pair_enable'] = {
			name: 'SLX-D+: Remote pairing — enable on channel',
			tooltip:
				'Puts the channel into BLE remote-pairing mode. The receiver will emit REM_PAIR REQUEST when it sees a transmitter advertising.',
			options: [this.CHANNELS_FIELD],
			callback: async ({ options }) => {
				this.sendCommand(`SET ${options.channel} REM_PAIR ON`)
			},
		}

		actions['slxplus_rem_pair_disable'] = {
			name: 'SLX-D+: Remote pairing — disable on channel',
			options: [this.CHANNELS_FIELD],
			callback: async ({ options }) => {
				this.sendCommand(`SET ${options.channel} REM_PAIR OFF`)
			},
		}

		actions['slxplus_rem_pair_accept'] = {
			name: 'SLX-D+: Remote pairing — accept a transmitter',
			tooltip:
				'Use the TxName from the most recent REM_PAIR REQUEST message (also exposed as variable ch_N_rem_pair_tx_name).',
			options: [this.CHANNELS_FIELD, Fields.TxName],
			callback: async (event, context) => {
				const options = event.options
				let txname = await this.parseActionOption(event, 'txname', context)
				if (txname) {
					this.sendCommand(`SET ${options.channel} REM_PAIR ACCEPT {${txname}}`)
				}
			},
		}

		actions['slxplus_rem_pair_reject'] = {
			name: 'SLX-D+: Remote pairing — reject a transmitter',
			options: [this.CHANNELS_FIELD, Fields.TxName],
			callback: async (event, context) => {
				const options = event.options
				let txname = await this.parseActionOption(event, 'txname', context)
				if (txname) {
					this.sendCommand(`SET ${options.channel} REM_PAIR REJECT {${txname}}`)
				}
			},
		}

		actions['slxplus_link_tx_reboot'] = {
			name: 'SLX-D+: Reboot the linked transmitter',
			tooltip: 'Reboots whichever transmitter is currently active on the channel.',
			options: [this.CHANNELS_FIELD],
			callback: async ({ options }) => {
				this.sendCommand(`SET ${options.channel} LINK_TX_REBOOT`)
			},
		}

		if (this.model.dante === true) {
			actions['slxplus_set_dante_chan_name'] = {
				name: 'SLX-D+ (Dante): Set Dante channel name',
				tooltip: 'Allowed chars: A-Z a-z 0-9 - (no leading/trailing hyphen). 1-31 chars.',
				options: [this.CHANNELS_FIELD, Fields.DanteChanName],
				callback: async (event, context) => {
					const options = event.options
					let name = await this.parseActionOption(event, 'name', context)
					if (name) {
						this.sendCommand(`SET ${options.channel} NA_CHAN_NAME {${name}}`)
					}
				},
			}

			actions['slxplus_set_net_settings'] = {
				name: 'SLX-D+ (Dante): Set network settings',
				tooltip:
					'Changing Shure Control (SC) settings requires reconnecting at the new IP. Changing Dante (D1/D2) settings causes the device to REBOOT.',
				options: [Fields.NetInterface, Fields.NetIpMode, Fields.IpAddress, Fields.SubnetMask, Fields.Gateway],
				callback: async (event, context) => {
					const options = event.options
					let ip = await this.parseActionOption(event, 'ipaddr', context)
					let mask = await this.parseActionOption(event, 'mask', context)
					let gw = await this.parseActionOption(event, 'gw', context)
					if (ip != null && mask != null && gw != null) {
						this.sendCommand(`SET NET_SETTINGS ${options.iface} ${options.ipmode} ${ip} ${mask} ${gw}`)
					}
				},
			}
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
