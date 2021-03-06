const { Event } = require('axolotl');

module.exports = class extends Event {

	run(warning) {
		this.client.console.warn(warning);
	}

	init() {
		if (!this.client.options.consoleEvents.warn) this.disable();
	}

};
