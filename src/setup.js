function CreateModelChoices() {
	let choices = Object.values(Models)
	// Sort alphabetical
	choices.sort(function (a, b) {
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

	return choices
}

export const Models = {
	ulxd4: { id: 'ulxd4', family: 'ulx', label: 'ULXD4 Single Receiver', channels: 1, slots: 0 },
	ulxd4d: { id: 'ulxd4d', family: 'ulx', label: 'ULXD4D Dual Receiver', channels: 2, slots: 0 },
	ulxd4q: { id: 'ulxd4q', family: 'ulx', label: 'ULXD4Q Quad Receiver', channels: 4, slots: 0 },
	qlxd4: { id: 'qlxd4', family: 'qlx', label: 'QLXD4 Single Receiver', channels: 1, slots: 0 },
	ad4d: { id: 'ad4d', family: 'ad', label: 'AD4D Dual Receiver', channels: 2, slots: 8 },
	ad4q: { id: 'ad4q', family: 'ad', label: 'AD4Q Quad Receiver', channels: 4, slots: 8 },
	slxd4: { id: 'slxd4', family: 'slx', label: 'SLXD4 Single Receiver', channels: 1, slots: 0 },
	slxd4d: { id: 'slxd4d', family: 'slx', label: 'SLXD4D Dual Receiver', channels: 2, slots: 0 },
}

export const Choices = {
	Models: CreateModelChoices(),
	OnOffToggle: [
		{ id: 'ON', label: 'Mute' },
		{ id: 'OFF', label: 'Unmute' },
		{ id: 'TOGGLE', label: 'Toggle Mute/Unmute' },
	],
	RfOutput: [
		{ id: 'RF_ON', label: 'RF On' },
		{ id: 'RF_MUTE', label: 'RF Mute' },
	],
	RfPower: [
		{ id: 'LOW', label: 'Low' },
		{ id: 'NORMAL', label: 'Normal' },
		{ id: 'HIGH', label: 'High' },
	],
	SlotStatus: [
		{ id: 'EMPTY', label: 'Empty' },
		{ id: 'STANDARD', label: 'Standard' },
		{ id: 'LINKED.INACTIVE', label: 'Linked - Inactive' },
		{ id: 'LINKED.ACTIVE', label: 'Linked - Active' },
	],
}

export const Regex = {
	Frequency: '/^(4[7-9][0-9]|[5-8][0-9]{2}|9[0-2][0-9]|93[0-7])\\.\\d(00|25|50|75)$/',
	Name: '/^.{1,8}$/',
}

export const Fields = {
	BatteryLevel: {
		type: 'number',
		label: 'Battery Alert Level',
		id: 'barlevel',
		min: 1,
		max: 5,
		default: 2,
		required: true,
		range: true,
	},
	Frequency: {
		type: 'textinput',
		label: 'Frequency (MHz)',
		id: 'value',
		default: '470.000',
		useVariables: true,
		// regex: '/^(4[7-9][0-9]|[5-8][0-9]{2}|9[0-2][0-9]|93[0-7])\\.\\d(00|25|50|75)$/',
	},
	GainIncrement: {
		type: 'textinput',
//		type: 'number',
		label: 'Gain Value (dB)',
		id: 'gain',
		min: 1,
		max: 60,
		default: 3,
		useVariables: true,
		required: true,
		range: true,
	},
	GainSet: {
		type: 'textinput',
//		type: 'number',
		label: 'Gain Value (dB)',
		id: 'gain',
		min: -18,
		max: 42,
		default: 0,
		useVariables: true,
		required: true,
		range: true,
	},
	Mute: {
		type: 'dropdown',
		label: 'Mute/Unmute/Toggle',
		id: 'choice',
		default: 'ON',
		choices: Choices.OnOffToggle,
	},
	Name: {
		type: 'textinput',
		label: 'Name (8 characters max)',
		id: 'name',
		default: '',
		useVariables: true,
		// regex: '/^.{1,8}$/',
	},
	RfOutput: {
		type: 'dropdown',
		label: 'On/Off',
		id: 'onoff',
		default: 'RF_ON',
		choices: Choices.RfOutput,
	},
	RfPower: {
		type: 'dropdown',
		label: 'Power Level',
		id: 'power',
		default: '10',
		choices: Choices.RfPower,
	},
	SlotStatus: {
		type: 'dropdown',
		label: 'Status',
		id: 'value',
		default: 'LINKED.ACTIVE',
		choices: Choices.SlotStatus,
	},
}
