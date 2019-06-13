// Shure-ULXD
var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.SHURE_MODELS = [
	{id: 'ulxd4', label: 'ULXD4 Single Receiver'},
	{id: 'ulxd4d', label: 'ULXD4D Dual Receiver'},
	{id: 'ulxd4q', label: 'ULXD4Q Quad Receiver'},
	{id: 'qlxd4', label: 'QLXD4 Single Receiver'}
];

instance.prototype.SHURE_MODELS_CHANNELS = [
	{id: 'ulxd4', channels: 1},
	{id: 'ulxd4d', channels: 2},
	{id: 'ulxd4q', channels: 4},
	{id: 'qlxd4', channels: 1}
];

instance.prototype.localVariables = []; //instance access of variable data for feedback and other purposes

instance.prototype.init = function () {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATUS_OK);

	self.init_variables();
	self.init_module();
	self.init_feedbacks();
};

instance.prototype.updateConfig = function (config) {
	var self = this;
	self.config = config;

	self.status(self.STATUS_OK);

	self.init_variables();
	self.init_module();
	self.init_feedbacks();
};

//init_module: establishes connection and polls the Shure receiver for all the initial information
instance.prototype.init_module = function () {
	var self = this;
	
	var receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.port === undefined) {
		self.config.port = 2202;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', (status, message) => {
			self.status(status, message);
		});

		self.socket.on('error', (err) => {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', () => {
			debug("Connected");
			let cmd = '< GET 0 ALL >';
			self.socket.send(cmd);
			self.updateVariable('last_command_send', cmd);
			self.actions(); // export actions
		});
	
		// separate buffered stream into lines with responses
		self.socket.on('data', (chunk) => {
			var i = 0, line = '', offset = 0;
			receivebuffer += chunk;

			while ( (i = receivebuffer.indexOf('>', offset)) !== -1) {
				line = receivebuffer.substr(offset, i - offset);
				offset = i + 1;
				self.socket.emit('receiveline', line.toString());
			}

			receivebuffer = receivebuffer.substr(offset);
		});

		self.socket.on('receiveline', (line) => {
			self.processShureCommand(line.replace('< ','').trim());
		});
	}
};

