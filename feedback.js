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
					this.CHANNELS_FIELD,
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
					this.CHANNELS_FIELD,
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
					this.CHANNELS_FIELD
				],
				callback: (feedback, bank) => {
					return {
						png64: this.api.getIcon(parseInt(feedback.options.channel))
					};
				}
			};
		}*/

		this.setFeedbackDefinitions(feedbacks);
	}
}