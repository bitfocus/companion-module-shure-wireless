// Generate companion/images/example-slxplus.png from the existing
// example-slx.png — it already has the crisp text rendering style the
// other examples use. We only add the SLX-D+ specific overlays:
//
//   1. a second RF antenna bar (SLX-D had 1, SLX-D+ has 2: rfA at x=47,
//      rfB at x=55). The SLX-D screenshot's single RF bar lives at x=55,
//      so we just paint a fresh rfA bar at x=47.
//   2. the encryption key icon (SLX-D has no encryption support; SLX-D+
//      shows the key icon top-right when audio encryption is on).
//
// Bar / icon coordinates are taken verbatim from Icons.getSlxPlusStatus.
import fs from 'node:fs/promises'
import sharp from 'sharp'
import Icons from './src/icons.js'

const icons = new Icons({})

// Pick a 4-bar RF for the new antenna A column — visibly different from
// whatever bar height example-slx.png already shows on antenna B, so the
// two columns don't visually merge.
const rfAbar = icons.SLX_RF[4]
const encryptionKey = icons.ENCRYPTION['ON']

const out = await sharp('companion/images/example-slx.png')
	.composite([
		{ input: rfAbar, top: 11, left: 47 },
		{ input: encryptionKey, top: 2, left: 52 },
	])
	.png()
	.toBuffer()

const path = 'companion/images/example-slxplus.png'
await fs.writeFile(path, out)
console.log(`wrote ${path} — ${out.length} bytes`)
