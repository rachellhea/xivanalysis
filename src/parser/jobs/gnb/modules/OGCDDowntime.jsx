import ACTIONS from 'data/ACTIONS'
import CooldownDowntime from 'parser/core/modules/CooldownDowntime'

export default class AbilityDowntime extends CooldownDowntime {
	allowedDowntime = 2500
	trackedCds = [
		ACTIONS.DANGER_ZONE.id,
		ACTIONS.BLASTING_ZONE.id,
		ACTIONS.ROUGH_DIVIDE.id,
		ACTIONS.BOW_SHOCK.id,
	]
	// account for charge system
	allowedDowntimePerOgcd = {
		[ACTIONS.ROUGH_DIVIDE.id]: 30000,
	}
}
