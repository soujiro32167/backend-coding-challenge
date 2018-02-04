const DataBase = require('./DataBase');
const syncParse = require('csv-parse/lib/sync');
const dice = require('string-similarity');
const fs = require('fs');
const _ = require('lodash');

const Util = require('./util');

const TextWeight = 0.5;
const DistanceWeight = 0.5;

class SimpleDB extends DataBase {
	constructor({filePath}){
		super();
		const fileStr = fs.readFileSync(filePath, 'utf8');

		this.data = syncParse(fileStr, {
			delimiter: '\t',
			columns: true,
			relax: true,
			max_limit_on_data_read: 300000,
			quote: null
		})
	}

	/**
	* Query the databse with text and optional coordinates
	* Its created as async to allow for possible network connections to external db and potential divide/conquer paralellism
	* @returns {Promise} a promise for an arrayof results
	**/
	async query(q, coordinates){
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
					name: record.name,
					textScore: diceSimilarity,
					distance: distance,
					lat: +record.lat,
					long: +record.long
				}
			})
			// take out clearly irrelevant results
			.filter(record => record.textScore > 0);

			//maxDistance = withScoreAndDistance.maxBy('distance').distance;

		// calculate the score as a weighted sum of text relevance and distance
		// (distance / maxDistance): is the % of maximum distance
		// 100 - % of max distance: we want the inverse - % how close we are compared to all places

		const result =  withScoreAndDistance
			.map(record => {
				//const distanceScore = record.distance && (100 - (record.distance / maxDistance)) / 100;
				const distanceScore = record.distance && 1 - (( record.distance - minDistance ) / ( maxDistance - minDistance ));
				const textScore = record.textScore;
				return {
					...record,
					distanceScore,
					score: record.distance ? (distanceScore * DistanceWeight) + (textScore * TextWeight) : record.textScore
				}
			})
			.orderBy('score', 'desc')
			.value();

		console.log('max distance', maxDistance);
		console.log('min distance', minDistance);

		return result;
	}
}

module.exports = SimpleDB;