
const earthRadius = 6371e3;

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

module.exports =  {
	// credit to https://www.movable-type.co.uk/scripts/latlong.html
	geoDistance: ([lon1, lat1], [lon2, lat2]) => {

		const φ1 = toRadians(lat1);
		const φ2 = toRadians(lat2);
		const Δφ = toRadians(lat2-lat1);
		const Δλ = toRadians(lon2-lon1);

		const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
		        Math.cos(φ1) * Math.cos(φ2) *
		        Math.sin(Δλ/2) * Math.sin(Δλ/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		return d = earthRadius * c;
	},

	toRadians,

	precisionRound
};