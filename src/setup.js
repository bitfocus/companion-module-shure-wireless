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
	slxd4plus: {
		id: 'slxd4plus',
		family: 'slxplus',
		label: 'SLXD4+ Single Receiver',
		channels: 1,
		slots: 2,
		dante: false,
	},
	slxd4dplus: {
		id: 'slxd4dplus',
		family: 'slxplus',
		label: 'SLXD4D+ Dual Receiver',
		channels: 2,
		slots: 2,
		dante: false,
	},
	slxd4qplus: {
		id: 'slxd4qplus',
		family: 'slxplus',
		label: 'SLXD4Q+ Quad Receiver',
		channels: 4,
		slots: 2,
		dante: false,
	},
	slxd4qdanplus: {
		id: 'slxd4qdanplus',
		family: 'slxplus',
		label: 'SLXD4QDAN+ Quad Receiver (Dante)',
		channels: 4,
		slots: 2,
		dante: true,
	},
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
	OnOff: [
		{ id: 'ON', label: 'On' },
		{ id: 'OFF', label: 'Off' },
	],
	NetInterface: [
		{ id: 'SC', label: 'Shure Control' },
		{ id: 'D1', label: 'Dante Primary' },
		{ id: 'D2', label: 'Dante Secondary' },
	],
	NetIpMode: [
		{ id: 'AUTO', label: 'Automatic (DHCP)' },
		{ id: 'MANUAL', label: 'Manual' },
	],
	// Empirical from firmware 2.0.38.9: the receiver reports lowercase
	// `online` / `offline` on `< REP x LINK_STATUS s >`, NOT the dotted
	// LINKED.ACTIVE / LINKED.INACTIVE / EMPTY values the strings PDF v1.0
	// (2026-A) documents. `empty` is synthesized in the parser when
	// SLOT_TX_MODEL for the slot is the blank padded form.
	SlxPlusLinkStatus: [
		{ id: 'empty', label: 'Empty (no TX paired)' },
		{ id: 'online', label: 'Online (TX powered on)' },
		{ id: 'offline', label: 'Offline (TX paired but powered off)' },
	],
	SlxPlusTxModel: [
		{ id: 'SLXD1+', label: 'SLXD1+ Bodypack' },
		{ id: 'SLXD2+', label: 'SLXD2+ Handheld' },
		{ id: 'SLXD3+', label: 'SLXD3+ Plug-On' },
		{ id: 'UNKNOWN', label: 'Unknown' },
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
	GroupChannel: {
		type: 'textinput',
		label: 'Group,Channel (e.g. 6,100)',
		id: 'value',
		default: '1,1',
		useVariables: true,
	},
	OnOff: {
		type: 'dropdown',
		label: 'On / Off',
		id: 'value',
		default: 'ON',
		choices: Choices.OnOff,
	},
	TxName: {
		type: 'textinput',
		label: 'Transmitter Name (shown on TX display)',
		id: 'txname',
		default: '',
		useVariables: true,
	},
	MeterRate: {
		type: 'number',
		label: 'Meter Rate (ms, 0 = off, 100-65535)',
		id: 'rate',
		min: 0,
		max: 65535,
		default: 1000,
		required: true,
	},
	NetInterface: {
		type: 'dropdown',
		label: 'Network Interface',
		id: 'iface',
		default: 'SC',
		choices: Choices.NetInterface,
	},
	NetIpMode: {
		type: 'dropdown',
		label: 'IP Mode',
		id: 'ipmode',
		default: 'AUTO',
		choices: Choices.NetIpMode,
	},
	IpAddress: {
		type: 'textinput',
		label: 'IP Address (use "na" for AUTO)',
		id: 'ipaddr',
		default: 'na',
		useVariables: true,
	},
	SubnetMask: {
		type: 'textinput',
		label: 'Subnet Mask (use "na" for AUTO)',
		id: 'mask',
		default: 'na',
		useVariables: true,
	},
	Gateway: {
		type: 'textinput',
		label: 'Gateway (use "na" for AUTO, "000.000.000.000" = none)',
		id: 'gw',
		default: 'na',
		useVariables: true,
	},
	DanteChanName: {
		type: 'textinput',
		label: 'Dante Channel Name (1-31 chars, A-Z a-z 0-9 -)',
		id: 'name',
		default: '',
		useVariables: true,
	},
}
