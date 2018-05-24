# Module: EarthAndMoon
Combines the MM Earth module with the Moon module, toggles on sunset and sunrise.

## Using the module

You'll need to install [MMM-EARTH](https://github.com/mykle1/MMM-EARTH) and [mmm-moon-phases](https://github.com/spectroman/mmm-moon-phases).  Then find your latitude and longitude and add it in the config file.

````javascript
  modules: [
	         {
              position: "top_center",
              module: "MMM-EarthAndMoon",
              config: {
                lat: "42.3605",
	              lng: "-71.0596",
                showTime: false
              }
            },
            {
                module: "MMM-EARTH",
		            position: "top_center",
                config: {
                    mode: "Natural",
                    rotateInterval: 15000,
                    MaxWidth: "30%",
                    MaxHeight: "30%",
                }
            },
            {
                module: 'mmm-moon-phases',
                position: 'top_center',        // this can be any of the regions
		            config: {
                    height: 150,
                    width: 150
                }
]
````

## Configuration options

The following properties can be configured:

| Option            | Description
| ----------------- | -----------
| `lat`             | latitude
| `lng`             | longitude
| `showTime`        | Show time of next sunset or sunrise. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
