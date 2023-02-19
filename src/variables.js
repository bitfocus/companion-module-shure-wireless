/**
 * INTERNAL: initialize variables.
 *
 * @access protected
 * @since 1.0.0
 */
export function updateVariables() {
	let variables = []

	for (let i = 1; i <= this.model.channels; i++) {
		let prefix = `ch_${i}`

		variables.push({ variableId: `${prefix}_name`, name: `Channel ${i} Name` })
		variables.push({ variableId: `${prefix}_meter_rate`, name: `Channel ${i} Meter Rate` })
		variables.push({ variableId: `${prefix}_audio_gain`, name: `Channel ${i} Audio Gain` })

		if (this.model.family == 'ad' || this.model.family == 'ulx') {
			variables.push({ variableId: `${prefix}_audio_mute`, name: `Channel ${i} Audio Mute` })
		}

		variables.push({ variableId: `${prefix}_group_chan`, name: `Channel ${i} Group & Channel` })
		variables.push({ variableId: `${prefix}_frequency`, name: `Channel ${i} Frequency` })

		if (this.model.family != 'slx') {
			variables.push({ variableId: `${prefix}_encryption_status`, name: `Channel ${i} Encryption Status` })
		}

		/*if (this.model.family == 'ad' || this.model.family == 'slx') {
			variables.push({ variableId: `${prefix}_flash`, name: `Channel ${i} Flash` });
		}*/

		if (this.model.family == 'ad' || this.model.family == 'ulx') {
			variables.push({ variableId: `${prefix}_interference_status`, name: `Channel ${i} Interference Status` })
		}

		if (this.model.family == 'slx') {
			variables.push({ variableId: `${prefix}_audio_out_lvl_switch`, name: `Channel ${i} Audio Out Level Switch` })
		}

		if (this.model.family == 'ad') {
			variables.push({ variableId: `${prefix}_unregistered_tx_status`, name: `Channel ${i} Unregistered TX Status` })
			variables.push({ variableId: `${prefix}_fd_mode`, name: `Channel ${i} FD Mode` })
			variables.push({ variableId: `${prefix}_group_chan2`, name: `Channel ${i} Group & Channel 2` })
			variables.push({ variableId: `${prefix}_frequency2`, name: `Channel ${i} Frequency 2` })
			variables.push({ variableId: `${prefix}_interference_status2`, name: `Channel ${i} Interference Status 2` })
		}

		if (this.model.family != 'slx') {
			variables.push({ variableId: `${prefix}_antenna`, name: `Channel ${i} Antenna Status` })
		}

		if (this.model.family == 'ad') {
			variables.push({ variableId: `${prefix}_signal_quality`, name: `Channel ${i} Signal Quality` })
			variables.push({ variableId: `${prefix}_rf_level_a`, name: `Channel ${i} RF Level A` })
			variables.push({ variableId: `${prefix}_rf_level_b`, name: `Channel ${i} RF Level B` })
			variables.push({ variableId: `${prefix}_rf_level_c`, name: `Channel ${i} RF Level C` })
			variables.push({ variableId: `${prefix}_rf_level_d`, name: `Channel ${i} RF Level D` })
			variables.push({ variableId: `${prefix}_audio_level`, name: `Channel ${i} Audio Level RMS` })
			variables.push({ variableId: `${prefix}_audio_level_peak`, name: `Channel ${i} Audio Level Peak` })
		} else if (this.model.family == 'slx') {
			variables.push({ variableId: `${prefix}_rf_level`, name: `Channel ${i} RF Level` })
			variables.push({ variableId: `${prefix}_audio_level`, name: `Channel ${i} Audio Level RMS` })
			variables.push({ variableId: `${prefix}_audio_level_peak`, name: `Channel ${i} Audio Level Peak` })
		} else {
			variables.push({ variableId: `${prefix}_rf_level`, name: `Channel ${i} RF Level` })
			variables.push({ variableId: `${prefix}_audio_level`, name: `Channel ${i} Audio Level` })
		}

		variables.push({ variableId: `${prefix}_tx_model`, name: `Channel ${i} Transmitter Model` })

		if (this.model.family != 'slx') {
			variables.push({ variableId: `${prefix}_tx_device_id`, name: `Channel ${i} Transmitter Device ID` })
			variables.push({ variableId: `${prefix}_tx_offset`, name: `Channel ${i} Transmitter Offset` })
		}

		if (this.model.family == 'ad') {
			variables.push({ variableId: `${prefix}_tx_input_pad`, name: `Channel ${i} Transmitter Input Pad` })
			variables.push({ variableId: `${prefix}_tx_polarity`, name: `Channel ${i} Transmitter Polarity` })
		}

		if (this.model.family != 'slx') {
			variables.push({ variableId: `${prefix}_tx_power_level`, name: `Channel ${i} Transmitter Power Level` })
			variables.push({ variableId: `${prefix}_tx_mute_status`, name: `Channel ${i} Transmitter Mute Status` })
			variables.push({ variableId: `${prefix}_tx_lock`, name: `Channel ${i} Transmitter Lock` })
			variables.push({ variableId: `${prefix}_tx_power_lock`, name: `Channel ${i} Transmitter Power Lock` })
			variables.push({ variableId: `${prefix}_tx_menu_lock`, name: `Channel ${i} Transmitter Menu Lock` })
		}

		if (this.model.family == 'ulx' || this.model.family == 'qlx') {
			variables.push({ variableId: `${prefix}_tx_power_mode`, name: `Channel ${i} Transmitter Power Mode` })
		}

		if (this.model.family != 'ad' && this.model.family != 'slx') {
			variables.push({ variableId: `${prefix}_tx_power_source`, name: `Channel ${i} Transmitter Power Source` })
		}

		if (this.model.family != 'slx') {
			variables.push({ variableId: `${prefix}_tx_talk_switch`, name: `Channel ${i} Transmitter Mute Button Status` })
		}

		variables.push({ variableId: `${prefix}_battery_bars`, name: `Channel ${i} Battery Bars` })

		if (this.model.family != 'slx') {
			variables.push({ variableId: `${prefix}_battery_charge`, name: `Channel ${i} Battery Charge Status` })
		}

		if (this.model.family != 'slx') {
			variables.push({ variableId: `${prefix}_battery_cycle`, name: `Channel ${i} Battery Cycle` })
		}

		if (this.model.family == 'ad') {
			variables.push({ variableId: `${prefix}_battery_health`, name: `Channel ${i} Battery Health` })
		}

		variables.push({ variableId: `${prefix}_battery_runtime`, name: `Channel ${i} Battery Run Time` })

		if (this.model.family != 'slx') {
			variables.push({ variableId: `${prefix}_battery_temp_f`, name: `Channel ${i} Battery Temperature (F)` })
			variables.push({ variableId: `${prefix}_battery_temp_c`, name: `Channel ${i} Battery Temperature (C)` })
			variables.push({ variableId: `${prefix}_battery_type`, name: `Channel ${i} Battery Type` })
		}

		if (this.model.slots > 0) {
			for (let j = 1; j <= this.model.slots; j++) {
				let k = j < 10 ? '0' + j : j
				let id = `${i}-${k}`
				prefix = `slot_${id}`
				variables.push({ variableId: `${prefix}_status`, name: `Slot ${id} Status` })
				variables.push({ variableId: `${prefix}_link_status`, name: `Slot ${id} Showlink Status` })
				variables.push({ variableId: `${prefix}_tx_type`, name: `Slot ${id} Transmitter Type` })
				variables.push({ variableId: `${prefix}_tx_device_id`, name: `Slot ${id} Transmitter Device ID` })
				variables.push({ variableId: `${prefix}_tx_offset`, name: `Slot ${id} Transmitter Offset` })
				variables.push({ variableId: `${prefix}_tx_input_pad`, name: `Slot ${id} Transmitter Input Pad` })
				variables.push({ variableId: `${prefix}_tx_polarity`, name: `Slot ${id} Transmitter Polarity` })
				variables.push({ variableId: `${prefix}_tx_power_level`, name: `Slot ${id} Transmitter Power Level` })
				variables.push({ variableId: `${prefix}_tx_power_mode`, name: `Slot ${id} Transmitter Power Mode` })
				variables.push({ variableId: `${prefix}_tx_rf_output`, name: `Slot ${id} Transmitter RF Output` })
				variables.push({ variableId: `${prefix}_battery_bars`, name: `Slot ${id} Battery Bars` })
				variables.push({ variableId: `${prefix}_battery_charge`, name: `Slot ${id} Battery Charge Status` })
				variables.push({ variableId: `${prefix}_battery_cycle`, name: `Slot ${id} Battery Cycle` })
				variables.push({ variableId: `${prefix}_battery_health`, name: `Slot ${id} Battery Health` })
				variables.push({ variableId: `${prefix}_battery_runtime`, name: `Slot ${id} Battery Run Time` })
				variables.push({ variableId: `${prefix}_battery_type`, name: `Slot ${id} Battery Type` })
			}
		}
	}

	variables.push({ variableId: 'device_id', name: 'Device ID' })

	if (this.model.id == 'ulxd4d' || this.model.id == 'ulxd4q') {
		variables.push({ variableId: 'audio_summing_mode', name: 'Audio Summing Mode' })
		variables.push({ variableId: 'frequency_diversity_mode', name: 'Frequency Diversity Mode' })
	}

	if (this.model.family == 'ulx' || this.model.family == 'ad') {
		variables.push({ variableId: 'high_density_mode', name: 'High Density Mode' })
	}

	if (this.model.family == 'ad' || this.model.family == 'slx') {
		variables.push({ variableId: 'model', name: 'Receiver Model' })
		variables.push({ variableId: 'rf_band', name: 'RF Band' })
	}

	if (this.model.family == 'ad') {
		variables.push({ variableId: 'quadversity_mode', name: 'Quadversity Mode' })
	}

	if (this.model.family != 'slx') {
		variables.push({ variableId: 'encryption', name: 'Encryption' })
	}

	variables.push({ variableId: 'firmware_version', name: 'Firmware Version' })

	/*if (this.model.family != 'qlx') {
		variables.push({ variableId: 'flash', name: 'Flash Lights On/Off' });
	}*/

	if (this.model.family == 'slx') {
		variables.push({ variableId: 'lock_status', name: 'Lock Status' })
	}

	this.setVariableDefinitions(variables)
}
