const { Event } = require('axolotl');

module.exports = class extends Event {

	run(failure) {
		this.client.console.wtf(failure);
	}

	init() {
		if (!this.client.options.consoleEvents.wtf) this.disable();
	}

};
