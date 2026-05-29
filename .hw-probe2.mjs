// Round 2: deeper probes after round 1 surprised us.
// - < GET 0 ALL > produced almost no REPs (just SAMPLEs) — investigate.
// - LINK_STATUS 2 came back lowercase "offline" — string case matters.
// - LINK_TX_MODEL 2 / LINK_TX_BATT_MINS 2 / NA_DEVICE_NAME 2 → ERR.
import net from 'node:net'

const HOST = process.argv[2] ?? '192.168.144.197'
const PORT = 2202
const WAIT_MS = 6000

const probes = [
	// Basic device identity (PDF-documented; expect REPs).
	'< GET MODEL >',
	'< GET DEVICE_ID >',
	'< GET FW_VER >',
	'< GET RF_BAND >',
	'< GET LOCK_STATUS >',
	'< GET ENCRYPTION_MODE >',
	'< GET APP_CONN_ENABLED >',
	'< GET NA_DEVICE_NAME >',
	// Network settings (Dante)
	'< GET NET_SETTINGS SC >',
	'< GET NET_SETTINGS D1 >',
	'< GET NET_SETTINGS D2 >',
	// Channel 1 specifics (one of each slxplus property type)
	'< GET 1 CHAN_NAME >',
	'< GET 1 AUDIO_GAIN >',
	'< GET 1 FREQUENCY >',
	'< GET 1 GROUP_CHANNEL >',
	'< GET 1 AUDIO_OUT_LVL_SWITCH >',
	'< GET 1 METER_RATE >',
	'< GET 1 ENCRYPTION_STATUS >',
	'< GET 1 INTERFERENCE_STATUS >',
	'< GET 1 NA_CHAN_NAME >',
	// Side-channel slot 1 — what we expect to work
	'< GET 1 LINK_TX_MODEL 1 >',
	'< GET 1 LINK_STATUS 1 >',
	'< GET 1 LINK_TX_BATT_MINS >',
	'< GET 1 TX_BATT_MINS >',
	'< GET 1 TX_BATT_BARS >',
	// Discovery variants — maybe the syntax differs from the PDF
	'< GET ALL >',
	'< GET 1 ALL >',
]

console.log(`> connecting tcp://${HOST}:${PORT}`)

const sock = new net.Socket()
let received = ''

sock.setEncoding('ascii')

sock.on('connect', () => {
	console.log(`> connected`)
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
	const msgs = received
		.split(/(?<=>)\s*(?=<)/)
		.map((s) => s.trim())
		.filter(Boolean)
	// Filter out the noisy SAMPLE messages — too many of them, drown the signal.
	const interesting = msgs.filter((m) => !m.startsWith('< SAMPLE'))
	const sampleCount = msgs.length - interesting.length
	console.log(`(${msgs.length} total messages, ${interesting.length} non-SAMPLE, ${sampleCount} SAMPLE)\n`)
	for (const m of interesting) console.log(m)
})

sock.connect(PORT, HOST)
