// Hardware probe for the real SLXD4QDAN+ at 192.168.144.197:2202.
// Connects, sends discovery + a curated set of "open question" commands,
// captures all responses for 4 seconds, prints them. Not committed.
import net from 'node:net'

const HOST = process.argv[2] ?? '192.168.144.197'
const PORT = 2202
const WAIT_MS = 4000

const probes = [
	// Discovery — should produce a flood of REPs if Controller Access is on.
	'< GET 0 ALL >',
	// Slot-2 probe: open question from plan. If the API supports slot 2 we get
	// a REP; if not we get ERR or silence.
	'< GET 1 LINK_TX_MODEL 2 >',
	'< GET 1 LINK_STATUS 2 >',
	'< GET 1 LINK_TX_BATT_MINS 2 >',
	// NA_DEVICE_NAME `z` parameter — the docs hint at it, we want to know.
	'< GET 1 NA_DEVICE_NAME 2 >',
	// Undocumented menu commands (Strings PDF doesn't list, manual mentions in UI).
	'< GET 0 AUDIO_SUMMING >',
	'< GET 1 AUDIO_SUMMING >',
	'< GET 0 INTERFERENCE_MGMT >',
	'< GET 0 INTERFERENCE_MODE >',
	'< GET 0 ANTENNA_BIAS >',
	'< GET 0 FEEDBACK_REDUCTION >',
	'< GET 1 FEEDBACK_REDUCTION >',
	'< GET 1 MIC_OFFSET >',
	'< GET 1 TX_RF_POWER >',
	'< GET 1 TX_HIGH_PASS >',
	'< GET 0 NA_DEVICE_LOCK >',
	'< GET 1 TX_PRESET >',
]

console.log(`> connecting tcp://${HOST}:${PORT}`)

const sock = new net.Socket()
let received = ''
const startedAt = Date.now()

sock.setEncoding('ascii')

sock.on('connect', () => {
	console.log(`> connected (${Date.now() - startedAt} ms)`)
	for (const p of probes) {
		console.log(`> ${p}`)
		sock.write(p + '\r\n')
	}
	setTimeout(() => {
		console.log(`> closing after ${WAIT_MS} ms wait`)
		sock.end()
	}, WAIT_MS)
})

sock.on('data', (chunk) => {
	received += chunk
})

sock.on('error', (err) => {
	console.error('! socket error:', err.message)
	process.exitCode = 1
})

sock.on('close', () => {
	console.log(`\n=== RECEIVED ${received.length} bytes ===\n`)
	// Split on '>' followed by optional whitespace + '<' to one-line per message.
	const msgs = received
		.split(/(?<=>)\s*(?=<)/)
		.map((s) => s.trim())
		.filter(Boolean)
	console.log(`(${msgs.length} framed messages)\n`)
	for (const m of msgs) console.log(m)
})

sock.connect(PORT, HOST)
