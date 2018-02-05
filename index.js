const express = require('express')
const app = express()
const path = require('path')
const DB = require('./SimpleDB');
let db = new DB({
	filePath: 'cities_canada_usa.tsv'
});

const RESULT_LIMIT = 10;

app.get('/suggestions', async (req, res) => {
	try {
		const {q, long, lat, results} = req.query;
		//console.log('params: ', {q, long, lat});
		let result = await db.query(q, [long, lat]);
		
		// adjust database output to what the user expects
		result = result.map(r => ({
				name: `${r.name}, ${r.admin1}, ${r.countryFull}`,
				latitude: r.lat,
				longitude: r.long,
				score: r.score,
				// debuggery
				textScore: r.textScore,
				distance: r.distance,
				distanceScore: r.distanceScore
			}))
			.slice(0, results || RESULT_LIMIT);

		// filter the 

		res.json({
			suggestions: result
		})
	} catch (e){
		res.status(500).send(`Error: ${e}`);
	}
	
	//res.json({q, long, lat});
})

app.use('/static', express.static(path.join(__dirname, 'public')))

app.listen(3000, () => console.log('Example app listening on port 3000!'))