// scalability.js

const NTP = require('ntp-time').Client;

const ServerIP = process.env.NTP_IP || 'localhost';
const PORT = process.env.PORT || 1234;

// Function to create and synchronize multiple clients
async function synchronizeClients(numClients) {
    const clients = [];

    // Create NTP clients
    for (let i = 0; i < numClients; i++) {
        clients.push(new NTP(ServerIP, PORT, { timeout: 5000 }));
    }

    // Synchronize clocks for all clients simultaneously
    const startTime = Date.now();
    await Promise.all(clients.map(client => client.syncTime()));
    const endTime = Date.now();

    // Calculate total time taken
    const totalTime = endTime - startTime;
    console.log(`Total time taken for ${numClients} clients to synchronize: ${totalTime} milliseconds`);

}

// Ask user for the number of clients to create
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter the number of clients to create: ', (numClients) => {
    synchronizeClients(parseInt(numClients, 10))
        .then(() => {
            readline.close();
        })
        .catch((error) => {
            console.error('Error:', error);
            readline.close();
        });
});
