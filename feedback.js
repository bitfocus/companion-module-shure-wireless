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
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'number',
					label: 'Battery Bar Level',
					id: 'barlevel',
					min: 1,
					max: 5,
					default: 2,
					required: true,
					range: true
				},
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(100,255,0)
				}
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

		feedbacks['channel_muted'] = {
			label: 'Channel Muted',
			description: 'If the selected channel is muted, change the color of the button.',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(100,255,0)
				}
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

		feedbacks['interference_status'] = {
			label: 'Interference Status',
			description: 'If the selected channel gets interference, change the color of the button.',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(100,255,0)
				}
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

		feedbacks['transmitter_turned_off'] = {
			label: 'Transmitter Turned Off',
			description: 'If the selected channel\'s transmitter is powered off, change the color of the button.',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(100,255,0)
				}
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

		/*if (this.model.family != 'mxw') {
			feedbacks['sample'] = {
				label: 'Channel Status Display',
				description: "Provide a visual display of the channel's status.",
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: '1',
						choices: this.CHOICES_CHANNELS
					}
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