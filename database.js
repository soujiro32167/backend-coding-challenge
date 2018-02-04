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
}