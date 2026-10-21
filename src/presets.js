import { combineRgb } from '@companion-module/base'
import { getStatusDisplayDefaults } from './feedback.js'

/**
 * Provide ready-to-use channel status buttons for the configured receiver.
 *
 * @access protected
 * @since 2.3.3
 */
export function updatePresets() {
	const presets = {}
	const statusDefaults = getStatusDisplayDefaults(this.model.family)

	for (let channel = 1; channel <= this.model.channels; channel++) {
		presets[`channel_status_${channel}`] = {
			type: 'button',
			category: 'Channel status displays',
			name: `Channel ${channel} status`,
			style: {
				text: '',
				size: '7',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				show_topbar: false,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{
					feedbackId: 'sample',
					options: {
						channel,
						labels: statusDefaults.labels,
						icons: statusDefaults.icons,
						barlevel: 2,
					},
				},
			],
		}
	}

	this.setPresetDefinitions(presets)
}
