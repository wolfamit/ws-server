const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const {Cart , Item} = require('./model');
const connectDB = require('./db'); // Import DB connection

// Initialize Express app
const app = express();
app.use(express.json({limit: "30mb" , extended: "true"}));
app.use(cors({origin:true}))

// ✅ POST - Authorize and Update Cart Details
app.post('/authorize/:cart_id', async (req, res) => {
        const { cart_id } = req.params;
        const { cell, customerName } = req.body;
    
        if (!cart_id || !customerName) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }
    
        try {
            // Step 1: Check if the cart exists (Authorize)
            const cart = await Cart.findOne({ cartID: cart_id });
            if (!cart) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized: Cart ID not found' });
            }
            // Step 2: Update cart details
            cart.cell = cell;
            cart.occupied = true;
            cart.customerName = customerName;
            cart.timestamp = new Date();
            await cart.save(); // Save the changes
    
            res.status(200).json({
                status: 'success',
                cartID: cart.cartID,
                cell: cart.cell,
                customerName,
                items : cart.items,
                timestamp: cart.timestamp.toISOString()
            });
        } catch (error) {
            console.error("Error updating cart:", error);
            res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
    });

// ✅ GET - Create a New Cart Entry
app.post('/update/:cart_id', async (req, res) => {
    const { cart_id } = req.params;

    if (!cart_id || cart_id.trim() === "") {
        return res.status(400).json({ status: 'error', message: "Invalid cart ID" });
    }

    try {
        const newCart = await Cart.create({ cartID: cart_id, occupied: false });

        res.status(200).json({
            status: 'success',
            message: "Cart ID created",
            cartID: newCart.cartID,
            occupied: newCart.occupied,
            timestamp: newCart.timestamp.toISOString()
        });
    } catch (error) {
        console.error("Error creating cart:", error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

app.post('/v2/update/item' , async (req, res) => {
    const { card_id } = req.body;
    if (!card_id ) {
        return res.status(400).json({ status: 'error', message: "Invalid card ID" });
    }
    try {
        newItem = await Item.create({
            card_id: card_id,
            item_name: "T-Shirt",
            description: "Premium cotton t-shirt",
            price: 799,
            discounted_price: 599,
            url: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flipkart.com%2Ffastb-printed-men-round-neck-black-t-shirt%2Fp%2Fitme1e2531fe55e5&psig=AOvVaw0qKbE1koXHz8a3y2WkwtT4&ust=1740731667928000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCPDfnfq444sDFQAAAAAdAAAAABAJ",
            size: "L",
            color: "Blue"
        });
        return res.status(200).json({ status: 'success', message: "Success", newItem });
    } catch (error) {
        console.error("Error creating cart:", error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});



// Start Express Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
connectDB();

// Initialize WebSocket server
// const wss = new WebSocket.Server({ port: 8080 });

// // Store connected clients (e-commerce frontends)
// const clients = new Set();

// wss.on('connection', (ws) => {
//     console.log('New client connected');
//     clients.add(ws);
    
//     ws.on('message', (message) => {
//         try {
//             const data = JSON.parse(message);
//             console.log('Received from Raspberry Pi:', data);

//             // Enrich data with QR code info
//             const userInfo = qrCodeMapping[data.card_id] || {
//                 cartID: "Unknown",
//                 customerName: "Unknown"
//             };

//             const enrichedData = {
//                 raspberry_pi_id: data.raspberry_pi_id,
//                 card_id: data.card_id,
//                 cartID: userInfo.cartID,
//                 customerName: userInfo.customerName,
//                 timestamp: data.timestamp
//             };

//             // Broadcast to all connected frontend clients
//             clients.forEach((client) => {
//                 if (client.readyState === WebSocket.OPEN) {
//                     client.send(JSON.stringify(enrichedData));
//                 }
//             });
//         } catch (error) {
//             console.error('Error processing WebSocket message:', error.message);
//         }
//     });

//     ws.on('close', () => {
//         console.log('Client disconnected');
//         clients.delete(ws);
//     });

//     ws.on('error', (error) => {
//         console.error('WebSocket error:', error.message);
//     });
// });

// wss.on('listening', () => {
//     console.log('WebSocket server running on ws://localhost:8080');
// });

// wss.on('error', (error) => {
//     console.error('WebSocket server error:', error.message);
// });