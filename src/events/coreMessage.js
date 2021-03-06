const { Event } = require('axolotl');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'message' });
	}

	run(message) {
		if (this.client.ready) this.client.monitors.run(message);
	}

};
