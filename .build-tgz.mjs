// Reimplementation of `companion-module-build` that avoids the two Windows
// bugs in the official tool:
//   1) the zx-via-bash ANSI-C quoting eating "\c" in our project path
//   2) Win10 tar stamping SCHILY.fflags headers that some readers complain about
//
// Steps mirror node_modules/@companion-module/tools/scripts/build.js exactly.
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import * as tar from 'tar'
import { validateManifest } from '@companion-module/base'

const ROOT = process.cwd()
const PKG = path.join(ROOT, 'pkg')

// 1. wipe old pkg/
await fs.rm(PKG, { recursive: true, force: true })
await fs.mkdir(PKG, { recursive: true })

// 1b. run webpack → pkg/main.js (avoid yarn+bash; node calls webpack directly)
console.log('running webpack…')
const webpackBin = path.join(ROOT, 'node_modules/webpack/bin/webpack.js')
const webpackCfg = path.join(ROOT, 'node_modules/@companion-module/tools/webpack.config.cjs')
const wp = spawnSync(process.execPath, [webpackBin, '-c', webpackCfg, '--env', `ROOT=${ROOT}`], {
	stdio: 'inherit',
})
if (wp.status !== 0) {
	console.error('webpack failed, exit', wp.status)
	process.exit(1)
}

// 2. copy companion/ → pkg/companion/
await fs.cp(path.join(ROOT, 'companion'), path.join(PKG, 'companion'), { recursive: true })

// 3. patch the manifest with version + entrypoint + apiVersion
const srcPkg = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8'))
const fwPkg = JSON.parse(
	await fs.readFile(path.join(ROOT, 'node_modules/@companion-module/base/package.json'), 'utf8'),
)
const manifest = JSON.parse(await fs.readFile(path.join(PKG, 'companion/manifest.json'), 'utf8'))
manifest.runtime.entrypoint = '../main.js'
manifest.runtime.api = 'nodejs-ipc'
manifest.runtime.apiVersion = fwPkg.version
manifest.version = srcPkg.version
await fs.writeFile(path.join(PKG, 'companion/manifest.json'), JSON.stringify(manifest, null, 2))

// 4. validate (this throws if it's bad — same call the official tool makes)
try {
	validateManifest(manifest)
	console.log('manifest OK — id=' + manifest.id + ' version=' + manifest.version)
} catch (err) {
	console.error('MANIFEST INVALID:', err.message)
	process.exit(1)
}

// 5. write minimal pkg/package.json
const pkgJson = {
	name: manifest.name,
	version: manifest.version,
	license: manifest.license,
	type: 'commonjs',
	dependencies: {},
}
await fs.writeFile(path.join(PKG, 'package.json'), JSON.stringify(pkgJson, null, 2))

// 6. tar via node:tar (same lib the official tool uses — no SCHILY headers)
const outTgz = path.join(ROOT, `${manifest.id}-${manifest.version}.tgz`)
await fs.rm(outTgz, { force: true })
await tar.create(
	{
		gzip: true,
		file: outTgz,
		cwd: ROOT,
		portable: true, // strip uid/gid/atime/ctime for reproducibility
	},
	['pkg'],
)
const stat = await fs.stat(outTgz)
console.log(`tgz written: ${outTgz}  (${(stat.size / 1024).toFixed(1)} KiB)`)
