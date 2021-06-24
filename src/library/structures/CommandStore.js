const Command = require('./Command');
const Store = require('./base/Store');

class CommandStore extends Store {

	constructor(client) {
		super(client, 'commands', Command);
	}

}

module.exports = CommandStore;
