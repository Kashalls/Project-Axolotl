'use strict';
const path = require('path');

const { Client: BaseClient } = require('minecraft-protocol');
const Collection = require('@discordjs/collection');

const { DEFAUILTS } = require('./util/Constants');
const Util = require('./util/Util');
const AxolotlConsole = require('./util/AxolotlConsole');

// external plugions
const plugins = new Set();

class AxolotlClient extends BaseClient {

	/**
	 * Defaulted as `Successfully initialized. Logged in as ${this.username}.`.
	 * @typedef {(string|Function)} ReadyMessage
	 */

	/**
	 * Defaulted to Client.defaultPermissionLevels
	 * @typedef {PermissionLevels} PermissionLevelsOverload
	 */

	/**
	 * @typedef {external:ClientOptions} AxolotlClientOptions
	 * @property {boolean} [commandLogging=false] Whether the bot should log command usage.
	 * @property {ConsoleEvents} [consoleEvents={}] Options to pass to the Console Client
	 * @property {ConsoleOptions} [consoleOptions={}] Console options to pass to the client.
	 * @property {boolean} [createPiecesFolder=true] Should axolotl create folders for each piece at start up.
	 * @property {string[]} [disabledCorePieces=[]] An array of disabled core piece types, e.g. ['commands', 'events']
	 * @property {string[]} [owners=[]] A list of minecraft usernames that are allowed full access to your bot. It is generally not a good idea to give access to accounts you share.
	 * @property {PermissionLevelsOverload} [permissionLevels] Permission levels to use with this bot.
	 * @property {PieceDefaults} [pieceDefaults={}] Overrides all of the defaults for those pieces.
	 * @property {string|string[]} [prefix] The default prefix the bot should respond to.
	 * @property {boolean} [production=false] Whether the bot should handle unhandled promise rejections automatically (handles when false) (also can be configured with process.env.NODE_ENV)
	 * @property {ReadyMessage} [readyMessage] The message to be logged when the client is ready
	 * @property {RegExp} [regexPrefix] The regular expression version of a prefix if one is provided.
	 * @property {ScheduleOptions} [schedule={}] Options for the internal clock module for scheduling.
	 * @property {boolean} [prefixCaseINsensitive=false ]
	 */

	/**
	 * @typedef {Object} ScheduleOptions
	 * @property {number} [interval=60000] The interval in milliseconds for the clock to check the tasks
	 */

	/**
	 * @typedef {Object} ConsoleEvents
	 * @property {boolean} [debug=false] If the debug event should be enabled by default
	 * @property {boolean} [error=true] If the error event should be enabled by default
	 * @property {boolean} [log=true] If the log event should be enabled by default
	 * @property {boolean} [verbose=false] If the verbose event should be enabled by default
	 * @property {boolean} [warn=true] If the warn event should be enabled by default
	 * @property {boolean} [wtf=true] If the wtf event should be enabled by default
	 */

	/**
	 * @typedef {object} PieceDefaults
	 * @property {CommandOptions} [commands={}]
	 * @property {EventOptions} [events={}]
	 * @property {MonitorOptions} [monitors={}]
	 * @property {InhibitorOptions} [inhibitors={}]
	 */


