const Piece = require('./base/Piece');

/**
 * Base class for all Commands. See {@tutorial CreatingCommands} for more information how to use this class
 * to build custom commands.
 * @tutorial CreatingCommands
 * @extends Piece
 */
class Command extends Piece {

	/**
	 * @typedef {PieceOptions} CommandOptions
	 * @property {(string|Function)} [description=''] The help description for the command
	 * @property {boolean} [guarded=false] If the command can be disabled on a guild level (does not effect global disable)
	 */

	/**
	 * @since 0.0.1
	 * @param {CommandStore} store The Command store
	 * @param {Array} file The path from the pieces folder to the command file
	 * @param {string} directory The base directory to the pieces folder
	 * @param {CommandOptions} [options={}] Optional Command settings
	 */
	constructor(store, file, directory, options = {}) {
		super(store, file, directory, options);

		this.name = this.name.toLowerCase();

		/**
		 * Whether this command should not be able to be disabled in a guild or not
		 * @since 0.5.0
		 * @type {boolean}
		 */
		this.guarded = options.guarded;

		/**
		 * The full category for the command
		 * @since 0.0.1
		 * @type {string[]}
		 */
		this.fullCategory = file.slice(0, -1);
	}

	/**
	 * The run method to be overwritten in actual commands
	 * @since 0.0.1
	 * @param {string} message The command message mapped on top of the message used to trigger this command
	 * @param {any[]} params The fully resolved parameters based on your usage / usageDelim
	 * @returns {string|string[]} You should return the response message whenever possible
	 * @abstract
	 */
	async run() {
		// Defined in extension Classes
		throw new Error(`The run method has not been implemented by ${this.type}:${this.name}.`);
	}

	/**
	 * Defines the JSON.stringify behavior of this command.
	 * @returns {Object}
	 */
	toJSON() {
		return {
			...super.toJSON(),
			guarded: this.guarded,
			fullCategory: this.fullCategory
		};
	}

}

module.exports = Command;

