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
		this.canvas = []

		for (let y = 0; y < this.height; y++) {
			let buf = Buffer.alloc(this.width * 3) // * 3 for RGB.
			this.canvas.push(buf)
		}
	}

	pixel(x, y, color) {
		if (x < 0 || x >= this.width) return
		if (y < 0 || y >= this.height) return

		let line = this.canvas[y]
		if (color <= 0xffffff) {
			line.writeUIntBE(color & 0xffffff, x * 3, 3)
		} else {
			let alpha = Math.floor(color / 0x1000000) / 0xff
			let oldr = line.readUInt8(x * 3)
			let oldg = line.readUInt8(x * 3 + 1)
			let oldb = line.readUInt8(x * 3 + 2)
			let newr = (color >> 16) & 0xff
			let newg = (color >> 8) & 0xff
			let newb = color & 0xff
			line.writeUIntBE(
				combineRgb(
					oldr * (1 - alpha) + newr * alpha,
					oldg * (1 - alpha) + newg * alpha,
					oldb * (1 - alpha) + newb * alpha
				),
				x * 3,
				3
			)
		}

		return true
	}

	drawFromPNGdata(data, xStart = 0, yStart = 0, width = 72, height = 58, halign = 'center', valign = 'center') {
		let png
		let xouter, xinner, youter, yinner, wouter, houter

		if (xStart + width > this.width) {
			width = this.width - xStart
		}
		if (yStart + height > this.height) {
			height = this.height - yStart
		}

		png = PNG.sync.read(data)

		if (png.width > width) {
			//image is broader than drawing pane
			switch (halign) {
				case 'left':
					xouter = 0
					xinner = 0
					wouter = width
					break
				case 'center':
					xouter = 0
					xinner = Math.round((png.width - width) / 2, 0)
					wouter = width
					break
				case 'right':
					xouter = 0
					xinner = png.width - width
					wouter = width
					break
			}
		} else {
			// image is narrower than drawing pane
			switch (halign) {
				case 'left':
					xouter = 0
					xinner = 0
					wouter = png.width
					break
				case 'center':
					xouter = Math.round((width - png.width) / 2, 0)
					xinner = 0
					wouter = png.width
					break
				case 'right':
					xouter = width - png.width
					xinner = 0
					wouter = png.width
					break
			}
		}

		if (png.height > height) {
			// image is taller than drawing pane
			switch (valign) {
				case 'top':
					youter = 0
					yinner = 0
					houter = height
					break
				case 'center':
					youter = 0
					yinner = Math.round((png.height - height) / 2, 0)
					houter = height
					break
				case 'bottom':
					youter = 0
					yinner = png.height - height
					houter = height
					break
			}
		} else {
			// image is smaller than drawing pane
			switch (valign) {
				case 'top':
					youter = 0
					yinner = 0
					houter = png.height
					break
				case 'center':
					youter = Math.round((height - png.height) / 2, 0)
					yinner = 0
					houter = png.height
					break
				case 'bottom':
					youter = height - png.height
					yinner = 0
					houter = png.height
					break
			}
		}

		for (let y = 0; y < houter; y++) {
			for (let x = 0; x < wouter; x++) {
				let idx = (png.width * (y + yinner) + x + xinner) << 2
				let r = png.data[idx]
				let g = png.data[idx + 1]
				let b = png.data[idx + 2]
				let a = png.data[idx + 3]

				if (a > 0) {
					if (a === 255) {
						this.pixel(xStart + xouter + x, yStart + youter + y, combineRgb(r, g, b))
					} else {
						this.pixel(xStart + xouter + x, yStart + youter + y, argb(a, r, g, b))
					}
				}
			}
		}
	}

	toBase64() {
		return this.buffer().toString('base64')
	}

	buffer() {
		return Buffer.concat(this.canvas)
	}
}
