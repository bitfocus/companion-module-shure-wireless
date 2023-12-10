/*
 * This file is part of the Companion project
 * Copyright (c) 2018 Bitfocus AS
 * Authors: William Viker <william@bitfocus.io>, Håkon Nessjøen <haakon@bitfocus.io>
 *
 * This program is free software.
 * You should have received a copy of the MIT licence as well as the Bitfocus
 * Individual Contributor License Agreement for companion along with
 * this program.
 *
 * You can be released from the requirements of the license by purchasing
 * a commercial license. Buying such a license is mandatory as soon as you
 * develop commercial activities involving the Companion software without
 * disclosing the source code of your own applications.
 *
 */

// Super primitive drawing library!

import { PNG } from 'pngjs'
import { combineRgb } from '@companion-module/base'

const argb = (a, r, g, b, base = 10) => {
	a = parseInt(a, base)
	r = parseInt(r, base)
	g = parseInt(g, base)
	b = parseInt(b, base)

	if (isNaN(a) || isNaN(r) || isNaN(g) || isNaN(b)) return false
	return (
		a * 0x1000000 + combineRgb(r, g, b) // bitwise doesn't work because JS bitwise is working with 32bit signed int
	)
}

export default class Image {
	constructor(width, height) {
		this.width = width
		this.height = height

		this.buffer = Buffer.alloc(this.height * this.width * 4) // * 4 for ARGB.
	}

	pixel(x, y, color) {
		if (x < 0 || x >= this.width) return
		if (y < 0 || y >= this.height) return

		let byte = (y * this.width + x) * 4

		let alpha = Math.floor(color / 0x1000000) / 0xff
		let olda = this.buffer.readUInt8(byte)
		let oldr = this.buffer.readUInt8(byte + 1)
		let oldg = this.buffer.readUInt8(byte + 2)
		let oldb = this.buffer.readUInt8(byte + 3)
		let newr = (color >> 16) & 0xff
		let newg = (color >> 8) & 0xff
		let newb = color & 0xff
		let newa = color / 0x1000000
		this.buffer.writeUInt32BE(
			argb(
				olda + (1 - olda) * newa,
				oldr * (1 - alpha) + newr * alpha,
				oldg * (1 - alpha) + newg * alpha,
				oldb * (1 - alpha) + newb * alpha
			),
			byte
		)

		return true
	}

	drawFromPNGdata(data, xStart = 0, yStart = 0, width = 72, height = 58) {
		let png = PNG.sync.read(data)

		for (let y = 0; y < png.height; y++) {
			for (let x = 0; x < png.width; x++) {
				let idx = (png.width * y + x) << 2
				let r = png.data[idx]
				let g = png.data[idx + 1]
				let b = png.data[idx + 2]
				let a = png.data[idx + 3]

				if (a > 0) {
					this.pixel(xStart + x, yStart + y, argb(a, r, g, b))
				}
			}
		}
	}

	toBase64() {
		return this.buffer.toString('base64')
	}
}
