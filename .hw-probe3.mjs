// Round 3: two bodypacks now linked. Probe channels 1..4 with full ALL dump
// and explicitly query slot 1 + slot 2 on each.
// Goal: confirm whether the device tracks 2 paired TXes per channel,
// and verify online/offline + SLOT_TX_MODEL + TX_BATT_* per slot.
import net from 'node:net'

const HOST = process.argv[2] ?? '192.168.144.197'
const PORT = 2202
const WAIT_MS = 5000

const probes = []
for (let ch = 1; ch <= 4; ch++) {
	probes.push(`< GET ${ch} ALL >`)
	probes.push(`< GET ${ch} TX_MODEL >`)
	probes.push(`< GET ${ch} TX_BATT_BARS >`)
	probes.push(`< GET ${ch} TX_BATT_MINS >`)
	for (let s = 1; s <= 2; s++) {
		probes.push(`< GET ${ch} SLOT_TX_MODEL ${s} >`)
		probes.push(`< GET ${ch} LINK_STATUS ${s} >`)
		probes.push(`< GET ${ch} LINK_TX_BATT_MINS ${s} >`)
	}
}

console.log(`> ${probes.length} probes scheduled`)

const sock = new net.Socket()
let received = ''
sock.setEncoding('ascii')

sock.on('connect', () => {
	for (const p of probes) sock.write(p + '\r\n')
	setTimeout(() => sock.end(), WAIT_MS)
})
sock.on('data', (chunk) => (received += chunk))
sock.on('error', (e) => {
	console.error('!', e.message)
	process.exitCode = 1
})
sock.on('close', () => {
	const msgs = received
		.split(/(?<=>)\s*(?=<)/)
		.map((s) => s.trim())
		.filter(Boolean)
	const interesting = msgs.filter((m) => !m.startsWith('< SAMPLE'))
	const samples = msgs.length - interesting.length
	console.log(`\n=== ${interesting.length} property REPs (${samples} SAMPLEs filtered) ===\n`)

	// Group by channel for readability
	const byCh = { device: [], 1: [], 2: [], 3: [], 4: [] }
	for (const m of interesting) {
		// '< REP 1 FOO ... >' or '< REP FOO ... >'
		const ch = m.match(/^< REP (\d) /)
		if (ch) byCh[ch[1]].push(m)
		else byCh.device.push(m)
	}
	console.log('--- DEVICE-LEVEL ---')
	for (const m of byCh.device) console.log(m)
	for (let ch = 1; ch <= 4; ch++) {
		console.log(`\n--- CHANNEL ${ch} ---`)
		for (const m of byCh[ch]) console.log(m)
	}
})

sock.connect(PORT, HOST)
