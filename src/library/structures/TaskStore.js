const Task = require('./Task');
const Store = require('./base/Store');

/**
 * Stores all task pieces for use in Axolotl
 * @extends Store
 */
class TaskStore extends Store {

	/**
	 * Constructs our TaskStore for use in Axolotl
	 * @since 0.5.0
	 * @param {AxolotlClient} client The Axolotl client
	 */
	constructor(client) {
		super(client, 'tasks', Task);
	}

}

module.exports = TaskStore;
