const WebSocket = require('ws');
const express = require('express');

// Initialize Express app
const app = express();
app.use(express.json());

// Simulated database mapping card_id to QR code data (move this up for scope)
const qrCodeMapping = {
    "123456789": { cartID: "CART123", customerName: "John Doe" },
    "987654321": { cartID: "CART456", customerName: "Jane Smith" }
};

// REST endpoint to update QR code mapping
app.use('/', (req, res) => {
    res.send({ status: 'success' });
});

app.post('/update-qr', (req, res) => {
    const { card_id, cartID, customerName } = req.body;
    if (!card_id || !cartID || !customerName) {
        return res.status(400).send({ status: 'error', message: 'Missing required fields' });
    }
    qrCodeMapping[card_id] = { cartID, customerName };
    console.log(`Updated QR mapping: ${card_id} -> ${JSON.stringify(qrCodeMapping[card_id])}`);
    res.send({ status: 'success' });
});

// Start Express server
app.listen(3000, () => {
    console.log('REST server running on http://localhost:3000');
});

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients (e-commerce frontends)
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received from Raspberry Pi:', data);

            // Enrich data with QR code info
            const userInfo = qrCodeMapping[data.card_id] || {
                cartID: "Unknown",
                customerName: "Unknown"
            };

            const enrichedData = {
                raspberry_pi_id: data.raspberry_pi_id,
                card_id: data.card_id,
                cartID: userInfo.cartID,
                customerName: userInfo.customerName,
                timestamp: data.timestamp
            };

            // Broadcast to all connected frontend clients
            clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(enrichedData));
                }
            });
        } catch (error) {
            console.error('Error processing WebSocket message:', error.message);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
    });
});

wss.on('listening', () => {
    console.log('WebSocket server running on ws://localhost:8080');
});

wss.on('error', (error) => {
    console.error('WebSocket server error:', error.message);
});