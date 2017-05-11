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
	dirty = true,

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

		if (dirty) {
			dirty = false;
			return true;
		}

		return ((!approximately(progress, 1) && state) || (!approximately(progress, 0) && !state));
        //console.log("Updating! state="+state+", progress="+progress+", position="+pointString(position));
	},

	getPosition = function(){
		return position;
	},

	getProgress = function(){
		return progress;
	},

	setProgress = function(PROGRESS){
		progress = PROGRESS;
	},

	getState = function(){
		return state;
	},

	completeAnimation = function(){
		if (state) progress = 1;
		else progress = 0;
		position = lerpPoint(position0, position1, progress);
		dirty = true;
	},

	setState = function(STATE){
		state = STATE;
	};

	var tr = Object.seal({
		// Fields
		position0,
		position1,

		lerpType,
		smoothing,

		// Methods

		update,
		getState,
		setState,
		getPosition,
		getProgress,
		setProgress,

		completeAnimation,
	});

	animationListeners.push(tr);

	return tr;
}