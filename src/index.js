import {
	CreateConvertToBooleanFeedbackUpgradeScript,
	InstanceBase,
	Regex,
	runEntrypoint,
	TCPHelper,
} from '@companion-module/base'
import { updateActions } from './actions.js'
import { updateFeedbacks } from './feedback.js'
import { updateVariables } from './variables.js'
import API from './internalAPI.js'
import { BooleanFeedbackUpgradeMap } from './upgrades.js'

/**
 * Companion instance class for the Shure Wireless Microphones.
 *
 * @extends InstanceBase
 * @since 1.0.0
 * @author Joseph Adams <josephdadams@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class ShureWirelessInstance extends InstanceBase {
	/**
	 * Create an instance of a shure WX module.
	 *
	 * @param {Object} internal - Companion internals
	 * @since 1.0.0
	 */
	constructor(internal) {
		super(internal)

		this.updateActions = updateActions.bind(this)
		this.updateFeedbacks = updateFeedbacks.bind(this)
		this.updateVariables = updateVariables.bind(this)
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	async configUpdated(config) {
		let resetConnection = false
		let cmd

		if (this.config.host != config.host) {
			resetConnection = true
		}

		if (this.config.meteringOn !== config.meteringOn) {
			if (config.meteringOn === true) {
				cmd = `< SET 0 METER_RATE ${this.config.meteringInterval} >`
			} else {
				cmd = '< SET 0 METER_RATE 0 >'
			}
		} else if (this.config.meteringRate != config.meteringRate && this.config.meteringOn === true) {
			cmd = `< SET 0 METER_RATE ${config.meteringInterval} >`
		}

		this.config = config

		if (this.CONFIG_MODEL[this.config.modelID] !== undefined) {
			this.model = this.CONFIG_MODEL[this.config.modelID]
		} else {
			this.log('debug', `Shure Model: ${this.config.modelID} NOT FOUND`)
		}

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariables()

		if (resetConnection === true || this.socket === undefined) {
			this.initTCP()
		} else if (cmd !== undefined) {
			this.socket.send(cmd)
		}
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	async destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
		}

		if (this.heartbeatInterval !== undefined) {
			clearInterval(this.heartbeatInterval)
		}

		if (this.heartbeatTimeout !== undefined) {
			clearTimeout(this.heartbeatTimeout)
		}

		this.log('debug', 'destroy', this.id)
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				default: 2202,
				width: 2,
				regex: Regex.PORT,
			},
			{
				type: 'dropdown',
				id: 'modelID',
				label: 'Model Type',
				choices: this.CHOICES_MODEL,
				width: 6,
				default: 'ulxd4',
			},
			{
				type: 'checkbox',
				id: 'meteringOn',
				label: 'Enable Metering?',
				width: 2,
				default: true,
			},
			{
				type: 'number',
				id: 'meteringInterval',
				label: 'Metering Interval (in ms)',
				width: 4,
				min: 500,
				max: 99999,
				default: 5000,
				required: true,
			},
			{
				type: 'dropdown',
				id: 'variableFormat',
				label: 'Variable Format',
				choices: [
					{ id: 'units', label: 'Include Units' },
					{ id: 'numeric', label: 'Numeric Only' },
				],
				width: 6,
				default: 'units',
				tooltip:
					'Changing this setting will apply to new values received.  To refresh all variables with the new setting, disable and re-enable the connection after saving these settings.',
			},
		]
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	async init(config) {
		this.config = config
		this.model = {}
		this.deviceName = ''
		this.initDone = false

		this.heartbeatInterval = null
		this.heartbeatTimeout = null

		this.CONFIG_MODEL = {
			ulxd4: { id: 'ulxd4', family: 'ulx', label: 'ULXD4 Single Receiver', channels: 1, slots: 0 },
			ulxd4d: { id: 'ulxd4d', family: 'ulx', label: 'ULXD4D Dual Receiver', channels: 2, slots: 0 },
			ulxd4q: { id: 'ulxd4q', family: 'ulx', label: 'ULXD4Q Quad Receiver', channels: 4, slots: 0 },
			qlxd4: { id: 'qlxd4', family: 'qlx', label: 'QLXD4 Single Receiver', channels: 1, slots: 0 },
			ad4d: { id: 'ad4d', family: 'ad', label: 'AD4D Dual Receiver', channels: 2, slots: 8 },
			ad4q: { id: 'ad4q', family: 'ad', label: 'AD4Q Quad Receiver', channels: 4, slots: 8 },
			slxd4: { id: 'slxd4', family: 'slx', label: 'SLXD4 Single Receiver', channels: 1, slots: 0 },
			slxd4d: { id: 'slxd4d', family: 'slx', label: 'SLXD4D Dual Receiver', channels: 2, slots: 0 },
		}

		this.CHOICES_CHANNELS = []
		this.CHOICES_CHANNELS_A = []
		this.CHOICES_SLOTS = []
		this.CHOICES_SLOTS_A = []

		this.CHOICES_MODEL = Object.values(this.CONFIG_MODEL)
		// Sort alphabetical
		this.CHOICES_MODEL.sort(function (a, b) {
			let x = a.label.toLowerCase()
			let y = b.label.toLowerCase()
			if (x < y) {
				return -1
			}
			if (x > y) {
				return 1
			}
			return 0
		})

		if (this.config.modelID !== undefined) {
			this.model = this.CONFIG_MODEL[this.config.modelID]
		} else {
			this.config.modelID = 'ulxd4'
			this.model = this.CONFIG_MODEL['ulxd4']
		}

		if (this.config.variableFormat === undefined) {
			this.config.variableFormat = 'units'
		}

		this.updateStatus('disconnected', 'Connecting')

		this.api = new API(this)

		this.setupFields()

		this.updateActions()
		this.updateVariables()
		this.updateFeedbacks()

		this.initTCP()
	}

	/**
	 * INTERNAL: use setup data to initalize the tcp socket object.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initTCP() {
		var receivebuffer = ''

		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		if (this.heartbeatInterval !== undefined) {
			clearInterval(this.heartbeatInterval)
		}

		if (this.heartbeatTimeout !== undefined) {
			clearTimeout(this.heartbeatTimeout)
		}

		if (this.config.port === undefined) {
			this.config.port = 2202
		}

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.log('error', `Network error: ${err.message}`)
			})

			this.socket.on('connect', () => {
				this.log('debug', 'Connected')
				let cmd = '< GET 0 ALL >'
				this.socket.send(cmd)

				if (this.config.meteringOn === true) {
					cmd = `< SET 0 METER_RATE ${this.config.meteringInterval} >`
					this.socket.send(cmd)
				}

				this.heartbeatInterval = setInterval(() => {
					this.socket.send('< GET 1 METER_RATE >')
				}, 30000)
			})

			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				let i = 0,
					line = '',
					offset = 0
				receivebuffer += chunk

				while ((i = receivebuffer.indexOf('>', offset)) !== -1) {
					line = receivebuffer.substr(offset, i - offset)
					offset = i + 1
					this.socket.emit('receiveline', line.toString())
				}

				receivebuffer = receivebuffer.substr(offset)
			})

			this.socket.on('receiveline', (line) => {
				this.processShureCommand(line.replace('< ', '').trim())

				if (line.match(/METER_RATE/)) {
					if (this.heartbeatTimeout !== undefined) {
						clearTimeout(this.heartbeatTimeout)
					}

					this.heartbeatTimeout = setTimeout(this.initTCP.bind(this), 60000)
				}
			})
		}
	}

	/**
	 * INTERNAL: Routes incoming data to the appropriate function for processing.
	 *
	 * @param {string} command - the command/data type being passed
	 * @access protected
	 * @since 1.0.0
	 */
	processShureCommand(command) {
		if ((typeof command === 'string' || command instanceof String) && command.length > 0) {
			let commandArr = command.split(' ')
			let commandType = commandArr.shift()
			let commandNum = parseInt(commandArr[0])

			let joinData = function (commands, start) {
				let out = ''
				if (commands.length > 0) {
					for (let i = start; i < commands.length; i++) {
						out += commands[i] + ' '
					}
				}
				return out.trim()
			}

			if (commandType == 'REP') {
				//this is a report command

				if (isNaN(commandNum)) {
					//this command isn't about a specific channel
					this.api.updateReceiver(commandArr[0], joinData(commandArr, 1))
				} else if (commandArr[1].startsWith('SLOT')) {
					//this command is about a specific SLOT in AD
					this.api.updateSlot(commandNum, parseInt(commandArr[2]), commandArr[1], joinData(commandArr, 3))
				} else {
					//this command is about a specific channel
					this.api.updateChannel(commandNum, commandArr[1], joinData(commandArr, 2))
				}
			} else if (commandType == 'SAMPLE') {
				//this is a sample command

				switch (this.model.family) {
					case 'ulx':
					case 'qlx':
						this.api.parseULXSample(commandNum, command)
						break
					case 'ad':
						this.api.parseADSample(commandNum, command)
						break
					case 'slx':
						this.api.parseSLXSample(commandNum, command)
						break
				}

				this.checkFeedbacks('sample')
			}
		}
	}

	/**
	 * INTERNAL: send a command to the receiver.
	 *
	 * @access protected
	 * @since 1.2.0
	 */
	sendCommand(cmd) {
		if (cmd !== undefined) {
			if (this.socket !== undefined && this.socket.isConnected) {
				this.socket.send(`< ${cmd} >`)
			} else {
				this.log('debug', 'Socket not connected :(')
			}
		}
	}

	/**
	 * INTERNAL: use model data to define the channel and slot choicess.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	setupChannelChoices() {
		this.CHOICES_CHANNELS = []
		this.CHOICES_CHANNELS_A = []
		this.CHOICES_SLOTS = []
		this.CHOICES_SLOTS_A = []

		if (this.model.channels > 1) {
			this.CHOICES_CHANNELS_A.push({ id: '0', label: 'All Channels' })
		}

		if (this.model.slots > 0) {
			this.CHOICES_SLOTS_A.push({ id: '0:0', label: 'All Channels & Slots' })
		}

		for (let i = 1; i <= this.model.channels; i++) {
			let data = `Channel ${i}`

			if (this.api.getChannel(i).name != '') {
				data += ' (' + this.api.getChannel(i).name + ')'
			}

			this.CHOICES_CHANNELS.push({ id: i, label: data })
			this.CHOICES_CHANNELS_A.push({ id: i, label: data })

			if (this.model.slots > 0) {
				this.CHOICES_SLOTS_A.push({ id: `${i}:0`, label: `${data}, All Slots` })

				for (let j = 1; j <= this.model.slots; j++) {
					let id = `${i}:${j}`
					data = id

					if (this.api.getSlot(i, j).txDeviceId != '') {
						data += ` (${this.api.getSlot(i, j).txDeviceId})`
					}

					this.CHOICES_SLOTS.push({ id: id, label: data })
					this.CHOICES_SLOTS_A.push({ id: id, label: data })
				}
			}
		}

		this.CHANNELS_FIELD.choices = this.CHOICES_CHANNELS
		this.CHANNELS_A_FIELD.choices = this.CHOICES_CHANNELS_A
		this.SLOTS_FIELD.choices = this.CHOICES_SLOTS
		this.SLOTS_A_FIELD.choices = this.CHOICES_SLOTS_A
	}

	/**
	 * Set up the fields used in actions and feedbacks
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupFields() {
		this.BATTERY_LEVEL_FIELD = {
			type: 'number',
			label: 'Battery Alert Level',
			id: 'barlevel',
			min: 1,
			max: 5,
			default: 2,
			required: true,
			range: true,
		}
		this.CHANNELS_FIELD = {
			type: 'dropdown',
			label: 'Channel',
			id: 'channel',
			default: '1',
			choices: this.CHOICES_CHANNELS,
		}
		this.CHANNELS_A_FIELD = {
			type: 'dropdown',
			label: 'Channel',
			id: 'channel',
			default: '1',
			choices: this.CHOICES_CHANNELS_A,
		}
		this.FREQUENCY_FIELD = {
			type: 'textinput',
			label: 'Frequency (MHz)',
			id: 'value',
			default: '470.000',
			regex: '/^(4[7-9][0-9]|[5-8][0-9]{2}|9[0-2][0-9]|93[0-7])\\.\\d(00|25|50|75)$/',
		}
		this.GAIN_INC_FIELD = {
			type: 'number',
			label: 'Gain Value (dB)',
			id: 'gain',
			min: 1,
			max: 60,
			default: 3,
			required: true,
			range: true,
		}
		this.GAIN_SET_FIELD = {
			type: 'number',
			label: 'Gain Value (dB)',
			id: 'gain',
			min: -18,
			max: 42,
			default: 0,
			required: true,
			range: true,
		}
		this.MUTE_FIELD = {
			type: 'dropdown',
			label: 'Mute/Unmute/Toggle',
			id: 'choice',
			default: 'ON',
			choices: [
				{ id: 'ON', label: 'Mute' },
				{ id: 'OFF', label: 'Unmute' },
				{ id: 'TOGGLE', label: 'Toggle Mute/Unmute' },
			],
		}
		this.NAME_FIELD = {
			type: 'textinput',
			label: 'Name (8 characters max)',
			id: 'name',
			default: '',
			regex: '/^.{1,8}$/',
		}
		this.RFOUTPUT_FIELD = {
			type: 'dropdown',
			label: 'On/Off',
			id: 'onoff',
			default: 'RF_ON',
			choices: [
				{ id: 'RF_ON', label: 'RF On' },
				{ id: 'RF_MUTE', label: 'RF Mute' },
			],
		}
		this.RFPOWER_FIELD = {
			type: 'dropdown',
			label: 'Power Level',
			id: 'power',
			default: '10',
			choices: [
				{ id: 'LOW', label: 'Low' },
				{ id: 'NORMAL', label: 'Normal' },
				{ id: 'HIGH', label: 'High' },
			],
		}
		this.SLOTS_FIELD = {
			type: 'dropdown',
			label: 'Slot Number',
			id: 'slot',
			default: '1:1',
			choices: this.CHOICES_SLOTS,
		}
		this.SLOTS_A_FIELD = {
			type: 'dropdown',
			label: 'Slot Number',
			id: 'slot',
			default: '1:1',
			choices: this.CHOICES_SLOTS_A,
		}
		this.SLOT_STATUS_FIELD = {
			type: 'dropdown',
			label: 'Status',
			id: 'value',
			default: 'LINKED.ACTIVE',
			choices: [
				{ id: 'EMPTY', label: 'Empty' },
				{ id: 'STANDARD', label: 'Standard' },
				{ id: 'LINKED.INACTIVE', label: 'Linked - Inactive' },
				{ id: 'LINKED.ACTIVE', label: 'Linked - Active' },
			],
		}
	}
}

runEntrypoint(ShureWirelessInstance, [CreateConvertToBooleanFeedbackUpgradeScript(BooleanFeedbackUpgradeMap)])
