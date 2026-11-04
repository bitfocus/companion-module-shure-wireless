import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import * as base from '@companion-module/base'
import { updateActions } from '../src/actions.js'
import { updateFeedbacks } from '../src/feedback.js'
import { updateVariables } from '../src/variables.js'

let Module
const { default: unused, ...exports } = base
mock.module('@companion-module/base', {
	namedExports: {
		...exports,
		runEntrypoint: (implementation) => {
			Module = implementation
		},
	},
})
await import('../src/index.js')

function instance() {
	const instance = Object.create(Module.prototype)
	instance.updateActions = updateActions.bind(instance)
	instance.updateFeedbacks = updateFeedbacks.bind(instance)
	instance.updateVariables = updateVariables.bind(instance)
	instance.log = () => {}
	instance.updateStatus = () => {}
	instance.checkFeedbacks = () => {}
	instance.setVariableValues = () => {}
	instance.setVariableDefinitions = () => {}
	instance.setFeedbackDefinitions = () => {}
	instance.setActionDefinitions = (actions) => {
		instance.actions = actions
	}
	return instance
}

test('ULX actions preserve variable substitution and wire commands', async () => {
	const module = instance()
	await module.init({ modelID: 'ulxd4', meteringOn: false })
	const commands = []
	module.socket = { isConnected: true, send: (command) => commands.push(command), destroy() {} }
	await module.actions.set_channel_name.callback(
		{ options: { channel: 1, name: '$(custom:name)' } },
		{
			parseVariablesInString: async (value) => value.replace('$(custom:name)', 'Vocal'),
		}
	)
	await module.actions.channel_setaudiogain.callback(
		{ options: { channel: 1, gain: 0 } },
		{
			// Base 1.15.1 returns non-string inputs unchanged before parsing.
			parseVariablesInString: async (value) => value,
		}
	)
	await module.actions.channel_mute.callback({ options: { channel: 1, choice: 'ON' } })
	assert.deepEqual(commands, ['< SET 1 CHAN_NAME {Vocal} >', '< SET 1 AUDIO_GAIN 18 >', '< SET 1 AUDIO_MUTE ON >'])
	await module.destroy()
})

test('receiver reports update channel state and render a PNG feedback', async () => {
	const module = instance()
	await module.init({ modelID: 'ulxd4', meteringOn: false })
	module.processShureCommand('REP 1 CHAN_NAME {Vocal}')
	module.processShureCommand('REP 1 AUDIO_GAIN 30')
	module.processShureCommand('REP 1 AUDIO_MUTE ON')
	assert.equal(module.api.getChannel(1).name, 'Vocal')
	assert.equal(module.api.getChannel(1).audioGain, 12)
	assert.equal(module.api.getChannel(1).audioMute, 'ON')
	const icon = module.api.getIcon({ channel: 1, icons: 'battery', barlevel: 2 }, { width: 72, height: 58 })
	assert.ok(icon)
	await module.destroy()
})
