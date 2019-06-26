import {t} from '@lingui/macro'
import {Plural, Trans} from '@lingui/react'
import _ from 'lodash'
import React from 'react'

import {ActionLink, StatusLink} from 'components/ui/DbLink'
import {RotationTable} from 'components/ui/RotationTable'
import ACTIONS from 'data/ACTIONS'
import STATUSES from 'data/STATUSES'
import Module, {dependency} from 'parser/core/Module'
import Suggestions, {SEVERITY, TieredSuggestion} from 'parser/core/modules/Suggestions'
import Timeline from 'parser/core/modules/Timeline'

import {getDataBy} from 'data'
import {BuffEvent, CastEvent} from 'fflogs'

const SEVERITIES = {
	MISSED_GNASHING_FANG: {
		1: SEVERITY.MINOR,
		2: SEVERITY.MEDIUM,
		4: SEVERITY.MAJOR,
	},
	MISSED_SONIC_BREAK: {
		1: SEVERITY.MINOR,
		2: SEVERITY.MEDIUM,
		4: SEVERITY.MAJOR,
	},
	MISSED_ROUGH_DIVIDE: {
		1: SEVERITY.MINOR,
		2: SEVERITY.MEDIUM,
		4: SEVERITY.MAJOR,
	},
	MISSED_BLASTING_ZONE: {
		1: SEVERITY.MINOR,
		2: SEVERITY.MEDIUM,
		4: SEVERITY.MAJOR,
	},
	MISSED_BOW_SHOCK: {
		1: SEVERITY.MINOR,
		2: SEVERITY.MEDIUM,
		4: SEVERITY.MAJOR,
	},
	MISSED_GCD: {
		1: SEVERITY.MINOR,
		2: SEVERITY.MEDIUM,
		4: SEVERITY.MAJOR,
	},
}

const EXPECTED_USES = {
	GNASHING_FANG: 1,
	SONIC_BREAK: 1,
	ROUGH_DIVIDE: 2,
	BLASTING_ZONE: 1,
	BOW_SHOCK: 1,
	GCD: 9,

	// Don't check for Continuation; that will be covered by the Continuation module.
	// Don't check the Gnashing Fang combo; that will be covered by the Gnashing Fang module.
}

const NO_MERCY_BUFF_DURATION = 20000 // in milliseconds

class NoMercyState {
	start: number
	end: number | null = null
	rotation: CastEvent[] = []
	isRushing: boolean = false

	// Track these for pre-processing so we don't have to loop back over this
	// a bunch of times later.
	numGcds: number = 0
	numBlastingZones: number = 0
	numSonicBreaks: number = 0
	numRoughDivides: number = 0
	numGnashingFangs: number = 0
	numBowShocks: number = 0

	constructor(start: number) {
		this.start = start
	}
}

export default class NoMercy extends Module {
	static handle = 'nomercy'
	static title = t('gnb.nomercy.title')`No Mercy Windows`

	@dependency private suggestions!: Suggestions
	@dependency private timeline!: Timeline

	private noMercyWindows: NoMercyState[] = []

	private get lastNoMercy(): NoMercyState | undefined {
		return _.last(this.noMercyWindows)
	}

	protected init() {
		this.addHook('cast', {by: 'player'}, this.onCast)
		this.addHook(
			'removebuff',
			{
				by: 'player',
				to: 'player',
				abilityId: [STATUSES.NO_MERCY.id],
			},
			this.onRemoveNoMercy,
		)
		this.addHook('complete', this.onComplete)
	}

	private onCast(event: CastEvent) {
		const actionId = event.ability.guid

		if (actionId === ACTIONS.ATTACK.id) {
			return
		}

		if (actionId === ACTIONS.NO_MERCY.id) {
			const noMercyState = new NoMercyState(event.timestamp)
			const fightTimeRemaining = this.parser.fight.end_time - event.timestamp
			noMercyState.isRushing = NO_MERCY_BUFF_DURATION >= fightTimeRemaining

			this.noMercyWindows.push(noMercyState)
		}

		// So long as we're in this window, log our actions to it.
		const lastNoMercy = this.lastNoMercy
		if (lastNoMercy != null && lastNoMercy.end == null) {
			lastNoMercy.rotation.push(event)

			const action = getDataBy(ACTIONS, 'id', actionId) as TODO
			if (!action) { return }

			// Pre-process on the number of certain things we did
			if (action.onGcd) {
				lastNoMercy.numGcds++
			}

			switch (actionId) {
				case ACTIONS.BLASTING_ZONE.id:
					lastNoMercy.numBlastingZones++
					break
				case ACTIONS.SONIC_BREAK.id:
					lastNoMercy.numSonicBreaks++
					break
				case ACTIONS.ROUGH_DIVIDE.id:
					lastNoMercy.numRoughDivides++
					break
				case ACTIONS.GNASHING_FANG.id:
					lastNoMercy.numGnashingFangs++
					break
				case ACTIONS.BOW_SHOCK.id:
					lastNoMercy.numBowShocks++
					break
			}
		}
	}

