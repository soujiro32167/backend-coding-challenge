const provinceMap = {
	'01': 'AB',
	'02': 'BC',
	'03': 'MB',
	'04': 'NB',
	'05': 'NL',
	// 06 is missing
	'07': 'NS',
	'08': 'ON',
	'09': 'PE',
	'10': 'QC',
	'11': 'SK',
	'12': 'YK',
	'13': 'NT',
	'14': 'NU'
};

const countryMap = {
	'US': 'USA',
	'CA': 'Canada'
}

/**
* A database that can be queried with text and coordinates
**/
module.exports = class DataBase{
	constructor(){
		this.data = {};
	}

	get size(){
		return this.data.length;
	}

	async query(q, coordinates) {
		return [];
	}

	static provinceMap(admin1){
		return provinceMap[admin1];
	}

	static countryMap(country){
		return countryMap[country];
	}
}