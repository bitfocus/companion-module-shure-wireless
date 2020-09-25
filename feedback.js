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

		feedbacks['battery_level'] = {
			label: 'Battery Level',
			description: 'If the battery bar drops to or below a certain value, change the color of the button.',
			options: [
				this.CHANNELS_FIELD,
				this.BATTERY_LEVEL_FIELD,
				this.FG_COLOR_FIELD(this.rgb(255,255,255)),
				this.BG_COLOR_FIELD(this.rgb(100,255,0))
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
					this.BG_COLOR_FIELD(this.rgb(100,255,0))
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
						this.BG_COLOR_FIELD(this.rgb(100,255,0))
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
					this.BG_COLOR_FIELD(this.rgb(100,255,0))
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

		feedbacks['transmitter_turned_off'] = {
			label: 'Transmitter Turned Off',
			description: 'If the selected channel\'s transmitter is powered off, change the color of the button.',
			options: [
				this.CHANNELS_FIELD,
				this.FG_COLOR_FIELD(this.rgb(255,255,255)),
				this.BG_COLOR_FIELD(this.rgb(100,255,0))
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

		/*if (this.model.family != 'mxw') {
			feedbacks['sample'] = {
				label: 'Channel Status Display',
				description: "Provide a visual display of the channel's status.",
				options: [
					this.CHANNELS_FIELD,
					{
						type: 'dropdown',
						label: 'Label Data',
						id: 'labels',
						default: ['name', 'frequency', 'txType', 'txPowerLevel'],
						multiple: true,
						maximumSelectionLength: 6,
						choices: [
							{id: 'name',           label: 'Channel Name'},
							{id: 'txDeviceId',     label: 'TX Device ID'},
							{id: 'frequency',      label: 'Frequency'},
							{id: 'groupChan',      label: 'Group/Channel'},
							{id: 'audioGain',      label: 'Audio Gain'},
							{id: 'txType',         label: 'TX Model'},
							{id: 'txPowerLevel',   label: 'TX Power Level'},
							{id: 'batteryRuntime', label: 'Battery Runtime'}
						]
					},
					{
						type: 'dropdown',
						label: 'Icons',
						id: 'icons',
						default: ['battery', 'locks', 'rf', 'audio'],
						multiple: true,
						maximumSelectionLength: 4,
						choices: [
							{id: 'battery', label: 'Battery'},
							{id: 'locks',   label: 'Locks'},
							{id: 'rf',      label: 'RF'},
							{id: 'audio',   label: 'Audio Level'}
						]
					}
				],
				callback: (feedback, bank) => {
					var opt = feedback.options;
					var channel = this.getChannel(parseInt(opt.channel));
					var out = {
						png64: this.api.getIcon(feedback.options),
						text:  ''
					};

					if (typeof opt.labels === 'string') {
						//selections.push(action.options[option.id].toString())
					}
					else if (Array.isArray(opt.labels)) {
						//selections = action.options[option.id]
					}

					return out;
				}
			};
		}*/

		this.setFeedbackDefinitions(feedbacks);
	}
}