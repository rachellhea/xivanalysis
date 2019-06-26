export default {
	// TODO: Update all of these with real, non-dummy values

	// -----
	// Player GCDs
	// -----
	KEEN_EDGE: {
		id: -1,
		name: 'Keen Edge',
		icon: '',
		onGcd: true,
		potency: 200,
		combo: {
			start: true,
		},
	},
	BRUTAL_SHELL: {
		id: -2,
		name: 'Brutal Shell',
		icon: '',
		onGcd: true,
		potency: 100,
		combo: {
			from: -1, // Keen Edge
			potency: 300,
		},
	},
	SOLID_BARREL: {
		id: -3,
		name: 'Solid Barrel',
		icon: '',
		onGcd: true,
		potency: 100,
		combo: {
			from: -2, // Brutal Shell
			potency: 400,
			end: true,
		},
	},
	BURST_STRIKE: {
		id: -4,
		name: 'Burst Strike',
		icon: '',
		onGcd: true,
		breaksCombo: false,
		potency: 450,
	},
	LIGHTNING_SHOT: {
		id: -5,
		name: 'Lightning Shot',
		icon: '',
		onGcd: true,
		breaksCombo: true,
		potency: 150,
	},
	GNASHING_FANG: {
		id: -6,
		name: 'Gnashing Fang',
		icon: '',
		onGcd: true,
		breaksCombo: false,
		potency: 400,
		cooldown: 30,
	},
	SAVAGE_CLAW: {
		id: -7,
		name: 'Savage Claw',
		icon: '',
		onGcd: true,
		breaksCombo: false,
		potency: 500,
		combo: {
			from: -6, // Gnashing Fang
			potency: 500,
		},
	},
	WICKED_TALON: {
		id: -8,
		name: 'Wicked Talon',
		icon: '',
		onGcd: true,
		breaksCombo: false,
		potency: 650,
		combo: {
			from: -7, // Savage Claw
			potency: 650,
			end: true,
		},
	},
	SONIC_BREAK: {
		id: -9,
		name: 'Sonic Break',
		icon: '',
		onGcd: true,
		breaksCombo: false,
		potency: 100,
		cooldown: 30,
	},
	DEMON_SLICE: {
		id: -10,
		name: 'Demon Slice',
		icon: '',
		onGcd: true,
		breaksCombo: true,
		potency: 150,
	},
	DEMON_SLAUGHTER: {
		id: -11,
		name: 'Demon Slaughter',
		icon: '',
		onGcd: true,
		potency: 100,
		combo: {
			from: -10, // Demon Slice
			potency: 250,
			end: true,
		},
	},
	FATED_CIRCLE: {
		id: -12,
		name: 'Fated Circle',
		icon: '',
		onGcd: true,
		breaksCombo: true, // TODO: verify
		potency: 360,
	},

	// -----
	// Player oGCDs
	// -----
	NO_MERCY: {
		id: -13,
		name: 'No Mercy',
		icon: '',
		onGcd: false,
		cooldown: 60,
	},
	BLOODFEST: {
		id: -14,
		name: 'Bloodfest',
		icon: '',
		onGcd: false,
		cooldown: 90,
	},
	JUGULAR_RIP: {
		id: -15,
		name: 'Jugular Rip',
		icon: '',
		onGcd: false,
		cooldown: 1,
	},
	ABDOMEN_TEAR: {
		id: -16,
		name: 'Abdomen Tear',
		icon: '',
		onGcd: false,
		cooldown: 1,
	},
	EYE_GOUGE: {
		id: -17,
		name: 'Eye Gouge',
		icon: '',
		onGcd: false,
		cooldown: 1,
	},
	DANGER_ZONE: {	// Note: upgrades to Blasting Zone at lvl 80
		id: -18,
		name: 'Danger Zone',
		icon: '',
		onGcd: false,
		cooldown: 30,
	},
	BLASTING_ZONE: {
		id: -19,
		name: 'Blasting Zone',
		icon: '',
		onGcd: false,
		cooldown: 30,
	},
	BOW_SHOCK: {
		id: -20,
		name: 'Bow Shock',
		icon: '',
		onGcd: false,
		cooldown: 60,
	},
	ROUGH_DIVIDE: {
		id: -21,
		name: 'Rough Divide',
		icon: '',
		onGcd: false,
		cooldown: 30,
		maxCharges: 2,
	},
	ROYAL_GUARD: {
		id: -22,
		name: 'Royal Guard',
		icon: '',
		onGcd: false,
		cooldown: 10,
	},
	AURORA: {
		id: -23,
		name: 'Aurora',
		icon: '',
		onGcd: false,
		cooldown: 60,
	},
	SUPERBOLIDE: {
		id: -24,
		name: 'Superbolide',
		icon: '',
		onGcd: false,
		cooldown: 360,
	},
	CAMOUFLAGE: {
		id: -25,
		name: 'Camouflage',
		icon: '',
		onGcd: false,
		cooldown: 90,
	},
	NEBULA: {
		id: -26,
		name: 'Nebula',
		icon: '',
		onGcd: false,
		cooldown: 120,
	},
	HEART_OF_STONE: {
		id: -27,
		name: 'Heart of Stone',
		icon: '',
		onGcd: false,
		cooldown: 25,
	},
	HEART_OF_LIGHT: {
		id: -28,
		name: 'Heart of Light',
		icon: '',
		onGcd: false,
		cooldown: 90,
	},
	CONTINUATION: {
		id: -29,
		name: 'Continuation',
		icon: '',
		onGcd: false,
		cooldown: 1,
	},
}
