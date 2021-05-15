module.exports = {
	/**
	 * INTERNAL: add various upgrade scripts
	 *
	 * @access protected
	 * @since 1.2.0
	 */
	 addUpgradeScripts() {
		 // v1.x -> v1.2.0
		this.addUpgradeToBooleanFeedbackScript({
			battery_level: true,
			channel_muted: true,
			transmitter_muted: true,
			interference_status: true,
			channel_frequency: true,
			transmitter_turned_off: true,
			slot_is_active: true,
			slot_status: true,
			slot_rf_output: true,
			slot_rf_power: true,
		})
	}
}
