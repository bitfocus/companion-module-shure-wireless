module.exports = {

	/**
	 * INTERNAL: Get the available actions.  Utilized by bmd-multiview.
	 *
	 * @returns {Object[]} the available actions
	 * @access public
	 * @since 1.0.0
	 */
	getActions() {
		var actions = {};

		actions['get_all_status'] = {
			label: 'Get Updated Status of All Channels'
		};

		actions['get_status'] = {
			label: 'Get Updated Status of Specific Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				}
			]
		};

		actions['set_channel_name'] = {
			label: 'Set Channel Name',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Name',
					id: 'name',
					default: ''
				}
			]
		};

		actions['channel_mute'] = {
			label: 'Mute or Unmute Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'dropdown',
					label: 'Mute/Unmute/Toggle',
					id: 'choice',
					default: 'ON',
					choices: [
						{id: 'ON', label: 'Mute'},
						{id: 'OFF', label: 'Unmute'},
						{id: 'TOGGLE', label: 'Toggle Mute/Unmute'}
					]
				}
			]
		};

		actions['channel_setaudiogain'] = {
			label: 'Set Audio Gain of Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Gain Value (0 - 60)',
					id: 'gain',
					default: '0',
					regex: '([1-9]|[1-5][0-9]|60)'
				}
			]
		};

		actions['channel_increasegain'] = {
			label: 'Increase Audio Gain of Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Gain Value (1 - 60)',
					id: 'gain',
					default: '0',
					regex: '([1-9]|[1-5][0-9]|60)'
				}
			]
		};

		actions['channel_decreasegain'] = {
			label: 'Decrease Audio Gain of Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Gain Value (1 - 60)',
					id: 'gain',
					default: '0',
					regex: '([1-9]|[1-5][0-9]|60)'
				}
			]
		};

		if (this.model.family != 'qlx') {
			actions['flash_lights'] = {
				label: 'Flash Lights on Receiver',
				tooltip: 'It will automatically turn off after 30 seconds',
				options: [
					{
						type: 'dropdown',
						label: 'On/Off',
						id: 'onoff',
						default: 'ON',
						choices: [
							{id: 'OFF', label: 'Off'},
							{id: 'ON', label: 'On'}
						]
					}
				]
			};
		}

		return actions;
	}
}