	/**
	 * Constructs the Axolotl Client
	 * @since 0.0.1
	 * @param {AxolotlClientOptions} [options={}] The config to configure this and other extensions with.
	 */
	constructor(options = {}) {
		if (!Util.isObject(options)) throw new TypeError('Client Options must be an object');
		options = Util.mergeDefaults(DEFAUILTS.CLIENT, options);
		super(options);

		/**
		 * The options the client was instantiated with.
		 * @since 0.0.1
		 * @name {AxolotlClient#options}
		 * @type {AxolotlClientOptions}
		 */

		/**
		 * The directory where the user files are located.
		 * @since 0.0.1
		 * @type {string}
		 */
		this.userBaseDirectory = path.dirname(require.main.filename);

		/**
		 * The console for this instance of Axolotl. You can disable timestamps, colors or add writable streams as configuration options to configure this.
		 * @since 0.0.1
		 * @type {AxolotlConsole}
		 */
		this.console = new AxolotlConsole(this.options.console);

		/**
		 * The cache where commands are stored
		 * @since 0.0.1
		 * @type {CommandStore}
		 */
		this.commands = new CommandStore(this);

		/**
		 * The store registry
		 * @since 0.0.1
		 * @type {external:Collection}
		 */
		this.pieceStores = new Collection();

		/**
		 * The permissions structure for this bot
		 * @since 0.0.1
		 * @type {PermissionLevels}
		 */
		this.permissionLevels = this.validatePermissionLevels();

		this.registerStore(this.commands)
			.registerStore(this.inhibitors)
			.registerStore(this.monitors)
			.registerStore(this.events)
			.registerStore(this.tasks);

		const coreDirectory = path.join(__dirname, '../');
		for (const store of this.pieceStores.values()) store.registerCoreDirectory(coreDirectory);

		/**
		 * The Schedule that runs the tasks
		 * @since 0.0.1
		 * @type {Schedule}
		 */
		this.schedule = new Schedule(this);

		/**
		 * Whether the client is truly ready or not
		 * @since 0.0.1
		 * @type {boolean}
		 */
		this.ready = false;

		/**
		 * The regexp for a prefix mention
		 * @since 0.5.0
		 * @type {RegExp}
		 */
		this.mentionPrefix = null;

		// Run all plugin functions in this context
		for (const plugin of plugins) plugin.call(this);
		// this.on('debug', (log) => console.log(log));
		// this.on('keep_alive', (log) => console.log(log));
		// this.on('encryption_begin', () => console.log(`Encryption beginning`));
	}

	/**
	 * The owners for this bot
	 * @since 0.0.1
	 * @type {Set<string>}
	 * @readonly
	 */
	get owners() {
		const owners = new Set();
		for (const owner of this.options.owners) {
			owners.add(owner);
		}
		return owners;
	}

	/**
	 * Validates the permission structure passed to the client
	 * @since 0.0.1
	 * @returns {PermissionLevels}
	 * @private
	 */
	validatePermissionLevels() {
		const permissionLevels = this.options.permissionLevels || this.constructor.defaultPermissionLevels;
		if (!(permissionLevels instanceof PermissionLevels)) throw new Error('permissionLevels must be an instance of the PermissionLevels class');
		if (permissionLevels.isValid()) return permissionLevels;
		throw new Error(permissionLevels.debug());
	}

	/**
	 * Registers a custom store to the client
	 * @since 0.3.0
	 * @param {Store} store The store that pieces will be stored in
	 * @returns {this}
	 * @chainable
	 */
	registerStore(store) {
		this.pieceStores.set(store.name, store);
		return this;
	}

	/**
		 * Un-registers a custom store from the client
		 * @since 0.3.0
		 * @param {Store} storeName The store that pieces will be stored in
		 * @returns {this}
		 * @chainable
		 */
	unregisterStore(storeName) {
		this.pieceStores.delete(storeName);
		return this;
	}

	/**
	 * Use this to login with your bot
	 * @since 0.0.1
	 * @returns {string}
	 */
	async login() {
		const timer = new Stopwatch();
		const loaded = await Promise.all(this.pieceStores.map(async store => `Loaded ${await store.loadAll()} ${store.name}.`))
			.catch((err) => {
				console.error(err);
				process.exit();
			});
		this.emit('log', loaded.join('\n'));
		this.emit('log', `Loaded in ${timer.stop()}.`);
		return super.login();
	}

	/**
	 * Caches a plugin module to be used when creating a Axolotl instance
	 * @since 0.5.0
	 * @param {Object} mod The module of the plugin to use
	 * @returns {this}
	 * @chainable
	 */
	static use(mod) {
		const plugin = mod[this.plugin];
		if (!Util.isFunction(plugin)) throw new TypeError('The provided module does not include a plugin function');
		plugins.add(plugin);
		return this;
	}

}

module.exports = AxolotlClient;

/**
 * The plugin symbol to be used in external packages
 * @since 0.5.0
 * @type {Symbol}
 */
AxolotlClient.plugin = Symbol('AxolotlPlugin');

/**
 * The default PermissionLevels
 * @since 0.2.1
 * @type {PermissionLevels}
 */
AxolotlClient
	.defaultPermissionLevels = new PermissionLevels()
		.add(0, () => true)
		.add(1, ({ user, client }) => client.users.has(user))
		.add(10, ({ user, client }) => client.owners.has(user));

