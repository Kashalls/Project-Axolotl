const Piece = require('./Piece');

class Command extends Piece {

	constructor(store, file, directory, options = {}) {
		super(store, file, directory, options);

		this.name = this.name.toLowerCase();
		this.guarded = options.guarded;
		this.fullCategory = file.slice(0, -1);
	}

	async run() {
		// Defined in extension Classes
		throw new Error(`The run method has not been implemented by ${this.type}:${this.name}.`);
	}

}

module.exports = Command;

