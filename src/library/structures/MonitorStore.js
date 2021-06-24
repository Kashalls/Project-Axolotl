const Monitor = require('./Monitor');
const Store = require('./base/Store');

/**
 * Stores all monitors for use in Axolotl
 * @extends Store
 */
class MonitorStore extends Store {

	/**
	 * Constructs our MonitorStore for use in Axolotl
	 * @since 0.0.1
	 * @param {AxolotlClient} client The Axolotl Client
	 */
	constructor(client) {
		super(client, 'monitors', Monitor);
	}

	/**
	 * Runs our monitors on the message.
	 * @since 0.0.1
	 * @param {string} message The message object from Discord.js
	 */
	run(message) {
		for (const monitor of this.values()) if (monitor.shouldRun(message)) monitor._run(message);
	}

}

module.exports = MonitorStore;
