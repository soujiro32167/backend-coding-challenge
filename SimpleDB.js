const DataBase = require('./DataBase');
const syncParse = require('csv-parse/lib/sync');
const dice = require('string-similarity');
const fs = require('fs');
const _ = require('lodash');

const Util = require('./util');

const TextWeight = 0.5;
const DistanceWeight = 0.5;
const textScoreThreshold = 0.5;

class SimpleDB extends DataBase {
	constructor({filePath}){
		super();
		if (!filePath){
			throw new Error('No data file path specified');
		}
		const fileStr = fs.readFileSync(filePath, 'utf8');

		this.data = syncParse(fileStr, {
			delimiter: '\t',
			columns: true,
			relax: true,
			max_limit_on_data_read: 300000,
			quote: null
		});

		this.data
			.forEach(r => {
				// map Canadian provinces
				if (r.country === 'CA'){
					r.admin1 = DataBase.provinceMap(r.admin1)
				}
				// numerify the coordinates
				r.lat = +r.lat;
				r.long = +r.long;
				r.countryFull = DataBase.countryMap(r.country)
			})
	}

	/**
	* Query the databse with text and optional coordinates
	* Its created as async to allow for possible network connections to external db and potential divide/conquer paralellism
	* @returns {Promise} a promise for an arrayof results
	**/
	async query(q, coordinates){
		if (!q){
			return [];
		}

		let maxDistance = -Infinity;
		let minDistance = Infinity;
		const withScoreAndDistance = _(this.data)
			.map(record => {
				const diceSimilarity = dice.compareTwoStrings(q, record.name);
				const distance = coordinates && Util.precisionRound(Util.geoDistance(coordinates, [+record.long, +record.lat]) / 1000, 2);
				// to normalize distances, we need the maximal distance
				maxDistance = maxDistance < distance ? distance : maxDistance;
				minDistance = minDistance > distance ? distance : minDistance;
				return {
					...record,
					textScore: diceSimilarity,
					distance: distance
				}
			})
			// take out clearly irrelevant results
			.filter(record => record.textScore > textScoreThreshold);

		// calculate the score as a weighted sum of text relevance and distance
		// distance is normalized using feature scaling https://en.wikipedia.org/wiki/Feature_scaling

		const result =  withScoreAndDistance
			.map(record => {
				const distanceScore = record.distance !== undefined && 1 - (( record.distance - minDistance ) / ( maxDistance - minDistance ));
				const textScore = record.textScore;
				return {
					...record,
					distanceScore,
					score: record.distance !== undefined ? (distanceScore * DistanceWeight) + (textScore * TextWeight) : record.textScore
				}
			})
			.orderBy('score', 'desc')
			.value();

		//console.log('max distance', maxDistance);
		//console.log('min distance', minDistance);

		return result;
	}
}

module.exports = SimpleDB;