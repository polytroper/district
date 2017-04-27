function Tally(spec) {
	var {
		balance,
		group,
	} = spec,

	repCount = group.repCount,
	reps = [],


	draw = function(){

	},

	update = function(){

	},

	clear = function(){

	};

	var tally = Object.freeze({
		// Fields
		group,
		balance,
		reps,

		// Methods
		draw,
		update,

	});

	for (var i = 0; i < repCount; i++) {
		reps.push(TallyRep({
			tally,
		}));
	}

	return tally;
}

function TallyRep(spec) {
	var {
		tally,
	} = spec,

	repCount = group.repCount,


	
	draw = function(){

	},

	update = function(){

	},

	clear = function(){

	};

	return Object.freeze({
		// Fields
		group,

		// Methods
		draw,
		update,

	});
}