	private onRemoveNoMercy(event: BuffEvent) {
		const lastNoMercy = this.lastNoMercy

		if (lastNoMercy != null) {
			lastNoMercy.end = event.timestamp
		}
	}

	private onComplete() {
		const missedGcds = this.noMercyWindows
			.reduce((sum, window) => sum + Math.max(0, EXPECTED_USES.GCD - window.numGcds), 0)
		const missedBlastingZones = this.noMercyWindows
			.reduce((sum, window) => sum + Math.max(0, EXPECTED_USES.BLASTING_ZONE - window.numBlastingZones), 0)
		const missedSonicBreaks = this.noMercyWindows
			.reduce((sum, window) => sum + Math.max(0, EXPECTED_USES.SONIC_BREAK - window.numSonicBreaks), 0)
		const missedRoughDivides = this.noMercyWindows
			.reduce((sum, window) => sum + Math.max(0, EXPECTED_USES.ROUGH_DIVIDE - window.numRoughDivides), 0)
		const missedGnashingFangs = this.noMercyWindows
			.reduce((sum, window) => sum + Math.max(0, EXPECTED_USES.GNASHING_FANG - window.numGnashingFangs), 0)
		const missedBowShocks = this.noMercyWindows
			.reduce((sum, window) => sum + Math.max(0, EXPECTED_USES.BOW_SHOCK - window.numBowShocks), 0)

		this.suggestions.add(new TieredSuggestion({
			icon: ACTIONS.NO_MERCY.icon,
			content: <Trans id="gnb.nomercy.suggestions.gcds.content">
				Try to land 8 GCDs during every <ActionLink {...ACTIONS.NO_MERCY}/> window.
			</Trans>,
			why: <Trans id="gnb.nomercy.suggestions.gcds.why">
				<Plural value={missedGcds} one="# GCD" other="# GCDs"/> missed during <StatusLink {...STATUSES.NO_MERCY}/> windows.
			</Trans>,
			tiers: SEVERITIES.MISSED_GCD,
			value: missedGcds,
		}))

		this.suggestions.add(new TieredSuggestion({
			icon: ACTIONS.BLASTING_ZONE.icon,
			content: <Trans id="gnb.nomercy.suggestions.blasting-zone.content">
				Try to land one use of <ActionLink {...ACTIONS.BLASTING_ZONE}/> during
				every <ActionLink {...ACTIONS.NO_MERCY}/> window.
			</Trans>,
			why: <Trans id="gnb.nomercy.suggestions.blasting-zone.why">
				<Plural value={missedBlastingZones} one="# usage" other="# usages"/> of <ActionLink {...ACTIONS.BLASTING_ZONE}/> missed during <StatusLink {...STATUSES.NO_MERCY}/> windows.
			</Trans>,
			tiers: SEVERITIES.MISSED_BLASTING_ZONE,
			value: missedBlastingZones,
		}))

		this.suggestions.add(new TieredSuggestion({
			icon: ACTIONS.SONIC_BREAK.icon,
			content: <Trans id="gnb.nomercy.suggestions.sonic-break.content">
				Try to land one use of <ActionLink {...ACTIONS.SONIC_BREAK}/> during
				every <ActionLink {...ACTIONS.NO_MERCY}/> window.
			</Trans>,
			why: <Trans id="gnb.nomercy.suggestions.sonic-break.why">
				<Plural value={missedSonicBreaks} one="# usage" other="# usages"/> of <ActionLink {...ACTIONS.SONIC_BREAK}/> missed during <StatusLink {...STATUSES.NO_MERCY}/> windows.
			</Trans>,
			tiers: SEVERITIES.MISSED_SONIC_BREAK,
			value: missedSonicBreaks,
		}))

		this.suggestions.add(new TieredSuggestion({
			icon: ACTIONS.ROUGH_DIVIDE.icon,
			content: <Trans id="gnb.nomercy.suggestions.rough-divide.content">
				Try to land two uses of <ActionLink {...ACTIONS.ROUGH_DIVIDE}/> during
				every <ActionLink {...ACTIONS.NO_MERCY}/> window.
			</Trans>,
			why: <Trans id="gnb.nomercy.suggestions.rough-divide.why">
				<Plural value={missedRoughDivides} one="# usage" other="# usages"/> of <ActionLink {...ACTIONS.ROUGH_DIVIDE}/> missed during <StatusLink {...STATUSES.NO_MERCY}/> windows.
			</Trans>,
			tiers: SEVERITIES.MISSED_ROUGH_DIVIDE,
			value: missedRoughDivides,
		}))

		this.suggestions.add(new TieredSuggestion({
			icon: ACTIONS.BOW_SHOCK.icon,
			content: <Trans id="gnb.nomercy.suggestions.bow-shock.content">
				Try to land one use of <ActionLink {...ACTIONS.BOW_SHOCK}/> during
				every <ActionLink {...ACTIONS.NO_MERCY}/> window.
			</Trans>,
			why: <Trans id="gnb.nomercy.suggestions.bow-shock.why">
				<Plural value={missedBowShocks} one="# usage" other="# usages"/> of <ActionLink {...ACTIONS.BOW_SHOCK}/> missed during <StatusLink {...STATUSES.NO_MERCY}/> windows.
			</Trans>,
			tiers: SEVERITIES.MISSED_BOW_SHOCK,
			value: missedBowShocks,
		}))

		this.suggestions.add(new TieredSuggestion({
			icon: ACTIONS.GNASHING_FANG.icon,
			content: <Trans id="gnb.nomercy.suggestions.gnashing-fang.content">
				Try to land one use of <ActionLink {...ACTIONS.GNASHING_FANG}/> during
				every <ActionLink {...ACTIONS.NO_MERCY}/> window.
			</Trans>,
			why: <Trans id="gnb.nomercy.suggestions.gnashing-fang.why">
				<Plural value={missedGnashingFangs} one="# usage" other="# usages"/> of <ActionLink {...ACTIONS.GNASHING_FANG}/> missed during <StatusLink {...STATUSES.NO_MERCY}/> windows.
			</Trans>,
			tiers: SEVERITIES.MISSED_GNASHING_FANG,
			value: missedGnashingFangs,
		}))
	}
	output() {
		return <RotationTable
			targets={[
				{
					header: <Trans id="gnb.nomercy.table.header.gcds">GCDs</Trans>,
					accessor: 'gcds',
				},
				{
					header: <ActionLink showName={false} {...ACTIONS.BLASTING_ZONE}/>,
					accessor: 'blastingZone',
				},
				{
					header: <ActionLink showName={false} {...ACTIONS.SONIC_BREAK}/>,
					accessor: 'sonicBreak',
				},
				{
					header: <ActionLink showName={false} {...ACTIONS.ROUGH_DIVIDE}/>,
					accessor: 'roughDivide',
				},
				{
					header: <ActionLink showName={false} {...ACTIONS.BOW_SHOCK}/>,
					accessor: 'bowShock',
				},
				{
					header: <ActionLink showName={false} {...ACTIONS.GNASHING_FANG}/>,
					accessor: 'gnashingFang',
				},
			]}
			data={this.noMercyWindows
				.map(window => ({
					start: window.start - this.parser.fight.start_time,
					end: window.end != null ?
						window.end - this.parser.fight.start_time
						: window.start - this.parser.fight.start_time,
					targetsData: {
						gcds: {
							actual: window.numGcds,
							expected: EXPECTED_USES.GCD,
						},
						blastingZone: {
							actual: window.numBlastingZones,
							expected: EXPECTED_USES.BLASTING_ZONE,
						},
						sonicBreak: {
							actual: window.numSonicBreaks,
							expected: EXPECTED_USES.BOW_SHOCK,
						},
						roughDivide: {
							actual: window.numRoughDivides,
							expected: EXPECTED_USES.ROUGH_DIVIDE,
						},
						bowShock: {
							actual: window.numBowShocks,
							expected: EXPECTED_USES.BOW_SHOCK,
						},
						gnashingFang: {
							actual: window.numGnashingFangs,
							expected: EXPECTED_USES.GNASHING_FANG,
						},
					},
					rotation: window.rotation,
				}))
			}
			onGoto={this.timeline.show}
		/>
	}
}
