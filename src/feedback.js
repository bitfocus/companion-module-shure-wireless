import { combineRgb } from '@companion-module/base'
import { Fields } from './setup.js'

/**
 * INTERNAL: initialize feedbacks.
 *
 * @access protected
 * @since 1.0.0
 */
export function updateFeedbacks() {
	// feedbacks
	let feedbacks = {}

	let labelChoices, labelDefault, iconChoices, iconDefault

	switch (this.model.family) {
		case 'qlx':
		case 'ulx':
			labelChoices = [
				{ id: 'name', label: 'Channel Name' },
				{ id: 'txDeviceId', label: 'TX Device ID' },
				{ id: 'frequency', label: 'Frequency' },
				{ id: 'groupChan', label: 'Group/Channel' },
				{ id: 'audioGain', label: 'Audio Gain' },
				{ id: 'txType', label: 'TX Model' },
				{ id: 'txPowerLevel', label: 'TX Power Level' },
				{ id: 'batteryType', label: 'Battery Type' },
				{ id: 'batteryRuntime', label: 'Battery Runtime' },
			]
			labelDefault = ['name', 'frequency', 'txType', 'txPowerLevel']
			iconChoices = [
				{ id: 'battery', label: 'Battery' },
				{ id: 'locks', label: 'Locks' },
				{ id: 'rf', label: 'RF' },
				{ id: 'audio', label: 'Audio Level' },
				{ id: 'encryption', label: 'Encryption' },
			]
			iconDefault = ['battery', 'locks', 'rf', 'audio', 'encryption']
			break
		case 'slx':
			labelChoices = [
				{ id: 'name', label: 'Channel Name' },
				{ id: 'frequency', label: 'Frequency' },
				{ id: 'groupChan', label: 'Group/Channel' },
				{ id: 'audioGain', label: 'Audio Gain' },
				{ id: 'txType', label: 'TX Model' },
				{ id: 'batteryRuntime', label: 'Battery Runtime' },
			]
			labelDefault = ['name', 'frequency', 'audioGain', 'txType']
			iconChoices = [
				{ id: 'battery', label: 'Battery' },
				{ id: 'rf', label: 'RF' },
				{ id: 'audio', label: 'Audio Level' },
			]
			iconDefault = ['battery', 'rf', 'audio']
			break
		case 'ad':
			labelChoices = [
				{ id: 'name', label: 'Channel Name' },
				{ id: 'txDeviceId', label: 'TX Device ID' },
				{ id: 'frequency', label: 'Frequency' },
				{ id: 'groupChan', label: 'Group/Channel' },
				{ id: 'audioGain', label: 'Audio Gain' },
				{ id: 'txType', label: 'TX Model' },
				{ id: 'txPowerLevel', label: 'TX Power Level' },
				{ id: 'batteryType', label: 'Battery Type' },
				{ id: 'batteryRuntime', label: 'Battery Runtime' },
			]
			labelDefault = ['name', 'frequency', 'txType', 'txPowerLevel']
			iconChoices = [
				{ id: 'battery', label: 'Battery' },
				{ id: 'locks', label: 'Locks' },
				{ id: 'rf', label: 'RF' },
				{ id: 'audio', label: 'Audio Level' },
				{ id: 'encryption', label: 'Encryption' },
				{ id: 'quality', label: 'Quality' },
			]
			iconDefault = ['battery', 'locks', 'rf', 'audio', 'encryption', 'quality']
			break
	}

	feedbacks['sample'] = {
		type: 'advanced',
		name: 'Channel Status Display',
		description: "Provide a visual display of the channel's status.",
		options: [
			this.CHANNELS_FIELD,
			{
				type: 'multidropdown',
				label: 'Label Data',
				id: 'labels',
				default: labelDefault,
				choices: labelChoices,
			},
			{
				type: 'multidropdown',
				label: 'Icons',
				id: 'icons',
				default: iconDefault,
				choices: iconChoices,
			},
			Fields.BatteryLevel,
		],
		callback: (event) => {
			let opt = event.options
			let channel = this.api.getChannel(parseInt(opt.channel))
			let out = {
				alignment: 'left:top',
				imageBuffers: [{ buffer: this.api.getIcon(opt, event.image) }],
				size: '7',
				text: '',
			}

			let addLabelData = function (item, channel, out) {
				switch (item) {
					case 'name':
						out.text += channel.name + '\\n'
						break
					case 'txDeviceId':
						out.text += channel.txDeviceId + '\\n'
						break
					case 'frequency':
						out.text += channel.frequency + '\\n'
						break
					case 'groupChan':
						out.text += channel.groupChan + '\\n'
						break
					case 'audioGain':
						out.text += (channel.audioGain > 0 ? '+' : '') + channel.audioGain.toString() + ' dB\\n'
						break
					case 'txType':
						out.text += channel.txType + '\\n'
						break
					case 'txPowerLevel':
						out.text += channel.txPowerLevel == 255 ? 'Unknown\\n' : channel.txPowerLevel + ' mW\\n'
						break
					case 'batteryType':
						out.text += channel.batteryType + '\\n'
						break
					case 'batteryRuntime':
						out.text += channel.batteryRuntime2 + '\\n'
						break
				}
			}

			if (typeof opt.labels === 'string') {
				addLabelData(opt.labels, channel, out)
			} else if (Array.isArray(opt.labels)) {
				opt.labels.forEach((item) => addLabelData(item, channel, out))
			}

			return out
		},
	}

	feedbacks['battery_level'] = {
		type: 'boolean',
		name: 'Battery Level',
		description: 'If the battery bar drops to or below a certain value, change the color of the button.',
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		options: [this.CHANNELS_FIELD, Fields.BatteryLevel],
		callback: ({ options }) => {
			if (this.api.getChannel(parseInt(options.channel)).batteryBars <= options.barlevel) {
				return true
			} else {
				return false
			}
		},
	}

	if (this.model.family != 'slx') {
		if (this.model.family != 'qlx') {
			feedbacks['channel_muted'] = {
				type: 'boolean',
				label: 'Channel Muted',
				description: 'If the selected channel is muted, change the color of the button.',
				defaultStyle: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(128, 0, 0),
				},
				options: [this.CHANNELS_FIELD],
				callback: ({ options }) => {
					if (this.api.getChannel(parseInt(options.channel)).audioMute == 'ON') {
						return true
					} else {
						return false
					}
				},
			}
		}

		feedbacks['transmitter_muted'] = {
			type: 'boolean',
			name: 'Transmitter Muted',
			description: "If the selected channel's transmitter is muted, change the color of the button.",
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(128, 0, 0),
			},
			options: [this.CHANNELS_FIELD],
			callback: ({ options }) => {
				if (this.api.getChannel(parseInt(options.channel)).txMuteStatus == 'ON') {
					return true
				} else {
					return false
				}
			},
		}

		feedbacks['interference_status'] = {
			type: 'boolean',
			name: 'Interference Status',
			description: 'If the selected channel gets interference, change the color of the button.',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			options: [this.CHANNELS_FIELD],
			callback: ({ options }) => {
				if (this.api.getChannel(parseInt(options.channel)).interferenceStatus == 'DETECTED') {
					return true
				} else {
					return false
				}
			},
		}
	}

	feedbacks['channel_frequency'] = {
		type: 'boolean',
		name: 'Channel Frequency',
		description: "If the selected channel's frequency is set, change the color of the button.",
		defaultStyle: {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 255, 0),
		},
		options: [this.CHANNELS_FIELD, Fields.Frequency],
		callback: ({ options }) => {
			if (this.api.getChannel(parseInt(options.channel)).frequency == options.value) {
				return true
			} else {
				return false
			}
		},
	}

	feedbacks['channel_gain'] = {
		type: 'boolean',
		name: 'Channel Gain',
		description: "If the selected channel's gain is set, change the color of the button.",
		defaultStyle: {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 255, 0),
		},
		options: [this.CHANNELS_FIELD, Fields.GainSet],
		callback: ({ options }) => {
			if (this.api.getChannel(parseInt(options.channel)).audioGain == options.gain) {
				return true
			} else {
				return false
			}
		},
	}

	feedbacks['transmitter_turned_off'] = {
		type: 'boolean',
		name: 'Transmitter Turned Off',
		description: "If the selected channel's transmitter is powered off, change the color of the button.",
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 128),
		},
		options: [this.CHANNELS_FIELD],
		callback: ({ options }) => {
			if (
				this.api.getChannel(parseInt(options.channel)).txType == 'Unknown' ||
				this.api.getChannel(parseInt(options.channel)).batteryBars == 255
			) {
				return true
			} else {
				return false
			}
		},
	}

	if (this.model.family == 'ad') {
		feedbacks['slot_is_active'] = {
			type: 'boolean',
			name: 'Slot is Active',
			description: "If the selected slot's transmitter is active to the channel, change the color of the button",
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			options: [this.SLOTS_FIELD],
			callback: ({ options }) => {
				let slot = options.slot.split(':')
				let ch = this.api.getChannel(parseInt(slot[0]))
				slot = this.api.getSlot(parseInt(slot[0]), parseInt(slot[1]))
				if (
					ch.txDeviceId == slot.txDeviceId &&
					(slot.status == 'STANDARD' || (slot.status.match(/LINKED/) && slot.txRfOutput == 'RF_ON'))
				) {
					return true
				} else {
					return false
				}
			},
		}
		feedbacks['slot_status'] = {
			type: 'boolean',
			name: 'Slot Status',
			description: "If the selected slot's status is set, change the color of the button",
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			options: [this.SLOTS_FIELD, Fields.SlotStatus],
			callback: ({ options }) => {
				let slot = options.slot.split(':')
				if (this.api.getSlot(parseInt(slot[0]), parseInt(slot[1])).status == options.value) {
					return true
				} else {
					return false
				}
			},
		}

		feedbacks['slot_rf_output'] = {
			type: 'boolean',
			name: 'Slot RF Output',
			description: "If the selected slot's transmitter RF is set, change the color of the button.",
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(100, 255, 0),
			},
			options: [this.SLOTS_FIELD, Fields.RfOutput],
			callback: ({ options }) => {
				let slot = options.slot.split(':')
				if (this.api.getSlot(parseInt(slot[0]), parseInt(slot[1])).txRfOutput == options.onoff) {
					return true
				} else {
					return false
				}
			},
		}

		feedbacks['slot_rf_power'] = {
			type: 'boolean',
			name: 'Slot RF Power',
			description: "If the selected slot's transmitter power level is set, change the color of the button.",
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(100, 255, 0),
			},
			options: [this.SLOTS_FIELD, Fields.RfPower],
			callback: ({ options }) => {
				let slot = options.slot.split(':')
				if (this.api.getSlot(parseInt(slot[0]), parseInt(slot[1])).txPowerMode == parseInt(options.power)) {
					return true
				} else {
					return false
				}
			},
		}
	}

	this.setFeedbackDefinitions(feedbacks)
}
