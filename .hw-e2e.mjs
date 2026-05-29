// End-to-end probe: open TCP to the real receiver, feed every REP/SAMPLE
// through the actual module parsers via a fake instance, then dump the
// resulting state and assert key invariants.
//
// This is the most honest verification we can do without launching
// Companion itself — every byte that goes through the parser came off
// the real wire, and every state write that lands on the fake instance
// is what Companion would see.
import net from 'node:net'
import WirelessApi from './src/internalAPI.js'
import { Models } from './src/setup.js'

const HOST = process.argv[2] ?? '192.168.144.197'
const PORT = 2202
const WAIT_MS = 4500

const MODEL = Models.slxd4qdanplus
const captured = {
	variables: new Map(),
	feedbackChecks: [],
}
const inst = {
	model: MODEL,
	config: { variableFormat: 'units', meteringOn: false, meteringInterval: 5000 },
	setVariableValues: (v) => {
		for (const [k, val] of Object.entries(v)) captured.variables.set(k, val)
	},
	setVariableDefinitions: () => {},
	setActionDefinitions: () => {},
	setFeedbackDefinitions: () => {},
	setPresetDefinitions: () => {},
	checkFeedbacks: (...names) => captured.feedbackChecks.push(names.join(',')),
	updateActions: () => {},
	updateFeedbacks: () => {},
	updateStatus: () => {},
	log: () => {},
}
inst.api = new WirelessApi(inst)

// --- Mirror the routing in src/index.js processShureCommand ---
function routeRep(commandArr) {
	const commandNum = parseInt(commandArr[0])
	const joinData = (arr, start) =>
		arr
			.slice(start)
			.join(' ')
			.trim()
	if (Number.isNaN(commandNum)) {
		inst.api.updateReceiver(commandArr[0], joinData(commandArr, 1))
	} else if (commandArr[1].startsWith('SLOT')) {
		inst.api.updateSlot(commandNum, parseInt(commandArr[2]), commandArr[1], joinData(commandArr, 3))
	} else if (
		MODEL.family === 'slxplus' &&
		(commandArr[1] === 'LINK_STATUS' || commandArr[1] === 'LINK_TX_BATT_MINS')
	) {
		inst.api.updateSlot(commandNum, parseInt(commandArr[2]), commandArr[1], joinData(commandArr, 3))
	} else {
		inst.api.updateChannel(commandNum, commandArr[1], joinData(commandArr, 2))
	}
}

function feed(msg) {
	// Strip the angle bracket frame
	const inner = msg.replace(/^<\s*/, '').replace(/\s*>$/, '')
	const arr = inner.split(' ')
	const type = arr.shift()
	if (type === 'REP') routeRep(arr)
	else if (type === 'SAMPLE') {
		// arr[0] = channel, parseSlxPlusSample needs full string starting with SAMPLE
		inst.api.parseSlxPlusSample(parseInt(arr[0]), 'SAMPLE ' + arr.join(' '))
	}
}

const sock = new net.Socket()
let received = ''
sock.setEncoding('ascii')