/**
 * Emitted when Axolotl is fully ready and initialized.
 * @event AxolotlClient#axolotlReady
 * @since 0.0.1
 */

/**
 * A central logging event for AxolotlClient.
 * @event AxolotlClient#log
 * @since 0.3.0
 * @param {(string|Object)} data The data to log
 */

/**
 * An event for handling verbose logs
 * @event AxolotlClient#verbose
 * @since 0.4.0
 * @param {(string|Object)} data The data to log
 */

/**
 * An event for handling wtf logs (what a terrible failure)
 * @event AxolotlClient#wtf
 * @since 0.4.0
 * @param {(string|Object)} data The data to log
 */

/**
 * Emitted when an unknown command is called.
 * @event AxolotlClient#commandUnknown
 * @since 0.4.0
 * @param {string} message The message that triggered the command
 * @param {string} command The command attempted to run
 * @param {RegExp} prefix The prefix used
 * @param {number} prefixLength The length of the prefix used
 */

/**
 * Emitted when a command has been inhibited.
 * @event AxolotlClient#commandInhibited
 * @since 0.3.0
 * @param {string} message The message that triggered the command
 * @param {Command} command The command triggered
 * @param {?string[]} response The reason why it was inhibited if not silent
 */

/**
 * Emitted when a command has been run.
 * @event AxolotlClient#commandRun
 * @since 0.3.0
 * @param {string} message The message that triggered the command
 * @param {Command} command The command run
 * @param {string[]} args The raw arguments of the command
 */

/**
 * Emitted when a command has been run.
 * @event AxolotlClient#commandSuccess
 * @since 0.5.0
 * @param {string} message The message that triggered the command
 * @param {Command} command The command run
 * @param {any[]} params The resolved parameters of the command
 * @param {?any} response Usually a response message, but whatever the command returned
 */

/**
 * Emitted when a command has encountered an error.
 * @event AxolotlClient#commandError
 * @since 0.3.0
 * @param {string} message The message that triggered the command
 * @param {Command} command The command run
 * @param {any[]} params The resolved parameters of the command
 * @param {Object} error The command error
 */

/**
 * Emitted when an event has encountered an error.
 * @event AxolotlClient#eventError
 * @since 0.5.0
 * @param {Event} event The event that errored
 * @param {any[]} args The event arguments
 * @param {(string|Object)} error The event error
 */

/**
 * Emitted when a monitor has encountered an error.
 * @event AxolotlClient#monitorError
 * @since 0.4.0
 * @param {string} message The message that triggered the monitor
 * @param {Monitor} monitor The monitor run
 * @param {(Error|string)} error The monitor error
 */

/**
 * Emitted when a finalizer has encountered an error.
 * @event AxolotlClient#finalizerError
 * @since 0.5.0
 * @param {string} message The message that triggered the finalizer
 * @param {Command} command The command this finalizer is for (may be different than message.command)
 * @param {string|any} response The response from the command
 * @param {Stopwatch} timer The timer run from start to queue of the command
 * @param {Finalizer} finalizer The finalizer run
 * @param {(Error|string)} error The finalizer error
 */

/**
 * Emitted when a task has encountered an error.
 * @event AxolotlClient#taskError
 * @since 0.5.0
 * @param {ScheduledTask} scheduledTask The scheduled task
 * @param {Task} task The task run
 * @param {(Error|string)} error The task error
 */

/**
 * Emitted when a piece is loaded. (This can be spammy on bot startup or anytime you reload all of a piece type.)
 * @event AxolotlClient#pieceLoaded
 * @since 0.4.0
 * @param {Piece} piece The piece that was loaded
 */

/**
 * Emitted when a piece is unloaded.
 * @event AxolotlClient#pieceUnloaded
 * @since 0.4.0
 * @param {Piece} piece The piece that was unloaded
 */

/**
 * Emitted when a piece is reloaded.
 * @event AxolotlClient#pieceReloaded
 * @since 0.4.0
 * @param {Piece} piece The piece that was reloaded
 */

/**
 * Emitted when a piece is enabled.
 * @event AxolotlClient#pieceEnabled
 * @since 0.4.0
 * @param {Piece} piece The piece that was enabled
 */

/**
 * Emitted when a piece is disabled.
 * @event AxolotlClient#pieceDisabled
 * @since 0.4.0
 * @param {Piece} piece The piece that was disabled
 */

