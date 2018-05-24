/* Magic Mirror
 * Module: MMM-EarthAndMoon
 *
 * By Joel Gwynn
 * 
 */

/*
    config: {
        // Boston
	lat: "42.3605",
	lng: "-71.0596",
	showTime: false
    }
*/

Module.register("MMM-EarthAndMoon",{
    // Default module config.
    
    requiresVersion: "2.1.0",

    defaults: {
	updateInterval: 1000 * 60, // once a minute
	initialLoadDelay: 100,
	animationSpeed: 1000,
	showTime: true
    },
    
    loaded: function(callback) {
	
	this.finishLoading();
	Log.log(this.name + ' is loaded!');
	callback();
    },
    
    // Override dom generator.
    getDom: function() {
	var self = this;
	
	var wrapper = document.createElement("div");
	wrapper.style.fontSize = ".5em";
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

	p.innerText = self.message;

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

	self.message = self.name + " loading ...";
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

	var earthModule = "MMM-EARTH";
	var moonModule = "mmm-moon-phases";
	
	if(!self.earth || !self.moon) {

	    // locate modules
	    MM.getModules().enumerate(function(module){
		if(module.name == earthModule) {
		    self.earth = module;
		    self.earth.hide();
		}
		
		if(module.name == moonModule) {
		    self.moon = module;
		    self.moon.hide();
		}
	    });

	    var missing = "Unable to locate module: ";
	    
	    if(!self.earth) {
		self.errors.push(missing + earthModule);
	    }
	    
	    if(!self.moon) {
		self.errors.push(missing + moonModule);
	    }
	}

	// bail
	if(self.errors.length > 0) {
	    self.updateDom();
	    return;
	}

	// only check once a day
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
	    self.message = self.name + " getting sunrise/sunset data ...";
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
		    self.dayTime = (now > self.sunrise && now < self.sunset);
		    
		    // console.log(info);
		    self.showHide();
		} catch(err) {
		    self.message = err.message;
		    self.updateDom();
		}
	    };
	    
	    req.send(null);
	} else {
	    // just update
	    self.showHide();
	}
    },

    showHide: function() {
	var self = this;
	
	var s = (self.dayTime) ? self.earth : self.moon;
	var h = (self.dayTime) ? self.moon : self.earth;

	h.hide(self.config.animationSpeed, function() {
	    
	    Log.log(self.name + " has hidden " + h.identifier );
	    
	    s.show(self.config.animationSpeed, function() {
		
		Log.log(self.name + " has shown " + s.identifier );
	    });
	});

	// use MM config.timeFormat 12/24 to format time
	if(self.config.showTime) {

	    var t = self.sunrise;
	    var srs = "Sunrise";
	    var hours = t.getHours();
	    var minutes = t.getMinutes().toString();
	    var ampm = "";

	    if(self.dayTime) {
		t = self.sunset;
		srs = "Sunset";
	    }

	    if(config.timeFormat == 12) {

		ampm = "AM";
		if(hours > 12) {
		    ampm = "PM";
		    hours -= 12;
		}

	    } else {
		hours = hours.toString();
		if(hours.length == 1) {
		    hours = "0" + hours;
		}
	    }
	    
	    if(minutes.length == 1) {
		minutes = "0" + minutes;
	    }
	    
	    self.message = srs + ": " + hours + ":" + minutes + " " + ampm;
	} else {
	    self.message = "";
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
