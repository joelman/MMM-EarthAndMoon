Module.register("MMM-EarthAndMoon",{
	// Default module config.

	requiresVersion: "2.1.0",

	defaults: {
	    updateInterval: 5000,
	    	initialLoadDelay: 1000,
		animationSpeed: 1000,
		size: ".5em",
		text: "Loading sunrise/sunset ..."
	},

	    loaded: function(callback) {
	    // this.finishLoading();
	    // Log.log(this.name + ' is loaded!');
	    callback();
	},

	// Override dom generator.
	getDom: function() {
	    var self = this;

	    var wrapper = document.createElement("div");
	    wrapper.style.fontSize = self.config.size;
	    wrapper.style.lineHeight = "1em";
	    
	    if(self.errors.length > 0) {
		wrapper.style.color = "red";

		var p = document.createElement("p");
		p.innerText = "Errors in " + self.name;
		wrapper.append(p);

		var ul = document.createElement("ul");
		ul.style.textAlign = "left";

		for(var i = 0; i < self.errors.length; i++) {
		    var li = document.createElement("li");
		    li.innerText = self.errors[i];
		    ul.append(li);
		}

		wrapper.append(ul);

		return wrapper;
	    }

	    var p = document.createElement("p");

	    if(self.message) {
		p.innerText = self.message;
	    } else {
		p.innerText = this.config.text;
	    }

	    wrapper.append(p);

	    return wrapper;
	},

        // Define start sequence.

        start: function() {
	    var self = this;

	    Log.info("Starting module: " + this.name);

	    this.loaded = false;
	    this.scheduleUpdate(this.config.initialLoadDelay);
	    this.updateTimer = null;

	    self.errors = [];

	    // check our input
	    if(!self.config.lat) {
		self.errors.push("Missing latitude");
	    }
	    if(!self.config.lng) {
		self.errors.push("Missing longitude");
	    }
        },

	    updateDisplay: function() {
	    var self = this;

	    if(!self.earth || !self.moon) {
		// locate modules
		MM.getModules().enumerate(function(module){
			if(module.name == "MMM-EARTH") {
			    self.earth = module;
			    self.earth.hide();
			}
			
			if(module.name == "mmm-moon-phases") {
			    self.moon = module;
			    self.moon.hide();
			}
		    });
		
		if(!self.earth) {
		    self.errors.push("Unable to locate MMM-EARTH module");
		}
		
		if(!self.moon) {
		    self.errors.push("Unable to locate mmm-moon-phases module");
		}
	    }

	    if(self.errors.length > 0) {
		self.updateDom();
		return;
	    }

	    var newDay = false;

	    if(self.lastRun) {
		var now = new Date();
		newDay = !(now.toDateString() === self.lastRun.toDateString());
	    } else {
		self.lastRun = new Date();
		newDay = true;
	    }
		
	    if(newDay) {
		var url = "https://api.sunrise-sunset.org/json?lat=" + self.config.lat + "&lng=" + self.config.lng + "&formatted=0";
		console.log(url);
		self.message = "Loading ... ";
		self.updateDom();
		
		var req = new XMLHttpRequest();
		req.overrideMimeType("application/json");
		req.open('GET', url, true);
		req.onload  = function() {
		    
		    try {
			var info = JSON.parse(req.responseText).results;
			self.sunrise = new Date( Date.parse(info.sunrise) );
			self.sunset = new Date( Date.parse(info.sunset) );
			var now = new Date();
			self.day = (now > self.sunrise && now < self.sunset);
			
			// console.log(info);
			self.showHide();
		    } catch(err) {
			self.message = err.message;
			self.updateDom();
		    }
		};
		
		req.send(null);
	    }
	},

	    showHide: function() {
	    var self = this;

	    // console.log(sunrise + " " + now + " " + sunset);
	    
	    var s = (self.day) ? self.earth : self.moon;
	    var h = (self.day) ? self.moon : self.earth;

	    h.hide(self.config.animationSpeed, function() {
		
			Log.log(self.name + " has hidden " + h.identifier );
			
			s.show(self.config.animationSpeed, function() {
		
				Log.log(self.name + " has shown " + s.identifier );
			    });
		    });

	    if(self.day) {
		self.message = "Sunset: " + self.sunset.toString();
	    } else {
		self.message = "Sunrise: " + self.sunrise.toString();
	    }

	    self.updateDom();
	    
	    this.scheduleUpdate();
	},

	    scheduleUpdate: function(delay) {
	    var nextLoad = this.config.updateInterval;
	    if (typeof delay !== "undefined" && delay >= 0) {
		nextLoad = delay;
	    }

	    var self = this;
	    clearTimeout(this.updateTimer);
	    this.updateTimer = setTimeout(function() {
		    self.updateDisplay();
                }, nextLoad);
        },
    });