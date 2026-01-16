const express = require('express');
const router = express.Router();
const sessionManager = require('../sessionManager');

router.get('/', (req, res) => {
    // Get current session data
    const sessionData = sessionManager.getCurrentSession();

    // Send session data back to UI
    res.json({ success: true, data: sessionData });
});

router.post('/save', (req, res) => {
    // Extract session data from request body
    const { sessionData } = req.body;

    try {
        // Save session data to file
        sessionManager.saveSession(sessionData);

        // Send success response back to UI
        res.json({ success: true, message: 'Session saved successfully' 
});
    } catch (error) {
        console.error('Error in save session route:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
