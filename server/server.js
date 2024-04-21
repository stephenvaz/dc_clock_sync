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
    
    const addDelay = process.argv.includes('--delay');

    if (addDelay) {
        // Add a random delay of 1 to 5 seconds before sending the response
        const delayInSeconds = Math.floor(Math.random() * 5) + 1;
        setTimeout(() => {
            response(message);
        }, delayInSeconds * 1000);
        console.log(`Delayed response will be sent after ${delayInSeconds} seconds.`);
    } else {
        response(message);
    }
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