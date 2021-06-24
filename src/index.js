module.exports = {
	Client: require('./library/Client'),
	AxolotlClient: require('./library/Client'),
	Axolotl: require('./library/Client'),

	Schedule: require('./library/schedule/Schedule'),
	ShheduleTask: require('./library/schedule/ScheduledTask'),

	Piece: require('./library/structures/base/Piece'),
	Store: require('./library/structures/base/Store'),

	Settings: require('./library/settings/Settings'),
	Gateway: require('./library/settings/Gateway'),
	GatewayDriver: require('./library/settings/GatewayDriver'),
	GatewayStorage: require('./library/settings/GatewayStorage'),
	Schema: require('./library/settings/schema/Schema'),
	SchemaFolder: require('./library/settings/schema/SchemaFolder'),
	SchemaPiece: require('./library/settings/schema/SchemaPiece'),

	Command: require('./library/structures/Command'),
	CommandStore: require('./library/structures/CommandStore'),
	Event: require('./library/structures/Event'),
	EventStore: require('./library/structures/EventStore'),
	Inhibitor: require('./library/structures/Inhibitor'),
	InhibitorStore: require('./library/structures/InhibitorStore'),
	Monitor: require('./library/structures/Monitor'),
	MonitorStore: require('./library/structures/MonitorStore'),
	Provider: require('./library/structures/Provider'),
	ProviderStore: require('./library/structures/ProviderStore'),
	Task: require('./library/structures/Task'),
	TaskStore: require('./library/structures/TaskStore'),

	Colors: require('./library/util/Colors'),
	AxolotlConsole: require('./library/util/AxolotlConsole'),
	Constants: require('./library/util/Constants'),
	Cron: require('./library/util/Cron'),
	Duration: require('./library/util/Duration'),
	Stopwatch: require('./library/util/Stopwatch'),
	Timestamp: require('./library/util/Timestamp'),
	Util: require('./library/util/Util'),
	util: require('./library/util/Util'),

	version: require('../package').version
};

/**
 * @external ExecOptions
 * @see {@link https://nodejs.org/dist/latest-v10.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback}
 */
/**
 * @external Collection
 * @see {@link https://discord.js.org/#/docs/main/master/class/Collection}
 */
