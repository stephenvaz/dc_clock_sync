const NTP = require('ntp-time').Client;

const ServerIP = process.env.NTP_IP || 'localhost';
const PORT = process.env.PORT || 1234;

async function synchronizeClients(numClients) {
    // Function to synchronize a single client and record the synchronization time
    async function syncClient() {
        const client = new NTP(ServerIP, PORT, { timeout: 5000 });
        const startTime = Date.now(); // Record start time
        await client.syncTime().catch(err => null); // Catch any errors during sync
        const endTime = Date.now(); // Record end time
        return endTime - startTime; // Return synchronization time
    }

    // Synchronize clocks for all clients one by one and record synchronization times
    const synchronizationTimes = [];
    for (let i = 0; i < numClients; i++) {
        const syncTime = await syncClient();
        if (syncTime !== null) {
            synchronizationTimes.push(syncTime); // Record synchronization time
        }
    }

    // Calculate total time taken
    const totalTime = synchronizationTimes.reduce((acc, time) => acc + time, 0);
    console.log(`Total time taken for ${numClients} clients to synchronize: ${totalTime} milliseconds`);

    // Calculate average time per client
    const averageTimePerClient = totalTime / numClients;
    console.log(`Average time per client: ${averageTimePerClient} milliseconds`);

    // Find valid synchronization times
    if (synchronizationTimes.length > 0) {
        // Calculate maximum and minimum synchronization times if valid times exist
        const maxSyncTime = Math.max(...synchronizationTimes);
        const minSyncTime = Math.min(...synchronizationTimes);
        console.log(`Maximum synchronization time: ${maxSyncTime} milliseconds`);
        console.log(`Minimum synchronization time: ${minSyncTime} milliseconds`);
    } else {
        // Handle case where no valid synchronization times are available
        console.log(`No valid synchronization times recorded.`);
    }

    // Calculate throughput (clients synchronized per second)
    const throughput = numClients / (totalTime / 1000);
    console.log(`Throughput: ${throughput} clients per second`);
}

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
