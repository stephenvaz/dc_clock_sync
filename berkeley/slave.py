import datetime
import signal
import socket

from env import *

CORRECTION = 0

def closeConnection(sig, frame):
    slave.send(b'-1')
    slave.close()

slave = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

signal.signal(signal.SIGINT, closeConnection)
print(f"Client @ {HOST}:{PORT}")
slave.connect((HOST, PORT))

print("Initial Time", datetime.datetime.now())
while True:
    payload = slave.recv(BUFFERSIZE).decode(FORMAT)
    messageType = payload[0]
    message = payload[1:]
    if(messageType == '0'):
        serverTime = datetime.datetime.fromisoformat(message)
        difference = (datetime.datetime.now() + datetime.timedelta(seconds=CORRECTION) - serverTime).total_seconds()
        slave.send(str(int(difference)).encode(FORMAT))
    elif(messageType == '1'):
        CORRECTION += int(message)
        print(f"New Time {datetime.datetime.now() + datetime.timedelta(seconds=CORRECTION)}")