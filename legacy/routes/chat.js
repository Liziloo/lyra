const express = require('express');
const router = express.Router();
const ollamaClient = require('../ollamaClient');

router.post('/', async (req, res) => {
    // Extract input from request body
    const { input } = req.body;

    try {
        // Call ollamaClient to get response
        const response = await ollamaClient.getResponse(input);

        // Send response back to UI
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
