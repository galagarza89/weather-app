

const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const typeOf = require('typeof');
const request = require('request');
const axios = require('axios');
const port = process.env.PORT || 3000;

var app = express();


hbs.registerPartials(__dirname + '/views/partials')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public/'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());

/*********************
Register Helpers
*********************/
hbs.registerHelper('currentYear', () => {
	return new Date().getFullYear();
});



app.get('/', function (req, res) {
	res.render('home.hbs');
})


app.post('/', (req, res) => {


	function convertTime(timestamp) {
		var date=new Date(timestamp);
		var hours = date.getHours(); // minutes part from the timestamp
		var minutes = date.getMinutes(); // seconds part from the timestamp
	 	var formattedTime = hours + ':' + minutes;
	 	return formattedTime;
 	}	

	const apiKeyMaps = 'AIzaSyAspKei-FhDnU2II6udDhDpQKayMeJiz0o';
	const apiKeyWeather = '7687c82beac40d4d08af422625a8d84b';

	var address = req.body.address;
	var encodedAddress = encodeURIComponent(address);
	var geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKeyMaps}`;


	axios.get(geocodeURL).then((response) => {
		var addressData = response.data;
		var lat = addressData.results[0].geometry.location.lat;
		var lng = addressData.results[0].geometry.location.lng;
		var weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&APPID=${apiKeyWeather}`;
		return axios.get(weatherURL);
	}).then((response) => {

		var data = response.data;

		var location = data.name;
		var summary = data.weather.description;
		var sunrise = convertTime(data.sys.sunrise);
		var sunset = convertTime(data.sys.sunset);
		var currentTemp = Math.round(data.main.temp);
		var highTemp = Math.round(data.main.temp_max);
		var lowTemp = Math.round(data.main.temp_min);
		var humidity = data.main.humidity;


  		res.render('result.hbs', {
  			location,
  			summary,
  			sunrise,
  			sunset,
  			currentTemp,
  			highTemp,
  			lowTemp,
  			humidity,
  			am: 'am',
  			pm: 'pm'
  	    });

    }).catch((error) => {
		if(error.code === 'ENOTFOUND') {
			console.log('Unable to connect to API servers');
		} else {
			console.log(error.message);
		}
	});

});


app.listen(port);









