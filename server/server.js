import { Server as NTPServer } from 'ntp-time';

const server = new NTPServer();

const clientOffsets = {};

server.handle((message, response) => {
    console.log('Server message:', message);

    const clientReceiveTime = Math.floor(Date.now() / 1000);
    const clientTransmitTime = message.txTimestamp;
    const serverReceiveTime = message.rxTimestamp;
    const offset = ((clientReceiveTime - clientTransmitTime) + (clientTransmitTime - serverReceiveTime)) / 2;

    // Store the offset for the client
    const clientId = message.stratum.toString();
    clientOffsets[clientId] = offset;

    // Respond to the client
    message.txTimestamp = Math.floor(Date.now() / 1000);
    response(message);
});

const PORT = process.env.PORT || 1234;

server.listen(PORT, err => {
    if (err) {
        console.log("Error: ", err)
        throw err
    };
    // console.clear();
    console.log(`Server @ http://localhost:${PORT}`);
});

// Calculate the synchronized time
function getSynchronizedTime() {
    const serverTime = Math.floor(Date.now() / 1000);
    let synchronizedTime = serverTime;

    // Adjust the server time based on the offsets from clients
    for (const offset of Object.values(clientOffsets)) {
        synchronizedTime += offset;
    }

    return synchronizedTime;
}

// Test the getSynchronizedTime function
console.log("Initial Synchronized Time:", getSynchronizedTime());