instance.prototype.processShureCommand = function (command) {
	var self = this;
	
	self.updateVariable('last_command_received', command);
	
	let commandArr = null;
	let commandNum = null;
	let commandVar = null;
	let commandVal = null;
	
	if (command.substr(0, 3) === 'REP') {
		//this is a report command
		let channelNumber = parseInt(command.substr(4,1));
		
		if (isNaN(channelNumber)) {
			//this command isn't about a specific channel
			commandArr = command.split(' ');
			commandVar = commandArr[1];
			commandVal = commandArr[2];
		}
		else {
			//this command IS about a specific channel
			commandArr = command.split(' ');
			commandNum = commandArr[1];
			commandVar = commandArr[2];
			commandVal = commandArr[3];
		}
		
		switch(commandVar) {
			case 'FW_VER':
				self.updateVariable('firmware_version', commandVal.replace('{',''));
				break;
			case 'DEVICE_ID':
				self.updateVariable('deviceid', commandVal.replace('{',''));
				break;
			case 'FREQUENCY_DIVERSITY_MODE':
				self.updateVariable('frequency_diversity_mode', commandVal);
				break;
			case 'AUDIO_SUMMING_MODE':
				self.updateVariable('audio_summing_mode', commandVal);
				break;
			case 'HIGH_DENSITY':
				self.updateVariable('high_density_mode', commandVal);
				break;
			case 'ENCRYPTION':
				self.updateVariable('encryption', commandVal);
				break;
			case 'CHAN_NAME':
				self.updateVariable('channel_name_' + commandNum, commandVal.replace('{',''));
				self.actions();
				self.init_feedbacks();
				break;
			case 'METER_RATE':
				self.updateVariable('meter_rate_' + commandNum, commandVal);
				break;
			case 'AUDIO_GAIN':
				self.updateVariable('audio_gain_' + commandNum, commandVal);
				break;
			case 'AUDIO_MUTE':
				self.updateVariable('audio_mute_' + commandNum, commandVal);
				self.checkFeedbacks('channelmuted');
				break;
			case 'AUDIO_LVL':
				self.updateVariable('audio_lvl_' + commandNum, commandVal);
				break;
			case 'GROUP_CHAN':
				self.updateVariable('group_channel_' + commandNum, commandVal);
				break;
			case 'FREQUENCY':
				let frequency = commandVal.substr(0,3) + '.' + commandVal.substr(3,3) + ' MHz';
				self.updateVariable('frequency_' + commandNum, frequency);
				break;
			case 'RF_INT_DET':
				self.updateVariable('interference_detection_' + commandNum, commandVal);
				self.checkFeedbacks('interferenc_edetection');
				break;
			case 'RX_RF_LVL':
				self.updateVariable('RX_RF_LVL_' + commandNum, commandVal);
				break;
			case 'RF_ANTENNA':
				self.updateVariable('RF_ANTENNA_' + commandNum, commandVal);
				break;
			case 'BATT_BARS':
				self.updateVariable('battery_bars_' + commandNum, commandVal);
				self.checkFeedbacks('battery_level');
				self.checkFeedbacks('transmitter_turned_off');
				break;
			case 'TX_OFFSET':
				self.updateVariable('transmitter_offset_' + commandNum, commandVal);
				break;
			case 'TX_RF_PWR':
				self.updateVariable('transmitter_rfpower_' + commandNum, commandVal);
				break;
			case 'TX_TYPE':
				self.updateVariable('transmitter_type_' + commandNum, commandVal);
				self.checkFeedbacks('transmitter_turned_off');
				break;
			case 'BATT_TYPE':
				self.updateVariable('battery_type_' + commandNum, commandVal);
				break;
			case 'BATT_RUN_TIME':
				self.updateVariable('battery_runtime_' + commandNum, commandVal);
				break;
			case 'BATT_CHARGE':
				self.updateVariable('battery_chargestatus_' + commandNum, commandVal);
				break;
			case 'BATT_CYCLE':
				self.updateVariable('battery_cycle_' + commandNum, commandVal);
				break;
			case 'BATT_TEMP_C':
				self.updateVariable('battery_temperature_c_' + commandNum, commandVal);
				break;
			case 'BATT_TEMP_F':
				self.updateVariable('battery_temperature_f_' + commandNum, commandVal);
				break;
			case 'TX_PWR_LOCK':
				self.updateVariable('tramsmitter_powerlock_' + commandNum, commandVal);
				break;
			case 'TX_MENU_LOCK':
				self.updateVariable('transmitter_menulock_' + commandNum, commandVal);
				break;
			case 'ENCRYPTION_WARNING':
				self.updateVariable('encryption_warning_' + commandNum, commandVal);
				break;
			default:
				break;
		}
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			default: 2202,
			width: 4,
			regex: self.REGEX_PORT
		},
		{
			type: 'dropdown',
			id: 'modeltype',
			label: 'Model Type',
			choices: self.SHURE_MODELS,
			width: 4
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;

	debug('destroy', self.id);
};

//init_variables: establish instance dynamic variables for button display and other purposes
instance.prototype.init_variables = function() {
	var self = this;

	var variables = [];
	
	var channelCount = 1;
	
	if (self.config.modeltype) {
		channelCount = self.SHURE_MODELS_CHANNELS.find(x => x.id == self.config.modeltype).channels;
	}

	for (let i = 1; i <= channelCount; i++) {
		variables.push({ name: 'channel_name_' + i, 				label: 'Channel ' + i + ' Name' });
		variables.push({ name: 'audio_mute_' + i, 					label: 'Channel ' + i + ' Audio Mute' });
		variables.push({ name: 'audio_gain_' + i, 					label: 'Channel ' + i + ' Audio Gain' });
		variables.push({ name: 'group_channel_' + i, 				label: 'Channel ' + i + ' Group & Channel' });
		variables.push({ name: 'frequency_' + i, 					label: 'Channel ' + i + ' Frequency' });
		variables.push({ name: 'battery_cycle_' + i, 				label: 'Channel ' + i + ' Battery Cycle' });
		variables.push({ name: 'battery_runtime_' + i,				label: 'Channel ' + i + ' Battery Run Time' });
		variables.push({ name: 'battery_temperature_f_' + i,		label: 'Channel ' + i + ' Battery Temperature (F)' });
		variables.push({ name: 'battery_temperature_c_' + i,		label: 'Channel ' + i + ' Battery Temperature (C)' });
		variables.push({ name: 'battery_type_' + i,					label: 'Channel ' + i + ' Battery Type' });
		variables.push({ name: 'battery_chargestatus_' + i,			label: 'Channel ' + i + ' Battery Charge Status' });
		variables.push({ name: 'battery_bars_' + i,					label: 'Channel ' + i + ' Battery Bars' });
		variables.push({ name: 'transmitter_type_' + i,				label: 'Channel ' + i + ' Transmitter Type' });
		variables.push({ name: 'transmitter_offset_' + i,			label: 'Channel ' + i + ' Transmitter Offset' });
		variables.push({ name: 'transmitter_rfpower_' + i,			label: 'Channel ' + i + ' Transmitter RF Power' });
		variables.push({ name: 'transmitter_powerlock_' + i,		label: 'Channel ' + i + ' Transmitter Power Lock' });
		variables.push({ name: 'transmitter_menulock_' + i,			label: 'Channel ' + i + ' Transmitter Menu Lock' });
		variables.push({ name: 'interference_detection_' + i,		label: 'Channel ' + i + ' Interference Detection' });
		variables.push({ name: 'encryption_status_' + i,			label: 'Channel ' + i + ' Encryption Status' });
		variables.push({ name: 'encryption_warning_' + i,			label: 'Channel ' + i + ' Encryption Mismatch/Warning' });
		variables.push({ name: 'transmitter_deviceid_' + i,			label: 'Channel ' + i + ' Transmitter Device ID' });
		variables.push({ name: 'transmitter_mutestatus_' + i,		label: 'Channel ' + i + ' Transmitter Mute Status' });
		variables.push({ name: 'transmitter_mutebuttonstatus_' + i,	label: 'Channel ' + i + ' Transmitter Mute Button Status' });
		variables.push({ name: 'transmitter_powersource_' + i,		label: 'Channel ' + i + ' Transmitter Power Source' });
	}
	
	variables.push({ name: 'deviceid',			 				label: 'Device ID' });
	variables.push({ name: 'audio_summing_mode', 				label: 'Audio Summing Mode' });
	variables.push({ name: 'frequency_diversity_mode', 			label: 'Frequency Diversity Mode' });
	variables.push({ name: 'high_density_mode',					label: 'High Density Mode' });
	variables.push({ name: 'firmware_version', 					label: 'Firmware Version' });
	variables.push({ name: 'flash_lights', 						label: 'Flash Lights On/Off' });
	
	variables.push({ name: 'last_command_sent',					label: 'Last Command Sent' });
	variables.push({ name: 'last_command_received',				label: 'Last Command Received' });

	self.setVariableDefinitions(variables);
	self.localVariables = variables; //copies variable definitions for local instance use
};

//updateVariable: updates both the system instance variable and local variable for button display and feedback purposes
instance.prototype.updateVariable = function (variableName, value) {
	var self = this;
	
	self.setVariable(variableName, value);
	self.localVariables[variableName] = value;
};

instance.prototype.actions = function (system) {
	var self = this;
	
	var channelList = [];
	
	var channelCount = 1;
	
	if (self.config.modeltype) {
		channelCount = self.SHURE_MODELS_CHANNELS.find(x => x.id === self.config.modeltype).channels;
	}
	
	for (let i = 1; i <= channelCount; i++) {
		let channelListObj = {};
		channelListObj.id = i;
		channelListObj.label = 'Channel ' + i;
		channelListObj.label += ' (' + self.localVariables['channel_name_' + i] + ')';
		channelList.push(channelListObj);
	}

	self.system.emit('instance_actions', self.id, {
		'get_all_status': {
			label: 'Get Updated Status of All Channels'
		},
		'get_status': {
			label: 'Get Updated Status of Specific Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: channelList
				}
			]
		},
		'set_channel_name': {
			label: 'Set Channel Name',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: channelList
				},
				{
					type: 'textinput',
					label: 'Name',
					id: 'name',
					default: ''
				}
			]
		},
		'channel_mute': {
			label: 'Mute or Unmute Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: channelList
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
		},
		'channel_setaudiogain': {
			label: 'Set Audio Gain of Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: channelList
				},
				{
					type: 'textinput',
					label: 'Gain Value (0 - 60)',
					id: 'gain',
					default: '0',
					regex: '([1-9]|[1-5][0-9]|60)'
				}
			]
		},
		'channel_increasegain': {
			label: 'Increase Audio Gain of Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: channelList
				},
				{
					type: 'textinput',
					label: 'Gain Value (1 - 60)',
					id: 'gain',
					default: '0',
					regex: '([1-9]|[1-5][0-9]|60)'
				}
			]
		},
		'channel_decreasegain': {
			label: 'Decrease Audio Gain of Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel Number',
					id: 'channel',
					default: '1',
					choices: channelList
				},
				{
					type: 'textinput',
					label: 'Gain Value (1 - 60)',
					id: 'gain',
					default: '0',
					regex: '([1-9]|[1-5][0-9]|60)'
				}
			]
		},
		'flash_lights': {
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
		}
	});
};

