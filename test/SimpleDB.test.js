const SimpleDB = require('../SimpleDB');
const path = require('path');
let presetDb;

beforeAll(() => {
	presetDb = new SimpleDB({filePath: path.resolve(__dirname, '../subset.tsv')});
})

test('db size matches number of records in input file', () => {
	expect(presetDb.size).toBe(16);
});

test('column number matches input file', async () => {
	const data = await presetDb.getData();
	// 19 original columns + 1 generated
	expect(Object.keys(data[0]).length).toBe(20)
})

test('columns should match the header of the csv', async () => {
	const data = await presetDb.getData();
	expect(Object.keys(data[0])).toEqual(["id","name","ascii","alt_name","lat","long","feat_class","feat_code","country","cc2","admin1","admin2","admin3","admin4","population","elevation","dem","tz","modified_at","countryFull"]);
});

test('full match query, no coordinates', async () => {
	const results = await presetDb.query('Amherst');
	expect(results[0].name).toBe('Amherst');
	expect(results[1].name).toBe('Amherstburg');

})

test('full match query, with coordinates', async () => {
	const results = await presetDb.query('Amherst', [-83.04985, 42.11679]);
	// Amherstburg
	// 		textScore: 0.75,
  	//      distance: 0,
  	//      distanceScore: 1
  	// 		score: 0.875
  	// Amherst
  	// 		textScore: 1,
    //      distance: 1559.91,
    //      distanceScore: 0.5051847575424027,
    //      score: 0.7525923787712013
	console.log(results);
	expect(results[0].name).toBe('Amherstburg');
	expect(results[1].name).toBe('Amherst');

})

describe('edge cases', () => {
	test('no file path', () => {
		expect(() => {
			new SimpleDB()
		}).toThrow()
	});

	test('file does not exist', () => {
		expect(() => {
			new SimpleDB({filePath: 'whatever'})
		}).toThrow();
	})

	test('empty query', async () => {
		const result = await presetDb.query();
		expect(result.length).toBe(0);
	})
})