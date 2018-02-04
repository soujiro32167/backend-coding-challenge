const { performance } = require('perf_hooks');
const should = require('should');
const _ = require('lodash');

const DataBase = require('./SimpleDB');
let db;



//console.log("levenshtein.get('back', 'book');", levenshtein.get('back', 'book'));  // 2 
//console.log("levenshtein.get('我愛你', '我叫你');", levenshtein.get('我愛你', '我叫你'));  // 1

// function parsePromise(filename){
// 	return new Promise((resolve, reject) => {
// 		let parser = parse({
// 		delimiter: '\t',
// 		columns: true,
// 		relax: true,
// 		max_limit_on_data_read: 300000,
// 		//to: 3000,
// 		quote: null
// 		}, function(err, data){
// 		  if (err){
// 		  	reject(err);
// 		  } else {
// 		  	resolve(data);
// 		  }
// 		});

// 		fs.createReadStream(filename).pipe(parser);
// 	});
// }

// async function dothings(){
// 	try {
// 		let result = await parsePromise('cities_canada_usa.tsv');
// 		console.log('length:', result.length);
// 		console.log('last:', result[result.length - 1])
// 	} catch (e){
// 		console.error(e);
// 	}
// }

// dothings()


console.time('parse');
db = new DataBase({
	filePath: 'cities_canada_usa.tsv'
});
console.timeEnd('parse');

//console.log(db[db.length - 1]);

should.equal(db.size, 7237);

const iterations = 10;

//console.log(db);
//console.time('query');
let totalTime = 0;
let results = [];
_.range(iterations)
	.forEach(i => {
		performance.mark('query' + i);
		results.push(db.query('Londo', [-79.4163, 43.70011], db).then(data => {
			performance.mark('query' + i + 'end');
			performance.measure(`query${i}total`, 'query' + i, 'query' + i + 'end');
 			totalTime += performance.getEntriesByName(`query${i}total`)[0].duration;
 			return data;
		}));
	});

Promise.all(results).then(resultArray => {
	console.log('totalTime', totalTime, 'ms');
	console.log('avg', totalTime / iterations, 'ms');
	console.log('results', resultArray[0].slice(0, 9));
})