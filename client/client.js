const NTP = require('ntp-time').Client;

const ServerIP = process.env.NTP_IP || 'localhost';

const client = new NTP(ServerIP, 1234, { timeout: 5000 });
const client2 = new NTP(ServerIP, 1235, { timeout: 5000 });

let time = new Date();

async function sync() {
	try {

		const t = await client.syncTime();
        time = t.time;
        console.log("Clock Synced")
	} catch (err) {
		// console.log(err);
        console.log("Server 1 Error")
        console.log("Trying Server 2")
        try {
            const t = await client2.syncTime();
            time = t.time;
            console.log("Clock Synced by Server 2")
        } catch (err) {
            console.log("Server 2 Error")
        }

	}
}

setInterval(sync, 5 * 1000);

setInterval(() => {
    console.log(time.toLocaleString(
        'en-US',
        {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        }
    ));
    time = new Date(time.getTime() + 1000);
}, 1000);
