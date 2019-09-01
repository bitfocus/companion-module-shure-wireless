module.exports = {

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initVariables() {
		// variable_set
		var variables = [];

		for (let i = 1; i <= this.model.channels; i++) {
			let prefix = 'ch_' + i + '_';

			variables.push({ name: prefix +'name',       label: 'Channel ' + i + ' Name' });
			variables.push({ name: prefix +'meter_rate', label: 'Channel ' + i + ' Meter Rate' });
			variables.push({ name: prefix +'audio_gain', label: 'Channel ' + i + ' Audio Gain' });

			if (this.model.family == 'ad' || this.model.family == 'ulx') {
				variables.push({ name: prefix +'audio_mute', label: 'Channel ' + i + ' Audio Mute' });
				variables.push({ name: prefix +'group_chan', label: 'Channel ' + i + ' Group & Channel' });
				variables.push({ name: prefix +'frequency',  label: 'Channel ' + i + ' Frequency' });
			}

			if (this.model.family != 'mxw') {
				variables.push({ name: prefix +'encryption_status', label: 'Channel ' + i + ' Encryption Status' });
			}

			if (this.model.family == 'ad' || this.model.family == 'mxw') {
				variables.push({ name: prefix +'flash', label: 'Channel ' + i + ' Flash' });
			}

			if (this.model.family == 'ad' || this.model.family == 'ulx') {
				variables.push({ name: prefix +'interference_status', label: 'Channel ' + i + ' Interference Status' });
			}

			if (this.model.family == 'ad') {
				variables.push({ name: prefix +'unregistered_tx_status', label: 'Channel ' + i + ' Unregistered TX Status' });
				variables.push({ name: prefix +'fd_mode',                label: 'Channel ' + i + ' FD Mode' });
				variables.push({ name: prefix +'group_chan2',            label: 'Channel ' + i + ' Group & Channel 2' });
				variables.push({ name: prefix +'frequency2',             label: 'Channel ' + i + ' Frequency 2' });
				variables.push({ name: prefix +'interference_status2',   label: 'Channel ' + i + ' Interference Status 2' });
			}

			if (this.model.family != 'mxw') {
				variables.push({ name: prefix +'antenna', label: 'Channel ' + i + ' Antenna Status' });
			}

			if (this.model.family == 'ad') {
				variables.push({ name: prefix +'rf_level_a',       label: 'Channel ' + i + ' RF Level A' });
				variables.push({ name: prefix +'rf_level_b',       label: 'Channel ' + i + ' RF Level B' });
				variables.push({ name: prefix +'rf_level_c',       label: 'Channel ' + i + ' RF Level C' });
				variables.push({ name: prefix +'rf_level_d',       label: 'Channel ' + i + ' RF Level D' });
				variables.push({ name: prefix +'audio_level',      label: 'Channel ' + i + ' Audio Level RMS' });
				variables.push({ name: prefix +'audio_level_peak', label: 'Channel ' + i + ' Audio Level Peak' });
			}
			else {
				variables.push({ name: prefix +'rf_level',        label: 'Channel ' + i + ' RF Level' });
				variables.push({ name: prefix +'audio_level',     label: 'Channel ' + i + ' Audio Level' });
			}

			variables.push({ name: prefix +'tx_type',             label: 'Channel ' + i + ' Transmitter Type' });

			if (this.model.family == 'mxw') {
				variables.push({ name: prefix +'tx_available',    label: 'Channel ' + i + ' Transmitter Available' });
				variables.push({ name: prefix +'tx_status',       label: 'Channel ' + i + ' Transmitter Status' });
			}

			if (this.model.family != 'mxw') {
				variables.push({ name: prefix +'tx_device_id',    label: 'Channel ' + i + ' Transmitter Device ID' });
				variables.push({ name: prefix +'tx_offset',       label: 'Channel ' + i + ' Transmitter Offset' });
			}

			if (this.model.famiy == 'ad') {
				variables.push({ name: prefix +'tx_input_pad',    label: 'Channel ' + i + ' Transmitter Input Pad' });
				variables.push({ name: prefix +'tx_polarity',     label: 'Channel ' + i + ' Transmitter Polarity' });
			}

			if (this.model.family != 'mxw') {
				variables.push({ name: prefix +'tx_power_level',  label: 'Channel ' + i + ' Transmitter Power Level' });
				variables.push({ name: prefix +'tx_power_mode',   label: 'Channel ' + i + ' Transmitter Power Mode' });
				variables.push({ name: prefix +'tx_mute_status',  label: 'Channel ' + i + ' Transmitter Mute Status' });
				variables.push({ name: prefix +'tx_lock',         label: 'Channel ' + i + ' Transmitter Lock' });
				variables.push({ name: prefix +'tx_power_lock',   label: 'Channel ' + i + ' Transmitter Power Lock' });
				variables.push({ name: prefix +'tx_menu_lock',    label: 'Channel ' + i + ' Transmitter Menu Lock' });
			}

			if (this.model.famiy != 'ad') {
				variables.push({ name: prefix +'tx_power_source', label: 'Channel ' + i + ' Transmitter Power Source' });
			}

			variables.push({ name: prefix +'tx_talk_switch',      label: 'Channel ' + i + ' Transmitter Mute Button Status' });

			if (this.model.family != 'mxw') {
				variables.push({ name: prefix +'battery_bars',    label: 'Channel ' + i + ' Battery Bars' });
			}

			variables.push({ name: prefix +'battery_charge',      label: 'Channel ' + i + ' Battery Charge Status' });

			if (this.model.family != 'mxw') {
				variables.push({ name: prefix +'battery_cycle',   label: 'Channel ' + i + ' Battery Cycle' });
			}

			if (this.model.family == 'ad' || this.model.family == 'mxw') {
				variables.push({ name: prefix +'battery_health',  label: 'Channel ' + i + ' Battery Health' });
			}

			variables.push({ name: prefix +'battery_runtime',     label: 'Channel ' + i + ' Battery Run Time' });

			if (this.model.family != 'mxw') {
				variables.push({ name: prefix +'battery_temp_f',  label: 'Channel ' + i + ' Battery Temperature (F)' });
				variables.push({ name: prefix +'battery_temp_c',  label: 'Channel ' + i + ' Battery Temperature (C)' });
				variables.push({ name: prefix +'battery_type',    label: 'Channel ' + i + ' Battery Type' });
			}

			if (this.model.family == 'mxw') {
				variables.push({ name: prefix +'battery_time_to_full', label: 'Channel ' + i + ' Battery Type' });
				variables.push({ name: prefix +'led_status_green',     label: 'Channel ' + i + ' Green LED Status' });
				variables.push({ name: prefix +'led_status_red',       label: 'Channel ' + i + ' Red LED Status' });
			}

			if (this.model.slots > 0) {
				for (var j = 1; j <= this.model.slots; j++) {
					let k = j < 10 ? '0' + j : j;
					let id = `${i}:${k}`;
					prefix = 'slot_' + id + '_';
					variables.push({ name: prefix +'status',          label: 'Slot ' + id + ' Status' });
					variables.push({ name: prefix +'link_status',     label: 'Slot ' + id + ' Showlink Status' });
					variables.push({ name: prefix +'tx_type',         label: 'Slot ' + id + ' Transmitter Type' });
					variables.push({ name: prefix +'tx_device_id',    label: 'Slot ' + id + ' Transmitter Device ID' });
					variables.push({ name: prefix +'tx_offset',       label: 'Slot ' + id + ' Transmitter Offset' });
					variables.push({ name: prefix +'tx_input_pad',    label: 'Slot ' + id + ' Transmitter Input Pad' });
					variables.push({ name: prefix +'tx_polarity',     label: 'Slot ' + id + ' Transmitter Polarity' });
					variables.push({ name: prefix +'tx_power_level',  label: 'Slot ' + id + ' Transmitter Power Level' });
					variables.push({ name: prefix +'tx_power_mode',   label: 'Slot ' + id + ' Transmitter Power Mode' });
					variables.push({ name: prefix +'tx_rf_output',    label: 'Slot ' + id + ' Transmitter RF Output' });
					variables.push({ name: prefix +'battery_bars',    label: 'Slot ' + id + ' Battery Bars' });
					variables.push({ name: prefix +'battery_charge',  label: 'Slot ' + id + ' Battery Charge Status' });
					variables.push({ name: prefix +'battery_cycle',   label: 'Slot ' + id + ' Battery Cycle' });
					variables.push({ name: prefix +'battery_health',  label: 'Slot ' + id + ' Battery Health' });
					variables.push({ name: prefix +'battery_runtime', label: 'Slot ' + id + ' Battery Run Time' });
					variables.push({ name: prefix +'battery_type',    label: 'Slot ' + id + ' Battery Type' });
				}
			}
		}

		variables.push({ name: 'device_id', label: 'Device ID' });

		if (this.model.id == 'ulxd4d' || this.model.id == 'ulxd4q') {
			variables.push({ name: 'audio_summing_mode',       label: 'Audio Summing Mode' });
			variables.push({ name: 'frequency_diversity_mode', label: 'Frequency Diversity Mode' });
		}

		if (this.model.family == 'ulx' || this.model.family == 'ad') {
			variables.push({ name: 'high_density_mode', label: 'High Density Mode' });
		}

		if (this.model.family == 'ad') {
			variables.push({ name: 'model',            label: 'Receiver Model' });
			variables.push({ name: 'quadversity_mode', label: 'Quadversity Mode' });
			variables.push({ name: 'rf_band',          label: 'RF Band' });
		}

		if ( this.model.family != 'mxw') {
			variables.push({ name: 'encryption',       label: 'Encryption' });
			variables.push({ name: 'firmware_version', label: 'Firmware Version' });
		}

		if (this.model.family != 'qlx') {
			variables.push({ name: 'flash_lights', label: 'Flash Lights On/Off' });
		}

		this.setVariableDefinitions(variables);
	}
}