// Movers are convenient way to animate 2D motion with a number of smoothing types.
function Mover(spec){
	var {
		position0,
		position1,

		state = false,
		lerpType = "smooth",
		smoothing = (lerpType == "spring") ? 0.08:1,
	} = spec,


	progress = state ? 1:0,

	position = lerpPoint(position0, position1, progress),

	update = function(){
		if (lerpType == "spring") {
			progress = lerp(progress, state?1:0, smoothing);
			position = lerpPoint(position0, position1, progress);
		}
		else {
			progress = tickProgress(state, progress, smoothing);
			if (lerpType == "linear") {
				position = lerpPointSmooth(position0, position1, progress);
			}
			else if (lerpType == "smooth") {
				position = lerpPoint(position0, position1, progress);
			}
		}
        //console.log("Updating! state="+state+", progress="+progress+", position="+pointString(position));
	},

	getPosition = function(){
		return position;
	},

	getProgress = function(){
		return progress;
	},

	getState = function(){
		return state;
	},

	setState = function(STATE){
		state = STATE;
	};

	return Object.seal({
		// Fields
		position0,
		position1,

		lerpType,
		smoothing,

		// Methods

		update,
		setState,
		getPosition,
		getProgress,
		getState,
	});
}