instance.prototype.action = function (action) {
	var self = this;
	var options = action.options;
	
	var cmd;

	switch (action.action) {
		case 'get_all_status':
			cmd = '< GET 0 ALL >';
			break;
		case 'get_status':
			cmd = '< GET ' + options.channel + ' ALL >';
			break;
		case 'set_channel_name':
			cmd = '< SET ' + options.channel + ' CHAN_NAME {' + options.name.substr(0,8) + '} >';
			break;
		case 'channel_mute':
			cmd = '< SET ' + options.channel + ' AUDIO_MUTE ' + options.choice + ' >';
			break;
		case 'channel_setaudiogain':
			cmd = '< SET ' + options.channel + ' AUDIO_GAIN ' + options.gain.padStart(3, '0') + ' >';
			break;
		case 'channel_increasegain':
			cmd = '< SET ' + options.channel + ' AUDIO_GAIN INC ' + options.gain + ' >';
			break;
		case 'channel_decreasegain':
			cmd = '< SET ' + options.channel + ' AUDIO_GAIN DEC ' + options.gain + ' >';
			break;
		case 'flash_lights':
			cmd = '< SET FLASH ' + options.onoff + ' >';
			break;
		default:
			break;
	}
	
	if (cmd !== undefined) {
		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd);
			self.updateVariable('last_command_sent', cmd);
		} else {
			debug('Socket not connected :(');
		}
	}
};

