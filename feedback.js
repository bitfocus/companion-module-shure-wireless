module.exports = {

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = {};

		if (this.model.family != 'mxw') {
			let labelChoices, labelDefault, iconChoices, iconDefault;

			switch (this.model.family) {
				case 'qlx':
				case 'ulx':
					labelChoices = [
						{id: 'name',           label: 'Channel Name'},
						{id: 'txDeviceId',     label: 'TX Device ID'},
						{id: 'frequency',      label: 'Frequency'},
						{id: 'groupChan',      label: 'Group/Channel'},
						{id: 'audioGain',      label: 'Audio Gain'},
						{id: 'txType',         label: 'TX Model'},
						{id: 'txPowerLevel',   label: 'TX Power Level'},
						{id: 'batteryType',    label: 'Battery Type'},
						{id: 'batteryRuntime', label: 'Battery Runtime'}
					];
					labelDefault = ['name', 'frequency', 'txType', 'txPowerLevel'];
					iconChoices = [
						{id: 'battery',    label: 'Battery'},
						{id: 'locks',      label: 'Locks'},
						{id: 'rf',         label: 'RF'},
						{id: 'audio',      label: 'Audio Level'},
						{id: 'encryption', label: 'Encryption'}
					];
					iconDefault = ['battery', 'locks', 'rf', 'audio', 'encryption'];
					break;
				case 'slx':
					labelChoices = [
						{id: 'name',           label: 'Channel Name'},
						{id: 'frequency',      label: 'Frequency'},
						{id: 'groupChan',      label: 'Group/Channel'},
						{id: 'audioGain',      label: 'Audio Gain'},
						{id: 'txType',         label: 'TX Model'},
						{id: 'batteryRuntime', label: 'Battery Runtime'}
					];
					labelDefault = ['name', 'frequency', 'audioGain', 'txType'];
					iconChoices = [
						{id: 'battery',    label: 'Battery'},
						{id: 'rf',         label: 'RF'},
						{id: 'audio',      label: 'Audio Level'}
					];
					iconDefault = ['battery', 'rf', 'audio'];
					break;
				case 'ad':
					labelChoices = [
						{id: 'name',           label: 'Channel Name'},
						{id: 'txDeviceId',     label: 'TX Device ID'},
						{id: 'frequency',      label: 'Frequency'},
						{id: 'groupChan',      label: 'Group/Channel'},
						{id: 'audioGain',      label: 'Audio Gain'},
						{id: 'txType',         label: 'TX Model'},
						{id: 'txPowerLevel',   label: 'TX Power Level'},
						{id: 'batteryType',    label: 'Battery Type'},
						{id: 'batteryRuntime', label: 'Battery Runtime'}
					];
					labelDefault = ['name', 'frequency', 'txType', 'txPowerLevel'];
					iconChoices = [
						{id: 'battery',    label: 'Battery'},
						{id: 'locks',      label: 'Locks'},
						{id: 'rf',         label: 'RF'},
						{id: 'audio',      label: 'Audio Level'},
						{id: 'encryption', label: 'Encryption'},
						{id: 'quality',    label: 'Quality'}
					];
					iconDefault = ['battery', 'locks', 'rf', 'audio', 'encryption', 'quality'];
					break;
			}

			feedbacks['sample'] = {
				label: 'Channel Status Display',
				description: "Provide a visual display of the channel's status.",
				options: [
					this.CHANNELS_FIELD,
					{
						type: 'dropdown',
						label: 'Label Data',
						id: 'labels',
						default: labelDefault,
						multiple: true,
						maximumSelectionLength: 5,
						choices: labelChoices
					},
					{
						type: 'dropdown',
						label: 'Icons',
						id: 'icons',
						default: iconDefault,
						multiple: true,
						maximumSelectionLength: 4,
						choices: iconChoices
					},
					this.BATTERY_LEVEL_FIELD
				],
				callback: (feedback, bank) => {
					var opt = feedback.options;
					var channel = this.api.getChannel(parseInt(opt.channel));
					var out = {
						img64: this.api.getIcon(feedback.options),
						text:  ''
					};

					let addLabelData = function (item, channel, out) {
						switch (item) {
							case 'name':
								out.text += channel.name + '\\n';
								break;
							case 'txDeviceId':
								out.text += channel.txDeviceId + '\\n';
								break;
							case 'frequency':
								out.text += channel.frequency + '\\n';
								break;
							case 'groupChan':
								out.text += channel.groupChan + '\\n';
								break;
							case 'audioGain':
								out.text += (channel.audioGain > 0 ? '+' : '') + channel.audioGain.toString() + ' dB\\n';
								break;
							case 'txType':
								out.text += channel.txType + '\\n';
								break;
							case 'txPowerLevel':
								out.text += (channel.txPowerLevel == 255 ? 'Unknown' : channel.txPowerLevel + ' mW\\n');
								break;
							case 'batteryType':
								out.text += channel.batteryType + '\\n';
								break;
							case 'batteryRuntime':
								out.text += channel.batteryRuntime2 + '\\n';
								break;
						}
					}

					if (typeof opt.labels === 'string') {
						addLabelData(opt.labels, channel, out);
					}
					else if (Array.isArray(opt.labels)) {
						opt.labels.forEach( item => addLabelData(item, channel, out) );
					}

					return out;
				}
			};
		}

		feedbacks['battery_level'] = {
			label: 'Battery Level',
			description: 'If the battery bar drops to or below a certain value, change the color of the button.',
			options: [
				this.CHANNELS_FIELD,
				this.BATTERY_LEVEL_FIELD,
				this.FG_COLOR_FIELD(this.rgb(255,255,255)),
				this.BG_COLOR_FIELD(this.rgb(255,0,0))
			],
			callback: (feedback, bank) => {
				if (this.api.getChannel(parseInt(feedback.options.channel)).batteryBars <= feedback.options.barlevel) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		if (this.model.family != 'slx') {
			feedbacks['channel_muted'] = {
				label: 'Channel Muted',
				description: 'If the selected channel is muted, change the color of the button.',
				options: [
					this.CHANNELS_FIELD,
					this.FG_COLOR_FIELD(this.rgb(255,255,255)),
					this.BG_COLOR_FIELD(this.rgb(128,0,0))
				],
				callback: (feedback, bank) => {
					if (this.api.getChannel(parseInt(feedback.options.channel)).audioMute == 'ON') {
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};

			if (this.model.family != 'mxw') {
				feedbacks['transmitter_muted'] = {
					label: 'Transmitter Muted',
					description: 'If the selected channel\'s transmitter is muted, change the color of the button.',
					options: [
						this.CHANNELS_FIELD,
						this.FG_COLOR_FIELD(this.rgb(255,255,255)),
						this.BG_COLOR_FIELD(this.rgb(128,0,0))
					],
					callback: (feedback, bank) => {
						if (this.api.getChannel(parseInt(feedback.options.channel)).txMuteStatus == 'ON') {
							return {
								color: feedback.options.fg,
								bgcolor: feedback.options.bg
							};
						}
					}
				};
			}

			feedbacks['interference_status'] = {
				label: 'Interference Status',
				description: 'If the selected channel gets interference, change the color of the button.',
				options: [
					this.CHANNELS_FIELD,
					this.FG_COLOR_FIELD(this.rgb(255,255,255)),
					this.BG_COLOR_FIELD(this.rgb(255,0,0))
				],
				callback: (feedback, bank) => {
					if (this.api.getChannel(parseInt(feedback.options.channel)).interferenceStatus == 'DETECTED') {
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
		}

		if (this.model.family != 'mxw') {
			feedbacks['channel_frequency'] = {
				label: 'Channel Frequency',
				description: 'If the selected channel\'s frequency is set, change the color of the button.',
				options: [
					this.CHANNELS_FIELD,
					this.FREQUENCY_FIELD,
					this.FG_COLOR_FIELD(this.rgb(0,0,0)),
					this.BG_COLOR_FIELD(this.rgb(255,255,0))
				],
				callback: (feedback, bank) => {
					if (this.api.getChannel(parseInt(feedback.options.channel)).frequency == feedback.options.value) {
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
		}

		feedbacks['channel_Gain'] = {
			label: 'Channel Gain',
			description: 'If the selected channel\'s gain is set, change the color of the button.',
			options: [
				this.CHANNELS_FIELD,
				this.GAIN_SET_FIELD(this.model.family),
				this.FG_COLOR_FIELD(this.rgb(0,0,0)),
				this.BG_COLOR_FIELD(this.rgb(255,255,0))
			],
			callback: (feedback, bank) => {
				if (this.api.getChannel(parseInt(feedback.options.channel)).audioGain == feedback.options.gain) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['transmitter_turned_off'] = {
			label: 'Transmitter Turned Off',
			description: 'If the selected channel\'s transmitter is powered off, change the color of the button.',
			options: [
				this.CHANNELS_FIELD,
				this.FG_COLOR_FIELD(this.rgb(255,255,255)),
				this.BG_COLOR_FIELD(this.rgb(0,0,128))
			],
			callback: (feedback, bank) => {
				if ((this.api.getChannel(parseInt(feedback.options.channel)).txType == 'Unknown') || (this.api.getChannel(parseInt(feedback.options.channel)).batteryBars == 255)) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		if (this.model.family == 'ad') {
			feedbacks['slot_is_active'] = {
				label: 'Slot is Active',
				description: 'If the selected slot\'s transmitter is active to the channel, change the color of the button',
				options: [
					this.SLOTS_FIELD,
					this.FG_COLOR_FIELD(this.rgb(0,0,0)),
					this.BG_COLOR_FIELD(this.rgb(255,255,0))
				],
				callback: (feedback, bank) => {
					let slot = feedback.options.slot.split(':');
					let ch = this.api.getChannel(parseInt(slot[0]));
					slot = this.api.getSlot(parseInt(slot[0]), parseInt(slot[1]));
					if (ch.txDeviceId == slot.txDeviceId && (slot.status == 'STANDARD' || (slot.status.match(/LINKED/) && slot.txRfOutput == 'RF_ON') ) ) {
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
			feedbacks['slot_status'] = {
				label: 'Slot Status',
				description: 'If the selected slot\'s status is set, change the color of the button',
				options: [
					this.SLOTS_FIELD,
					this.SLOT_STATUS_FIELD,
					this.FG_COLOR_FIELD(this.rgb(0,0,0)),
					this.BG_COLOR_FIELD(this.rgb(255,255,0))
				],
				callback: (feedback, bank) => {
					let slot = feedback.options.slot.split(':');
					if (this.api.getSlot(parseInt(slot[0]), parseInt(slot[1])).status == feedback.options.value) {
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};

			feedbacks['slot_rf_output'] = {
				label: 'Slot RF Output',
				description: 'If the selected slot\'s transmitter RF is set, change the color of the button.',
				options: [
					this.SLOTS_FIELD,
					this.RFOUTPUT_FIELD,
					this.FG_COLOR_FIELD(this.rgb(255,255,255)),
					this.BG_COLOR_FIELD(this.rgb(100,255,0))
				],
				callback: (feedback, bank) => {
					let slot = feedback.options.slot.split(':');
					if (this.api.getSlot(parseInt(slot[0]), parseInt(slot[1])).txRfOutput == feedback.options.onoff) {
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};

			feedbacks['slot_rf_power'] = {
				label: 'Slot RF Power',
				description: 'If the selected slot\'s transmitter power level is set, change the color of the button.',
				options: [
					this.SLOTS_FIELD,
					this.RFPOWER_FIELD,
					this.FG_COLOR_FIELD(this.rgb(255,255,255)),
					this.BG_COLOR_FIELD(this.rgb(100,255,0))
				],
				callback: (feedback, bank) => {
					let slot = feedback.options.slot.split(':');
					if (this.api.getSlot(parseInt(slot[0]), parseInt(slot[1])).txPowerLevel == parseInt(feedback.options.power)) {
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
		}

		this.setFeedbackDefinitions(feedbacks);
	}
}
