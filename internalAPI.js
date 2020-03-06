var debug;
var log;

/**
 * Companion instance API class for Shure Wireless.
 * Utilized to track the state of the receiver and channels.
 *
 * @version 1.0.0
 * @since 1.0.0
 * @author Joseph Adams <josephdadams@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance_api {

	/**
	 * Create an instance of a Shure API module.
	 *
	 * @param {instance} instance - the parent instance
	 * @since 1.0.0
	 */
	constructor(instance) {
		this.instance = instance;
		this.rgb      = instance.rgb;

		//qlx-d [FW_VER,DEVICE_ID,ENCRYPTION]
		//ulx-d [FW_VER,DEVICE_ID,ENCRYPTION,AUDIO_SUMMING_MODE,FREQUENCY_DIVERSITY_MODE,HIGH_DENSITY,FLASH]
		//ad    [FW_VER,DEVICE_ID,ENCRYPTION_MODE,MODEL,QUADVERSITY_MODE,RF_BAND,TRANSMISSION_MODE,FLASH]
		//mxw   [DEVICE_ID,FLASH]
		this.receiver  = {
			firmwareVersion:    '',    // (ULX|QLX) 18 | (AD) 24
			deviceId:           '',    // (ULX|QLX) 8 | (AD|MXW) 31
			encryption:         'OFF', // (QLX|AD:ENCRYPTION_MODE) OFF - ON | (ULX) OFF - MANUAL - AUTO
			audioSumming:       'OFF', // (ULXD4D|ULXD4Q only) OFF - 1+2 - 3+4 - 1+2/3+4 - 1+2+3+4
			frequencyDiversity: 'OFF', // (ULXD4D|ULXD4Q only) OFF - 1+2 - 3+4 - 1+2/3+4
			highDensity:        'OFF', // (ULX) OFF - ON | (AD:TRANSMISSION_MODE) STANDARD = OFF - HIGH_DENSITY = ON
			flash:              'OFF', // (ULX|AD|MXW) OFF - ON
			quadversityMode:    'OFF', // (AD) OFF - ON
			model:              '',    // (AD) 32
			rfBand:             ''     // (AD) 8
		};
		this.channels  = [];

		this.MXW_LED_STATUS = {
			ON: 'On',
			OF: 'Off',
			ST: 'Strobe',
			FL: 'Flash',
			PU: 'Pulse'
		};
	}

	/**
	 * Returns the desired channel state object.
	 *
	 * @param {number} id - the channel to fetch
	 * @returns {Object} the desired channel object
	 * @access public
	 * @since 1.0.0
	 */
	getChannel(id) {

		if (this.channels[id] === undefined) {
			//qlx-d rx [CHAN_NAME,METER_RATE,AUDIO_GAIN,GROUP_CHAN,FREQUENCY,ENCRYPTION_WARNING]
			//ulx-d rx [CHAN_NAME,METER_RATE,AUDIO_GAIN,AUDIO_MUTE,GROUP_CHAN,FREQUENCY,ENCRYPTION_WARNING,RF_INT_DET]
			//ad    rx [CHAN_NAME,METER_RATE,AUDIO_GAIN,AUDIO_MUTE,GROUP_CHANNEL,FREQUENCY,FLASH,ENCRYPTION_STATUS,INTERFERENCE_STATUS,UNREGISTERED_TX_STATUS]
			//         [FD_MODE,GROUP_CHANNEL2,FREQUENCY2,INTERFERENCE_STATUS2]
			//mxw   rx [CHAN_NAME,METER_RATE,AUDIO_GAIN,FLASH]
			//qlx-d tx [TX_TYPE,TX_DEVICE_ID,TX_OFFSET,TX_RF_PWR,TX_MUTE_STATUS,TX_PWR_LOCK,TX_MENU_LOCK,TX_MUTE_BUTTON_STATUS,TX_POWER_SOURCE]
			//         [BATT_BARS,BATT_CHARGE,BATT_CYCLE,BATT_RUN_TIME,BATT_TEMP_F,BATT_TEMP_C,BATT_TYPE]
			//ulx-d tx [TX_TYPE,TX_DEVICE_ID,TX_OFFSET,TX_RF_PWR,TX_MUTE_STATUS,TX_PWR_LOCK,TX_MENU_LOCK,TX_MUTE_BUTTON_STATUS,TX_POWER_SOURCE]
			//         [BATT_BARS,BATT_CHARGE,BATT_CYCLE,BATT_RUN_TIME,BATT_TEMP_F,BATT_TEMP_C,BATT_TYPE]
			//ad    tx [TX_MODEL,TX_DEVICE_ID,TX_OFFSET,TX_INPUT_PAD,TX_POWER_LEVEL,TX_MUTE_MODE_STATUS,TX_POLARITY,TX_LOCK,TX_TALK_SWITCH]
			//         [TX_BATT_BARS,TX_BATT_CHARGE_PERCENT,TX_BATT_CYCLE_COUNT,TX_BATT_HEALTH_PERCENT,TX_BATT_MINS,TX_BATT_TEMP_F,TX_BATT_TEMP_C,TX_BATT_TYPE]
			//mxw   tx [TX_TYPE,TX_AVAILABLE,TX_STATUS,BUTTON_STS,LED_STATUS,BATT_CHARGE,BATT_HEALTH,BATT_RUN_TIME,BATT_TIME_TO_FULL]
			this.channels[id] = {
				slots:                [],        // AD TX Slots
				//rx
				name:                 '',        // (ULX|QLX) 8 | (AD|MXW) 31
				meterRate:            0,         // 0=disabled, 100-99999 [in ms]
				audioGain:            0,         // (ULX|QLX|AD) 0-60,-18dB | (MXW) 0-40,-25dB
				audioMute:            'OFF',     // (ULX|AD) OFF - ON - TOGGLE[set]
				group:                0,         // (ULX|QLX|AD:GROUP_CHANNEL) xx,yy (xx)
				channel:              0,         // (ULX|QLX|AD:GROUP_CHANNEL) xx,yy (yy)
				frequency:            '000.000', // (ULX|QLX|AD) 6, xxx[.]yyy
				flash:                'OFF',     // (AD|MXW) OFF - ON
				encryptionStatus:     'OK',      // (AD) OK - ERROR | (ULX+QLD:ENCRYPTION_WARNING) OFF=OK - ON=ERROR
				interferenceStatus:   'NONE',    // (AD) NONE - DETECTED | (ULX:RF_INT_DET) NONE - CRITICAL=DETECTED
				unregisteredTxStatus: 'OK',      // (AD) OK - ERROR
				fdMode:               'OFF',     // (AD) OFF - FD-C - FD-S
				group2:               0,         // (AD) xx,yy (xx)
				channel2:             0,         // (AD) xx,yy (yy)
				frequency2:           '000.000', // (AD) 6, xxx[.]yyy
				interferenceStatus2:  'NONE',    // (AD) NONE - DETECTED

				//sample
				antenna:              'XX',      // (ULX|QLX|AD) raw sample
				antennaA:             'X',       // (ULX|QLX) X - B | (AD) X - B - R
				antennaB:             'X',       // (ULX|QLX) X - B | (AD) X - B - R
				antennaC:             'X',       // (AD:QUADVERITY ON) X - B - R
				antennaD:             'X',       // (AD:QUADVERITY ON) X - B - R
				rfLevel:              -120,      // (ULX|QLX) 0-115,-120dBm | (MXW) 0-96?
				audioLevel:           -50,       // (ULX|QLX) 0-50,-50dB | (AD) 0-120,-120dB | (MXW) 0-98,-98dB?
				audioLevelPeak:       -120,      // (AD) 0-120,-120dB
				audioLED:             0,         // (AD) 0-255 binary, 1-7=level, 8=OL
				signallQuality:       255,       // (AD) 0-5,255=UNKN

				//tx
				txType:               'Unknown', // (ULX|QLX) QLXD1 - QLXD2 - ULXD1 - ULXD2 - ULXD6 - ULXD8 - UNKN
				                                 // (AD:TX_MODEL) AD1 - AD2 - ADX1 - ADX1M - ADX2 - ADX2FD - UNKNOWN
				                                 // (MXW) MXW1 - MXW2 - MXW6 - MXW8 - UNKNOWN
				txAvailable:          'NO',      // (MXW) YES - NO
				txStatus:             'Unknown', // (MXW) ACTIVE[set] - MUTE[set] - STANDBY[set] - ON_CHARGER - UNKNOWN - OFF[set-only]
				txDeviceId:           '',        // (ULX+QLX:ULXD6/ULXD8 only) 8 | (AD) 31
				txOffset:             255,       // (ULX|QLX) 0,3,6,9,12,15,18,21 255=UNKN | (AD) 0-32,-12 255=UNKN
				txInputPad:           255,       // (AD) 0=ON(-12), 12=OFF(0), 255=UNKN
				txPowerLevel:         255,       // (AD) 0-50mW 255=UNKN | (ULX+QLX:TX_RF_PWR) LOW=1 NORMAL=10 HIGH=20 UNKN=255
				txPowerMode:          'Unknown', // (ULX+QLX:TX_RF_PWR) UNKNOWN - LOW - NORMAL - HIGH
				txMuteStatus:         'Unknown', // (ULX|QLX) OFF - ON - UNKN | (AD:TX_MUTE_MODE_STATUS) OFF - MUTE=ON - UNKNOWN
				txPolarity:           'Unknown', // (AD) POSITIVE - NEGATIVE - UNKNOWN
				txLock:               'Unknown', // (ULX|QLX) [simulate] | (AD) ALL - POWER - MENU - OFF - UNKNOWN
				txPowerLock:          'Unknown', // (ULX|QLX) OFF - ON - UNKN | (AD:TX_LOCK) POWER|ALL=ON - MENU|NONE=OFF - UNKNOWN
				txMenuLock:           'Unknown', // (ULX|QLX) OFF - ON - UNKN | (AD:TX_LOCK) MENU|ALL=ON - POWER|NONE=OFF - UNKNOWN
				txTalkSwitch:         'Unknown', // (ULX+QLX:TX_MUTE_BUTTON_STATUS) PRESSED - RELEASED - UNKN | (AD|MWX:BUTTON_STS) OFF=RELEASED - ON=PRESSED - UNKNOWN
				txPowerSource:        'Unknown', // (ULX|QLX) BATTERY - EXTERNAL - UNKN | (MXW) SEE batteryRuntime
				ledStatusRed:         'Off',     // (MXW) rr gg (rr) ON=On,OF=Off,ST=Strobe,FL=Flash,PU=Pulse,NC=No Change
				ledStatusGreen:       'Off',     // (MXW) rr gg (gg) ON=On,OF=Off,ST=Strobe,FL=Flash,PU=Pulse,NC=No Change
				batteryBars:          255,       // (ULX|QLX|AD:TX_BATT_BARS) 0-5, 255=UNKN
				batteryCharge:        255,       // (ULX|QLX|MXW|AD:TX_BATT_CHARGE_PERCENT) 0-100, 255=UNKN
				batteryCycle:         65535,     // (ULX|QLX|AD:TX_BATT_CYCLE_COUNT) 0+, 65535=UNKN
				batteryHealth:        255,       // (MXW|AD:TX_BATT_HEALTH_PERCENT) 0-100, 255=UNKN
				batteryRuntime:       65535,     // (ULX|QLX) 0+, 65535=UNKN
				                                 // (AD:TX_BATT_MINS) 0+, 65535=UNKN 65534=calcuating 65533=comm warning
				                                 // (MXW) 0+, 65535=UNKN 65534=calcuating 65533=charging 65532=wall power
				batteryTempF:         255,       // (ULX|QLX|AD:TX_BATT_TEMP_F) +40 255=UNKN
				batteryTempC:         255,       // (ULX|QLX|AD:TX_BATT_TEMP_C)  +40 255=UNKN
				batteryType:          'Unknown', // (ULX|QLX|AD:TX_BATT_TYPE) ALKA - LION - LITH - NIMH - UNKN
				batteryTimeToFull:    65535,     // (MXW) 0+, 65535=UNKN (not charging), 65534=charged
			};
		}

		return this.channels[id];
	}

	/**
	 * Returns the desired channel status icon.
	 *
	 * @param {number} id - the channel to fetch
	 * @returns {String} the icon
	 * @access public
	 * @since 1.0.0
	 */
	/*getIcon(id) {
		var ch = this.getChannel(id);
		var icon;

		switch(this.instance.model.family) {
			case 'ulx':
			case 'qlx':
				icon = this.instance.icons.getULXStatus(this.rgb(0,0,0), ch.antenna, ch.audioLED, ch.rfBitmapA, ch.batteryBars, ch.txLock);
				break;
			case 'ad':
				icon = this.instance.icons.getADStatus(this.rgb(0,0,0), ch.antenna, ch.audioLED, ch.rfBitmapA, ch.rfBitmapB, ch.batteryBars, ch.txLock);
				break;
		}

		return icon;
	}*/

	/**
	 * Returns the receiver state object.
	 *
	 * @returns {Object} the receiver state object
	 * @access public
	 * @since 1.0.0
	 */
	getReceiver() {

		return this.receiver;
	}

	/**
	 * Returns the desired slot state object.
	 *
	 * @param {number} channel - the channel to fetch
	 * @param {number} id - the slot to fetch
	 * @returns {Object} the desired slot object
	 * @access public
	 * @since 1.0.0
	 */
	getSlot(channel, id) {

		if (this.getChannel(channel).slots[id] === undefined) {
			this.getChannel(channel).slots[id] = {
				status:               'EMPTY',   // SLOT_STATUS EMPTY - STANDARD - LINKED.INACTIVE - LINKED.ACTIVE
				showLinkStatus:       255,       // SLOT_SHOWLINK_STATUS 1-5,255=UNKN
				txType:               'Unknown', // SLOT_TX_MODEL AD1 - AD2 - ADX1 - ADX1M - ADX2 - ADX2FD - UNKNOWN
				txDeviceId:           '',        // SLOT_TX_DEVICE_ID 31
				txOffset:             255,       // SLOT_OFFSET 0-32,-12 255=UNKN
				txInputPad:           255,       // SLOT_INPUT_PAD 0=ON(-12), 12=OFF(0), 255=UNKN
				txPowerLevel:         255,       // SLOT_RF_POWER 0-50mW 255=UNKN
				txPowerMode:          'Unknown', // SLOT_RF_POWER_MODE UNKNOWN - LOW - NORMAL - HIGH
				txPolarity:           'Unknown', // SLOT_POLARITY POSITIVE - NEGATIVE - UNKNOWN
				txRfOutput:           'Unknown', // SLOT_RF_OUTPUT UNKNOWN - RF_ON - RF_MUTE
				batteryBars:          255,       // SLOT_BATT_BARS 0-5, 255=UNKN
				batteryCharge:        255,       // SLOT_BATT_CHARGE_PERCENT 0-100, 255=UNKN
				batteryCycle:         65535,     // SLOT_BATT_CYCLE_COUNT 0+, 65535=UNKN
				batteryHealth:        255,       // SLOT_BATT_HEALTH_PERCENT 0-100, 255=UNKN
				batteryRuntime:       65535,     // SLOT_BATT_MINS 0+, 65535=UNKN 65534=calcuating 65533=comm warning
				batteryType:          'Unknown', // SLOT_BATT_TYPE ALKA - LION - LITH - NIMH - UNKN
			};
		}

		return this.getChannel(channel).slots[id];
	}

	/**
	 * Parse sample data for AD.
	 *
	 * @param {number} id - the channel id
	 * @param {String} data - the sample data
	 * @access public
	 * @since 1.0.0
	 */
	parseADSample(id, data) {
		let channel = this.getChannel(id);
		let prefix = 'ch_' + id + '_';
		let sample = data.split(' ');

		channel.signalQuality  = parseInt(sample[2]);
		channel.audioLED       = parseInt(sample[3]);
		channel.audioLevelPeak = parseInt(sample[4]);
		channel.audioLevel     = parseInt(sample[5]);

		if (channel.fdMode == 'FD-C') {
			// need to do something here
		}
		else {
			channel.rfLevelA  = parseInt(sample[8]);
			channel.rfBitmapA = parseInt(sample[7]);
			channel.rfLevelB  = parseInt(sample[10]);
			channel.rfBitmapB = parseInt(sample[9]);
			channel.antenna   = sample[6];
			channel.antennaA  = sample[6].substr(0,1);
			channel.antennaB  = sample[6].substr(1,1);

			this.instance.setVariable(prefix + 'antenna', channel.antenna);
			this.instance.setVariable(prefix + 'rf_level_a', (channel.rfLevelA-120) + ' dBm');
			this.instance.setVariable(prefix + 'rf_level_b', (channel.rfLevelB-120) + ' dBm');
			this.instance.setVariable(prefix + 'audio_level', (channel.audioLevel-120) + ' dBFS');
			this.instance.setVariable(prefix + 'audio_level_peak', (channel.audioLevelPeak-120) + ' dBFS');

			if (this.receiver.quadversityMode == 'ON') {
				channel.rfLevelC  = parseInt(sample[12]);
				channel.rfBitmapC = parseInt(sample[11]);
				channel.rfLevelC  = parseInt(sample[14]);
				channel.rfBitmapC = parseInt(sample[13]);
				channel.antennaC  = sample[6].substr(2,1);
				channel.antennaD  = sample[6].substr(3,1);
				this.instance.setVariable(prefix + 'rf_level_c', (channel.rfLevelC-120) + ' dBm');
				this.instance.setVariable(prefix + 'rf_level_d', (channel.rfLevelD-120) + ' dBm');
			}
		}

		//this.instance.checkFeedbacks('sample');
	}

	/**
	 * Parse sample data for MXW.
	 *
	 * @param {number} id - the channel id
	 * @param {String} data - the sample data
	 * @access public
	 * @since 1.0.0
	 */
	parseMXWSample(id, data) {
		let channel = this.getChannel(id);
		let prefix = 'ch_' + id + '_';
		let sample = data.split(' ');

		channel.rfLevel    = parseInt(sample[1]);
		channel.audioLevel = parseInt(sample[2]);

		this.instance.setVariable(prefix + 'rf_level',    channel.rfLevel);
		this.instance.setVariable(prefix + 'audio_level', channel.audioLevel);
	}

	/**
	 * Parse sample data for ULX/QLX.
	 *
	 * @param {number} id - the channel id
	 * @param {String} data - the sample data
	 * @access public
	 * @since 1.0.0
	 */
	parseULXSample(id, data) {
		let channel = this.getChannel(id);
		let prefix = 'ch_' + id + '_';
		let sample = data.split(' ');

		switch(sample[2]) {
			case 'AX':
				channel.antennaA = 'B';
				channel.antennaB = 'X';
				break;
			case 'XB':
				channel.antennaA = 'X';
				channel.antennaB = 'B';
				break;
			default:
				channel.antennaA = 'X';
				channel.antennaB = 'X';
				break;
		}

		channel.antenna    = sample[2];
		channel.rfLevel    = parseInt(sample[3]);
		channel.audioLevel = parseInt(sample[4]);

		let audioLevel = channel.audioLevel - 50;

		if (audioLevel > -6) {
			channel.audioLED = 6;
		}
		else if (audioLevel > -12) {
			channel.audioLED = 5;
		}
		else if (audioLevel > -20) {
			channel.audioLED = 4;
		}
		else if (audioLevel > -30) {
			channel.audioLED = 3;
		}
		else if (audioLevel > -40) {
			channel.audioLED = 2;
		}
		else if (audioLevel > -50) {
			channel.audioLED = 1;
		}
		else {
			channel.audioLED = 0;
		}

		let rfLevel = channel.rfLevel - 120;

		if (rfLevel > -25) {
			channel.rfBitmapA = 5;
		}
		else if (rfLevel > -70) {
			channel.rfBitmapA = 4;
		}
		else if (rfLevel > -77) {
			channel.rfBitmapA = 3;
		}
		else if (rfLevel > -83) {
			channel.rfBitmapA = 2;
		}
		else if (rfLevel > -90) {
			channel.rfBitmapA = 1;
		}
		else {
			channel.rfBitmapA = 0;
		}

		this.instance.setVariable(prefix + 'antenna', channel.antenna);
		this.instance.setVariable(prefix + 'rf_level', rfLevel + ' dBm');
		this.instance.setVariable(prefix + 'audio_level', audioLevel + ' dBFS');
		//this.instance.checkFeedbacks('sample');
	}

	/**
	 * Update a channel property.
	 *
	 * @param {number} id - the channel id
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateChannel(id, key, value) {
		var channel = this.getChannel(id);
		var prefix = 'ch_' + id + '_';
		var model = this.instance.model;
		var variable;

		if (value == 'UNKN' || value == 'UNKNOWN') {
			value = 'Unknown';
		}

		if (key == 'CHAN_NAME') {
			channel.name = value.replace('{','').replace('}','');
			this.instance.setVariable(prefix + 'name', channel.name);
			this.instance.actions();
			this.instance.initFeedbacks();
		}
		else if (key == 'METER_RATE') {
			channel.meterRate = parseInt(value);
			if (channel.meterRate == 0){
				variable = 'Disabled';
			}
			else {
				variable = value + ' ms';
			}
			this.instance.setVariable(prefix + 'meter', variable);
		}
		else if (key == 'AUDIO_GAIN') {
			channel.audioGain = parseInt(value);
			if (model.family == 'mxw') {
				variable = (channel.txOffset - 25).toString() + ' dB';
			}
			else {
				variable = (channel.txOffset - 18).toString() + ' dB';
			}
			this.instance.setVariable(prefix + 'audio_gain', variable);
		}
		else if (key == 'AUDIO_MUTE') {
			channel.audioMute = value;
			this.instance.setVariable(prefix + 'audio_mute', value);
			this.instance.checkFeedbacks('channel_muted');
		}
		else if (key == 'GROUP_CHANNEL2') {
			this.instance.setVariable(prefix + 'group_chan2', value);
			variable = value.split(',');
			channel.group2   = variable[0];
			channel.channel2 = variable[1];
		}
		else if (key.match(/GROUP_CHAN/)) {
			this.instance.setVariable(prefix + 'group_chan', value);
			variable = value.split(',');
			channel.group   = variable[0];
			channel.channel = variable[1];
		}
		else if (key == 'FREQUENCY') {
			channel.frequency = value;
			variable = value.substr(0,3) + '.' + value.substr(3,3) + ' MHz';
			this.instance.setVariable(prefix + 'frequency', variable);
		}
		else if (key == 'FREQUENCY2') {
			channel.frequency2 = value;
			variable = value.substr(0,3) + '.' + value.substr(3,3) + ' MHz';
			this.instance.setVariable(prefix + 'frequency2', variable);
		}
		else if (key.match(/ENCRYPTION/)) {
			switch(value) {
				case 'ON':
					variable = 'ERROR';
					break;
				case 'OFF':
					variable = 'OK';
					break;
				default:
					variable = value;
					break;
			}
			channel.encryptionStatus = variable;
			this.instance.setVariable(prefix + 'encryption_status', variable);
		}
		else if (key == 'RF_INT_DET' || key == 'INTERFERENCE_STATUS') {
			switch(value) {
				case 'CRITICAL':
					variable = 'DETECTED';
					break;
				default:
					variable = value;
					break;
			}
			channel.interferenceStatus = variable;
			this.instance.setVariable(prefix + 'interference_status', variable);
			this.instance.checkFeedbacks('interference_status');
		}
		else if (key == 'INTERFERENCE_STATUS2') {
			channel.interferenceStatus = value;
			this.instance.setVariable(prefix + 'interference_status', value);
		}
		else if (key == 'FLASH') {
			channel.flash = value;
			this.instance.setVariable(prefix + 'flash', value);
		}
		else if (key == 'UNREGISTERED_TX_STATUS') {
			channel.unregisteredTxStatus = value;
			this.instance.setVariable(prefix + 'unregistered_tx_status', value);
		}
		else if (key == 'FD_MODE') {
			channel.fdMode = value;
			this.instance.setVariable(prefix + 'fd_mode', value);
		}
		else if (key == 'TX_AVAILABLE') {
			if (channel.txAvailable != value && value == 'YES') {
				//poll for tx when becoming available (per Shure spec)
				this.socket.send('< GET ' + id + ' TX_STATUS >');
				this.socket.send('< GET ' + id + ' AUDIO_GAIN >');
				this.socket.send('< GET ' + id + ' BATT_RUN_TIME >');
				this.socket.send('< GET ' + id + ' BATT_CHARGE >');
				this.socket.send('< GET ' + id + ' BATT_HEALTH >');
				this.socket.send('< GET ' + id + ' BUTTON_STS >');
				this.socket.send('< GET ' + id + ' LED_STATUS >');
				this.socket.send('< GET ' + id + ' TX_TYPE >');
			}
			channel.txAvailable = value;
			this.instance.setVariable(prefix + 'tx_available', value);
		}
		else if (key == 'TX_STATUS') {
			channel.txStatus = value;
			this.instance.setVariable(prefix + 'tx_status', value);
		}
		else if (key == 'TX_TYPE' || value == 'TX_MODEL') {
			channel.txType = value;
			this.instance.setVariable(prefix + 'tx_model', value);
			this.instance.checkFeedbacks('transmitter_turned_off');
		}
		else if (key == 'TX_DEVICE_ID') {
			channel.txDeviceId = value.replace('{','').replace('}','');
			this.instance.setVariable(prefix + 'tx_device_id', channel.txDeviceId);
		}
		else if (key == 'TX_LOCK') {
			switch(value) {
				case 'ALL':
					channel.txMenuLock  = 'ON';
					channel.txPowerLock = 'ON';
					break;
				case 'POWER':
					channel.txMenuLock  = 'OFF';
					channel.txPowerLock = 'ON';
					break;
				case 'MENU':
					channel.txMenuLock  = 'ON';
					channel.txPowerLock = 'OFF';
					break;
				case 'NONE':
					channel.txMenuLock  = 'OFF';
					channel.txPowerLock = 'OFF';
					break;
				case 'Unknown':
					channel.txMenuLock  = 'Unknown';
					channel.txPowerLock = 'Unknown';
					break;
			}
			channel.txLock = value
			this.instance.setVariable(prefix + 'tx_lock',       channel.txLock);
			this.instance.setVariable(prefix + 'tx_power_lock', channel.txPowerLock);
			this.instance.setVariable(prefix + 'tx_menu_lock',  channel.txMenuLock);
		}
		else if (key == 'TX_MENU_LOCK') {
			channel.txMenuLock = value;
			this.instance.setVariable(prefix + 'tx_menu_lock', value);
		}
		else if (key == 'TX_PWR_LOCK') {
			channel.txPowerLock = value;
			this.instance.setVariable(prefix + 'tx_power_lock', value);
		}
		else if (key == 'TX_POWER_SOURCE') {
			channel.txPowerSource = value;
			this.instance.setVariable(prefix + 'tx_power_source', value);
		}
		else if (key.match(/(MUTE|MUTE_MODE)_STATUS/)) {
			switch(value) {
				case 'MUTE':
					variable = 'ON';
					break;
				default:
					variable = value;
					break;
			}
			channel.txMuteStatus = variable;
			this.instance.setVariable(prefix + 'tx_mute_status', variable);
		}
		else if (key == 'TX_MUTE_BUTTON_STATUS' || key == 'TX_TALK_SWITCH' || key == 'BUTTON_STS') {
			switch(value) {
				case 'OFF':
					variable = 'RELEASED';
					break;
				case 'ON':
					variable = 'PRESSED';
					break;
				default:
					variable = value;
					break;
			}
			channel.txTalkSwitch = variable;
			this.instance.setVariable(prefix + 'tx_talk_switch', variable);
		}
		else if (key == 'TX_OFFSET') {
			channel.txOffset = parseInt(value);
			if (channel.txOffset == 255){
				variable = 'Unknown';
			}
			else {
				if (model.family == 'ad') {
					variable = (channel.txOffset - 12).toString() + ' dB';
				}
				else {
					variable = value + ' dB';
				}
			}
			this.instance.setVariable(prefix + 'tx_offset', variable);
		}
		else if (key == 'TX_INPUT_PAD') {
			channel.txInputPad = parseInt(value);
			if (channel.txInputPad == 255){
				variable = 'Unknown';
			}
			else {
				variable = (channel.txInputPad - 12).toString() + ' dB';
			}
			this.instance.setVariable(prefix + 'tx_input_pad', variable);
		}
		else if (key == 'TX_POWER_LEVEL') {
			channel.txPowerLevel = parseInt(value);
			if (channel.txPowerLevel == 255){
				variable = 'Unknown';
			}
			else {
				variable = value + ' mW';
			}
			this.instance.setVariable(prefix + 'tx_power_level', variable);
		}
		else if (key.match(/POWER_MODE/) || key == 'TX_RF_PWR') {
			channel.txPowerMode = value;
			if (model.family == 'ulx' || model.family == 'qlx') {
				switch(value) {
					case 'LOW':
						channel.txPowerLevel = 1;
						variable = '1 mW';
						break;
					case 'NORMAL':
						channel.txPowerLevel = 10;
						variable = '10 mW';
						break;
					case 'HIGH':
						channel.txPowerLevel = 20;
						variable = '20 mW';
						break;
					case 'Unknown':
						channel.txPowerLevel = 255;
						variable = 'Unknown';
						break;
				}
				this.instance.setVariable(prefix + 'tx_power_level', variable);
			}
			this.instance.setVariable(prefix + 'tx_power_mode', value);
		}
		else if (key == 'TX_POLARITY') {
			channel.txPolarity = value;
			this.instance.setVariable(prefix + 'tx_polarity', value);
		}
		else if (key == 'LED_STATUS') {
			variable = value.split(',');
			if (variable[0] != 'NC') {
				channel.ledStatusRed   = variable[0];
				this.instance.setVariable(prefix + 'led_status_red', this.MXW_LED_STATUS[variable[0]]);
			}
			if (variable[1] != 'NC') {
				channel.ledStatusGreen = variable[1];
				this.instance.setVariable(prefix + 'led_status_green', this.MXW_LED_STATUS[variable[1]]);
			}
		}
		else if (key.match(/BATT_BARS/)) {
			channel.batteryBars = parseInt(value);
			if (channel.batteryBars == 255){
				variable = 'Unknown';
			}
			else {
				variable = value;
			}
			this.instance.setVariable(prefix + 'battery_bars', variable);
			this.instance.checkFeedbacks('battery_level');
			this.instance.checkFeedbacks('transmitter_turned_off');
		}
		else if (key.match(/BATT_CHARGE/)) {
			channel.batteryCharge = parseInt(value);
			if (channel.batteryCharge == 255){
				variable = 'Unknown';
			}
			else {
				variable = value + '%';
			}
			this.instance.setVariable(prefix + 'battery_charge', variable);
		}
		else if (key.match(/BATT_CYCLE/)) {
			channel.batteryCycle = parseInt(value);
			if (channel.batteryCycle == 65535){
				variable = 'Unknown';
			}
			else {
				variable = value;
			}
			this.instance.setVariable(prefix + 'battery_cycle', variable);
		}
		else if (key.match(/BATT_HEALTH/)) {
			channel.batteryHealth = parseInt(value);
			if (channel.batteryHealth == 255){
				variable = 'Unknown';
			}
			else {
				variable = value + '%';
			}
			this.instance.setVariable(prefix + 'battery_health', variable);
		}
		else if (key == 'TX_BATT_MINS' || key == 'BATT_RUN_TIME') {
			channel.batteryRuntime = parseInt(value);
			if (channel.batteryRuntime == 65535){
				variable = 'Unknown';
				if (model.family == 'mxw') {
					channel.txPowerSource = 'Unknown';
				}
			}
			else if (channel.batteryRuntime == 65534) {
				variable = 'Calculating';
				if (model.family == 'mxw') {
					channel.txPowerSource = 'BATTERY';
				}
			}
			else if (channel.batteryRuntime == 65533 && model.family == 'ad') {
				variable = 'Error';
			}
			else if (channel.batteryRuntime == 65533 && model.family == 'mxw') {
				variable = 'Charging';
				channel.txPowerSource = 'EXTERNAL';
			}
			else if (channel.batteryRuntime == 65532 && model.family == 'mxw') {
				variable = 'Wall Power';
				channel.txPowerSource = 'EXTERNAL';
			}
			else {
				let mins = channel.batteryRuntime;
				let h = Math.floor(mins / 60);
				let m = mins % 60;
				m = m < 10 ? '0' + m : m;
				variable = `${h}:${m}`;
			}
			if (model.family == 'mxw') {
				this.instance.setVariable(prefix + 'tx_power_source', channel.txPowerSource);
			}
			this.instance.setVariable(prefix + 'battery_runtime', variable);
		}
		else if (key.match(/BATT_TEMP_C/)) {
			channel.batteryTempC = parseInt(value);
			if (channel.batteryTempC == 255){
				variable = 'Unknown';
			}
			else {
				variable = (channel.batteryTempC + 40) + '&#176;';
			}
			this.instance.setVariable(prefix + 'battery_temp_c', variable);
		}
		else if (key.match(/BATT_TEMP_F/)) {
			channel.batteryTempF = parseInt(value);
			if (channel.batteryTempF == 255){
				variable = 'Unknown';
			}
			else {
				variable = (channel.batteryTempF + 40) + '&#176;';
			}
			this.instance.setVariable(prefix + 'battery_temp_f', variable);
		}
		else if (key.match(/BATT_TYPE/)) {
			channel.batteryType = value;
			this.instance.setVariable(prefix + 'battery_type', value);
		}
		else if (key == 'BATT_TIME_TO_FULL') {
			channel.batteryTimeToFull = parseInt(value);
			if (channel.batteryTimeToFull == 65535){
				variable = 'Unknown';
			}
			else if (channel.batteryTimeToFull == 65534) {
				variable = 'Charged';
			}
			else {
				let mins = channel.batteryTimeToFull;
				let h = Math.floor(mins / 60);
				let m = mins % 60;
				m = m < 10 ? '0' + m : m;
				variable = `${h}:${m}`;
			}
			this.instance.setVariable(prefix + 'battery_time_to_full', variable);
		}
	}

	/**
	 * Update a receiver property.
	 *
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateReceiver(key, value) {

		if (value == 'UNKN' || value == 'UNKNOWN') {
			value = 'Unknown';
		}

		if (key == 'FW_VER') {
			this.receiver.firmwareVersion = value.replace('{','').replace('}','');
			this.instance.setVariable('firmware_version', this.receiver.firmwareVersion);
		}
		else if (key == 'DEVICE_ID') {
			this.receiver.deviceId = value.replace('{','').replace('}','');
			this.instance.setVariable('device_id', this.receiver.deviceId);
		}
		else if (key == 'FREQUENCY_DIVERSITY_MODE') {
			this.receiver.frequencyDiversity = value;
			this.instance.setVariable('frequency_diversity_mode', value);
		}
		else if (key == 'AUDIO_SUMMING_MODE') {
			this.receiver.audioSumming = value;
			this.instance.setVariable('audio_summing_mode', value);
		}
		else if (key =='HIGH_DENSITY' || key == 'TRANSMISSION_MODE') { // changed from: (key =='HIGH_DENSITY' || id == 'TRANSMISSION_MODE') in order to try fix the "Reference error: id is not defined" error (ticket #5 and #6)

			if (value == 'STANDARD') {
				value = 'OFF';
			}
			else if (value == 'HIGH_DENSITY') {
				value = 'ON';
			}

			this.receiver.highDensity = value;
			this.instance.setVariable('high_density_mode', value);
		}
		else if (key.match(/ENCRYPTION/)) {
			this.receiver.encryption = value;
			this.instance.setVariable('encryption', value);
		}
		else if (key == 'FLASH') {
			this.receiver.flash = value;
			this.instance.setVariable('flash', value);
		}
		else if (key == 'QUADVERSITY_MODE') {
			this.receiver.quadversityMode = value;
			this.instance.setVariable('quadversity_mode', value);
		}
		else if (key == 'MODEL') {
			this.receiver.model = value;
			this.instance.setVariable('model', value);
		}
		else if (key == 'RF_BAND') {
			this.receiver.rfBand = value;
			this.instance.setVariable('rf_band', value);
		}
	}

	/**
	 * Update a slot property.
	 *
	 * @param {number} channel - the channel id
	 * @param {number} id - the slot id
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateSlot(channel, id, key, value) {
		var slot = this.getSlot(channel, id);
		var prefix = 'ch_' + channel + '_slot_' + id + '_';
		var variable;

		if (value == 'UNKN' || value == 'UNKNOWN') {
			value = 'Unknown';
		}

		switch(key) {
			case 'SLOT_STATUS':
				slot.status = value;
				this.instance.setVariable(prefix + 'status', value);
				break;
			case 'SLOT_SHOWLINK_STATUS':
				slot.showLinkStatus = parseInt(value);
				if (value == 255){
					variable = 'Unknown';
				}
				else {
					variable = value;
				}
				this.instance.setVariable(prefix + 'link_status', variable);
				break;
			case 'SLOT_TX_MODEL':
				slot.txType = value;
				this.instance.setVariable(prefix + 'tx_model', value);
				break;
			case 'SLOT_TX_DEVICE_ID':
				slot.txDeviceId = value.replace('{','').replace('}','');
				this.instance.setVariable(prefix + 'tx_device_id', slot.txDeviceId);
				this.instance.actions();
				this.instance.initFeedbacks();
				break;
			case 'SLOT_OFFSET':
				slot.txOffset = parseInt(value);
				if (slot.txOffset == 255){
					variable = 'Unknown';
				}
				else {
					variable = (slot.txOffset - 12).toString() + ' dB';
				}
				this.instance.setVariable(prefix + 'tx_offset', variable);
				break;
			case 'SLOT_INPUT_PAD':
				slot.txInputPad = parseInt(value);
				if (slot.txInputPad == 255){
					variable = 'Unknown';
				}
				else {
					variable = (slot.txInputPad - 12).toString() + ' dB';
				}
				this.instance.setVariable(prefix + 'tx_input_pad', variable);
				break;
			case 'SLOT_RF_POWER':
				slot.txPowerLevel = parseInt(value);
				if (slot.txPowerLevel == 255){
					variable = 'Unknown';
				}
				else {
					variable = value + ' mW';
				}
				this.instance.setVariable(prefix + 'tx_power_level', variable);
				break;
			case 'SLOT_RF_POWER_MODE':
				slot.txPowerMode = value;
				this.instance.setVariable(prefix + 'tx_power_mode', value);
				break;
			case 'SLOT_POLARITY':
				slot.txPolarity = value;
				this.instance.setVariable(prefix + 'tx_polarity', value);
				break;
			case 'SLOT_RF_OUTPUT':
				slot.txRfOutput = value;
				if (value == 'RF_ON') {
					variable = 'ON';
				}
				else if (value == 'RF_MUTE') {
					variable = 'MUTE';
				}
				else {
					variable = value;
				}
				this.instance.setVariable(prefix + 'rf_output', variable);
				break;
			case 'SLOT_BATT_BARS':
				slot.batteryBars = parseInt(value);
				if (slot.batteryBars == 255){
					variable = 'Unknown';
				}
				else {
					variable = value;
				}
				this.instance.setVariable(prefix + 'battery_bars', variable);
				break;
			case 'SLOT_BATT_CHARGE_PERCENT':
				slot.batteryCharge = parseInt(value);
				if (slot.batteryCharge == 255){
					variable = 'Unknown';
				}
				else {
					variable = value + '%';
				}
				this.instance.setVariable(prefix + 'battery_charge', variable);
				break;
			case 'SLOT_BATT_CYCLE_COUNT':
				slot.batteryCycle = parseInt(value);
				if (slot.batteryCycle == 65535){
					variable = 'Unknown';
				}
				else {
					variable = value;
				}
				this.instance.setVariable(prefix + 'battery_cycle', variable);
				break;
			case 'SLOT_BATT_HEALTH_PERCENT':
				slot.batteryHealth = parseInt(value);
				if (slot.batteryHealth == 255){
					variable = 'Unknown';
				}
				else {
					variable = value + '%';
				}
				this.instance.setVariable(prefix + 'battery_health', variable);
				break;
			case 'SLOT_BATT_MINS':
				slot.batteryRuntime = parseInt(value);
				if (slot.batteryRuntime == 65535){
					variable = 'Unknown';
				}
				else if (slot.batteryRuntime == 65534) {
					variable = 'Calculating';
				}
				else if (slot.batteryRuntime == 65533) {
					variable = 'Error';
				}
				else {
					let mins = slot.batteryRuntime;
					let h = Math.floor(mins / 60);
					let m = mins % 60;
					m = m < 10 ? '0' + m : m;
					variable = `${h}:${m}`;
				}
				this.instance.setVariable(prefix + 'battery_runtime', variable);
				break;
			case 'SLOT_BATT_TYPE':
				slot.batteryType = value;
				this.instance.setVariable(prefix + 'battery_type', value);
				break;
		}
	}
}

exports = module.exports = instance_api;