sock.on('connect', () => {
	console.log(`> connected to ${HOST}:${PORT}, fanning out 4 channel discoveries`)
	for (let ch = 1; ch <= MODEL.channels; ch++) {
		sock.write(`< GET ${ch} ALL >\r\n`)
	}
	setTimeout(() => sock.end(), WAIT_MS)
})
sock.on('data', (chunk) => (received += chunk))
sock.on('error', (e) => {
	console.error('! socket error:', e.message)
	process.exitCode = 1
})
sock.on('close', () => {
	const msgs = received
		.split(/(?<=>)\s*(?=<)/)
		.map((s) => s.trim())
		.filter(Boolean)
	console.log(`> received ${msgs.length} messages, feeding through real parsers`)
	for (const m of msgs) {
		try {
			feed(m)
		} catch (err) {
			console.error('  ! parser threw on', m, '—', err.message)
			process.exitCode = 1
		}
	}

	console.log('\n=== RECEIVER STATE ===')
	console.log('model:', inst.api.receiver.model)
	console.log('firmwareVersion:', inst.api.receiver.firmwareVersion)
	console.log('deviceId:', inst.api.receiver.deviceId)
	console.log('rfBand:', inst.api.receiver.rfBand)
	console.log('encryptionMode:', inst.api.receiver.encryptionMode)
	console.log('appConnEnabled:', inst.api.receiver.appConnEnabled)
	console.log('audioSumming:', inst.api.receiver.audioSumming)
	console.log('naDeviceName:', inst.api.receiver.naDeviceName)
	console.log('netSettings.SC:', inst.api.receiver.netSettings?.SC)
	console.log('netSettings.D1:', inst.api.receiver.netSettings?.D1)

	for (let ch = 1; ch <= MODEL.channels; ch++) {
		const c = inst.api.getChannel(ch)
		console.log(`\n=== CHANNEL ${ch} ===`)
		console.log('  name:', JSON.stringify(c.name))
		console.log('  frequency:', c.frequency, 'kHz')
		console.log('  audioGain:', c.audioGain, 'dB')
		console.log('  groupChan:', c.groupChan)
		console.log('  audioOutLevelSwitch:', c.audioOutLevelSwitch)
		console.log('  encryptionStatus:', c.encryptionStatus)
		console.log('  interferenceStatus:', c.interferenceStatus)
		console.log('  rfLevel:', c.rfLevel, 'dBm  rfBitmapA:', c.rfBitmapA, 'rfBitmapB:', c.rfBitmapB)
		console.log('  audioLevel:', c.audioLevel, 'dBFS  audioLevelPeak:', c.audioLevelPeak)
		console.log('  antenna:', c.antenna, '(A:', c.antennaA, '/ B:', c.antennaB, ')')
		console.log('  txType (channel-scoped):', c.txType)
		console.log('  txBatteryBars:', c.batteryBars, '  txBatteryRuntime:', c.batteryRuntime)
		console.log('  naChanName:', JSON.stringify(c.naChanName))
		for (let s = 1; s <= MODEL.slots; s++) {
			const sl = inst.api.getSlot(ch, s)
			console.log(`  slot ${s}: txType=${JSON.stringify(sl.txType)}  status=${sl.status}  linkTxBattMins=${sl.linkTxBattMins}`)
		}
	}

	console.log(`\n> feedback rechecks fired: ${captured.feedbackChecks.length}`)
	console.log(`> variable writes: ${captured.variables.size}`)

	// --- Invariant assertions ---
	console.log('\n=== INVARIANTS ===')
	const pass = (cond, msg) => console.log(cond ? `  ✓ ${msg}` : `  ✗ ${msg}`) || (cond ? 0 : (process.exitCode = 1))
	pass(inst.api.receiver.model && inst.api.receiver.model.includes('SLXD4QDAN+'), 'model populated from MODEL REP')
	pass(inst.api.receiver.deviceId === 'SLXD4Q+D', 'deviceId trimmed correctly')
	pass(typeof inst.api.receiver.firmwareVersion === 'string' && inst.api.receiver.firmwareVersion.length > 0, 'firmwareVersion populated')
	pass(inst.api.receiver.appConnEnabled === 'ON' || inst.api.receiver.appConnEnabled === 'OFF', 'APP_CONN(ECTION)_ENABLED parsed')
	pass(inst.api.receiver.audioSumming === 'ON' || inst.api.receiver.audioSumming === 'OFF', 'AUDIO_SUMMING_MODE parsed')
	pass(inst.api.receiver.netSettings?.SC?.ipAddr?.length > 0, 'NET_SETTINGS SC parsed')
	for (let ch = 1; ch <= MODEL.channels; ch++) {
		const c = inst.api.getChannel(ch)
		pass(c.name && !c.name.includes('{'), `CH${ch} name has no braces`)
		// LINK_STATUS for both slots must be online/offline/'' (empty if no REP yet)
		for (let s = 1; s <= MODEL.slots; s++) {
			const sl = inst.api.getSlot(ch, s)
			pass(
				sl.status === 'online' || sl.status === 'offline' || sl.status === 'EMPTY',
				`CH${ch} slot${s} status is online/offline/EMPTY (got ${sl.status})`,
			)
			pass(!sl.txType?.includes('{'), `CH${ch} slot${s} txType has no braces`)
		}
	}
})

sock.connect(PORT, HOST)
