const SimpleDB = require('../SimpleDB');
const path = require('path')

test('db size matches number of records in input file', () => {
	expect(new SimpleDB({filePath: path.resolve(__dirname, '../subset.tsv')}).size).toBe(16);
})