instance.prototype.init_feedbacks = function() {
	var self = this;

	var feedbacks = {};
	
	var channelList = [];
	
	var channelCount = 1;
	
	if (self.config.modeltype) {
		channelCount = self.SHURE_MODELS_CHANNELS.find(x => x.id === self.config.modeltype).channels;
	}
	
	for (let i = 1; i <= channelCount; i++) {
		let channelListObj = {};
		channelListObj.id = i;
		channelListObj.label = 'Channel ' + i;
		channelListObj.label += ' (' + self.localVariables['channel_name_' + i] + ')';
		channelList.push(channelListObj);
	}
	
	feedbacks['battery_level'] = {
		label: 'Battery Level',
		description: 'If the battery bar drops to or below a certain value, change the color of the button.',
		options: [
			{
				 type: 'dropdown',
				 label: 'Channel',
				 id: 'channel',
				 default: '1',
				 choices: channelList
			},
			{
				 type: 'dropdown',
				 label: 'Battery Bar Level',
				 id: 'barlevel',
				 default: '2',
				 choices: [
					 {id: '5', label: '5'},
					 {id: '4', label: '4'},
					 {id: '3', label: '3'},
					 {id: '2', label: '2'},
					 {id: '1', label: '1'}
				 ]
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(100,255,0)
			}
		]
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
				 choices: channelList
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(100,255,0)
			}
		]
	};
	
	feedbacks['interference_detection'] = {
		label: 'Interference Detection',
		description: 'If the selected channel gets interference, change the color of the button.',
		options: [
			{
				 type: 'dropdown',
				 label: 'Channel',
				 id: 'channel',
				 default: '1',
				 choices: channelList
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(100,255,0)
			}
		]
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
				 choices: channelList
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(100,255,0)
			}
		]
	};

	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.feedback = function(feedback, bank) {
	var self = this;
	
	if (feedback.type === 'battery_level') {
		if (parseInt(self.localVariables['battery_bars_' + feedback.options.channel]) <= parseInt(feedback.options.barlevel)) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}
	
	if (feedback.type === 'channel_muted') {
		if (self.localVariables['transmitter_mutestatus_' + feedback.options.channel] === 'ON') {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}
	
	if (feedback.type === 'interference_dection') {
		if (self.localVariables['interference_detection_' + feedback.options.channel] === 'CRITICAL') {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}
	
	if (feedback.type === 'transmitter_turned_off') {
		if ((self.localVariables['transmitter_type_' + feedback.options.channel] === 'UNKN') || (self.localVariables['battery_bars_' + feedback.options.channel] === '255')) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}
	
	return {};
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;