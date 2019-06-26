import {Trans} from '@lingui/react'

import {ActionLink} from 'components/ui/DbLink'
import ACTIONS from 'data/ACTIONS'
import STATUSES from 'data/STATUSES'
import {AbilityEvent} from 'fflogs'
import Module, {dependency} from 'parser/core/Module'
import Checklist, {Requirement, TARGET, TieredRule} from 'parser/core/modules/Checklist'

const SKILLS_TO_WATCH = [
	ACTIONS.GNASHING_FANG.id,
	ACTIONS.SAVAGE_CLAW.id,
	ACTIONS.WICKED_TALON.id,
	ACTIONS.JUGULAR_RIP.id,
	ACTIONS.ABDOMEN_TEAR.id,
	ACTIONS.EYE_GOUGE.id,
]

const WARN_TARGET_PERCENT = 99 // Missing even 1 should qualify as a warning.

// TODO: Figure out how to check if the next Continuation was even usable before the fight ended.
export default class Continuation extends Module {

	@dependency private checklist!: Checklist

	private ripBuffCounter = 0
	private tearBuffCounter = 0
	private gougeBuffCounter = 0
	private ripCounter = 0
	private tearCounter = 0
	private gougeCounter = 0

	private onTrigger(event: AbilityEvent) {
		const id = event.ability.guid
		switch (id) {
			case STATUSES.READY_TO_RIP.id:
				this.ripBuffCounter++
				break
			case STATUSES.READY_TO_TEAR.id:
				this.tearBuffCounter++
				break
			case STATUSES.READY_TO_GOUGE.id:
				this.gougeBuffCounter++
				break
			case ACTIONS.JUGULAR_RIP.id:
				this.ripCounter++
				break
			case ACTIONS.ABDOMEN_TEAR.id:
				this.tearCounter++
				break
			case ACTIONS.EYE_GOUGE.id:
				this.gougeCounter++
				break
		}
	}

	private onComplete() {
		const totalContinuationBuffs = this.ripBuffCounter + this.tearBuffCounter + this.gougeBuffCounter
		const totalContinuationActions = this.ripCounter + this.tearCounter + this.gougeCounter
		const warnTarget = 100 * Math.floor(WARN_TARGET_PERCENT * totalContinuationBuffs) / totalContinuationBuffs

		this.checklist.add(new TieredRule({
			name: 'Use a Continuation once per action in the Gnashing Fang combo',
			description: <Trans id="gnb.continuation.checklist.description">
				One <ActionLink {...ACTIONS.CONTINUATION}/> action should be used for each <ActionLink {...ACTIONS.GNASHING_FANG}/> combo action.
			</Trans>,
			tiers: {
				[warnTarget]: TARGET.WARN,
				100: TARGET.SUCCESS,
			},
			requirements: [
				new Requirement({
					name: <Trans id="gnb.continuation.checklist.requirement.continuation.name">
						<ActionLink {...ACTIONS.CONTINUATION}/> uses per <ActionLink {...ACTIONS.GNASHING_FANG}/> combo action
					</Trans>,
					value: totalContinuationActions,
					target: totalContinuationBuffs,
				}),
			],
		}))
	}

}
