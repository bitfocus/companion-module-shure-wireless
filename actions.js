module.exports = {

	/**
	 * INTERNAL: Get the available actions.  Utilized by bmd-multiview.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	getActions() {
		var actions = {};

		actions['set_channel_name'] = {
			label: 'Set channel name',
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
					label: 'Name (' + ((this.model.family == 'ulx' || this.model.family == 'qlx') ? '8' : '31') + ' characters max)',
					id: 'name',
					default: '',
					regex: ((this.model.family == 'ulx' || this.model.family == 'qlx') ? this.REGEX_CHAR_8 : this.REGEX_CHAR_31)
				}
			]
		};

		if (this.model.family == 'ulx' || this.model.family == 'ad') {
			actions['channel_mute'] = {
				label: 'Mute or unmute channel',
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
						choices: this.CHOICES_MUTE
					}
				]
			};
		}

		actions['channel_setaudiogain'] = {
			label: 'Set audio gain of channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'number',
					label: 'Gain Value (dB)',
					id: 'gain',
					min: (this.model.family == 'mxw' ? -25 : -18),
					max: (this.model.family == 'mxw' ? 15 : 42),
					default: 0,
					required: true,
					range: true
				}
			]
		};

		actions['channel_increasegain'] = {
			label: 'Increase audio gain of channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'number',
					label: 'Gain Value (dB)',
					id: 'gain',
					min: 1,
					max: (this.model.family == 'mxw' ? 40 : 60),
					default: 3,
					required: true,
					range: true
				}
			]
		};

		actions['channel_decreasegain'] = {
			label: 'Decrease audio gain of channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'number',
					label: 'Gain Value (dB)',
					id: 'gain',
					min: 1,
					max: (this.model.family == 'mxw' ? 40 : 60),
					default: 3,
					required: true,
					range: true
				}
			]
		};

		if (this.model.family != 'qlx') {
			actions['flash_lights'] = {
				label: 'Flash lights on receiver',
				tooltip: 'It will automatically turn off after 30 seconds',
				options: [
					{
						type: 'dropdown',
						label: 'On/Off',
						id: 'onoff',
						default: 'ON',
						choices: this.CHOICES_ONOFF
					}
				]
			};
		}

		if (this.model.family == 'ad' || this.model.family == 'mxw') {
			actions['flash_channel'] = {
				label: 'Flash lights on receiver channel',
				tooltip: 'It will automatically turn off after 60 seconds',
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
		}

		if (this.model.family == 'ad') {
			actions['slot_rf_output'] = {
				label: 'Set slot RF output',
				options: [
					{
						type: 'dropdown',
						label: 'Slot Number',
						id: 'slot',
						default: '1:01',
						choices: this.CHOICES_SLOTS
					},
					{
						type: 'dropdown',
						label: 'On/Off',
						id: 'onoff',
						default: 'RF_ON',
						choices: this.CHOICES_RFOUTPUT
					}
				]
			};
		}

		return actions;
	}
}