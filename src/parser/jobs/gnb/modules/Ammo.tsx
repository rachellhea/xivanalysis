import {t, Trans} from '@lingui/macro'
import Color from 'color'

import {ActionLink} from 'components/ui/DbLink'
import TimeLineChart from 'components/ui/TimeLineChart'
import ACTIONS from 'data/ACTIONS'
import JOBS from 'data/JOBS'
import {CastEvent} from 'fflogs'
import Module, {dependency, DISPLAY_MODE} from 'parser/core/Module'
import Checklist, {Requirement, Rule} from 'parser/core/modules/Checklist'
import {Fragment} from 'react'

const AMMO_GENERATORS = {
	[ACTIONS.SOLID_BARREL.id]: 1,
	[ACTIONS.DEMON_SLAUGHTER.id]: 1,
	[ACTIONS.BLOODFEST.id]: 2,
}

const AMMO_SPENDERS = {
	[ACTIONS.GNASHING_FANG.id]: 1,
	[ACTIONS.BURST_STRIKE.id]: 1,
	[ACTIONS.FATED_CIRCLE.id]: 1,
}

const MAX_AMMO = 2

class AmmoState {
	time: number | null = null
	ammo: number | null = null
}

// TODO: Check for bad Burst Strikes (i.e. when at 1 ammo + Bloodfest is on CD + Gnashing is off CD)
export default class Ammo extends Module {
	static handle = 'ammo'
	static title = t('gnb.ammo.title')`Cartridge Timeline`
	static displayMode = DISPLAY_MODE.FULL

	private ammo = 0
	private ammoHistory: AmmoState[] = []
	private wasteBySource = {
		[ACTIONS.SOLID_BARREL.id]: 0,
		[ACTIONS.DEMON_SLAUGHTER.id]: 0,
		[ACTIONS.BLOODFEST.id]: 0,
	}
	private leftoverAmmo = 0

	@dependency private checklist!: Checklist

	protected init() {
		this.addHook(
			'cast',
			{
				by: 'player',
				abilityId: Object.keys(AMMO_GENERATORS).map(Number),
			},
			this.onGenerator,
		)
		this.addHook(
			'cast',
			{
				by: 'player',
				abilityId: Object.keys(AMMO_SPENDERS).map(Number),
			},
			this.onSpender,
		)
		this.addHook('death', {to: 'player'}, this.onDeath)
		this.addHook('complete', this.onComplete)
	}

	private onGenerator(event: CastEvent) {
		const abilityId = event.ability.guid

		this.ammo += AMMO_GENERATORS[abilityId]
		if (this.ammo > MAX_AMMO) {
			const waste = this.ammo - MAX_AMMO
			this.wasteBySource[abilityId] += waste
			this.ammo = MAX_AMMO
		}

		this.pushToHistory()
	}

	private onSpender(event: CastEvent) {
		this.ammo = Math.max(this.ammo - AMMO_SPENDERS[event.ability.guid], 0)
		this.pushToHistory()
	}

	private onDeath() {
		this.dumpRemainingResources()
	}

	private dumpRemainingResources() {
		this.leftoverAmmo = this.ammo
		this.ammo = 0
		this.pushToHistory()
	}

	private pushToHistory() {
		const timestamp = this.parser.currentTimestamp - this.parser.fight.start_time
		this.ammoHistory.push({time: timestamp, ammo: this.ammo})
	}

	private onComplete() {
		this.dumpRemainingResources()

		const totalWaste = Object.keys(this.wasteBySource)
			.map(Number)
			.reduce((sum, source) => sum + this.wasteBySource[source], 0)
			+ this.leftoverAmmo

		this.checklist.add(new Rule({
			name: t('gnb.ammo.waste')`Cartridge Waste`,
			description: <Trans id="gnb.ammo.waste.content">
				Wasted cartridges or dying with cartridges loaded is a potency loss of about X per cartridge wasted.
				Use <ActionLink {...ACTIONS.BURST_STRIKE}/> (or <ActionLink {...ACTIONS.FATED_CIRCLE}/> if there is more
				than one target) to avoid wasting cartridges.
			</Trans>,
			requirements: [
				new Requirement({
					name: t('gnb.ammo.waste')`Cartridge Waste`,
					value: totalWaste,
				}),
			],
		}))
	}

	output() {
		const ammoColor = Color(JOBS.GUNBREAKER.colour)

		/* eslint-disable no-magic-numbers */
		const chartdata = {
			datasets: [
				{
					label: 'Cartridges',
					steppedLine: true,
					data: this.ammoHistory,
					backgroundColor: ammoColor.fade(0.8),
					borderColor: ammoColor.fade(0.5),
				},
			],
		}
		/* eslint-enable no-magic-numbers */

		return <Fragment>
			<TimeLineChart data={chartdata} />
		</Fragment>
	}

}
