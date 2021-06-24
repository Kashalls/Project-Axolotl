const mc = require('minecraft-protocol');

const client = mc.createClient({
	version: false,
	host: '127.0.0.1',
	port: 25565,
	username: 'me@jordanjones.org',
	auth: 'microsoft'
});

client.on('connect', () => {
	console.info('connected');
});
client.on('disconnect', (packet) => {
	console.log(`disconnected: ${packet.reason}`);
});
client.on('chat', (packet) => {
	const jsonMsg = JSON.parse(packet.message);
	if (jsonMsg.translate === 'chat.type.announcement' || jsonMsg.translate === 'chat.type.text') {
		const username = jsonMsg.with[0].text;
		const msg = jsonMsg.with[1];
		if (username === client.username) return;
		client.write('chat', { message: msg });
	}
});
