const Command = require('./Command');
const Store = require('./base/Store');

/**
 * Stores all the commands usable in axolotl
 * @extends Store
 */

class CommandStore extends Store {

	/**
	 * Constructs our CommandStore for use in axolotl
	 * @since 0.0.1
	 * @param {AxolotlClient} client The axolotl Client
	 */
	constructor(client) {
		super(client, 'commands', Command);
	}

}

module.exports = CommandStore;
