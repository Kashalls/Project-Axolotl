const { Event } = require('axolotl');

module.exports = class extends Event {

	run(err) {
		this.client.console.error(err);
	}

	init() {
		if (!this.client.options.consoleEvents.error) this.disable();
	}

};
