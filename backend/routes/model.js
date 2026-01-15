const express = require('express');
const router = express.Router();
const modelSwitcher = require('../modelSwitcher');

router.get('/', (req, res) => {
    // Get current model name
    const modelName = modelSwitcher.getCurrentModel();

    // Send model name back to UI
    res.json({ success: true, data: modelName });
});

router.post('/switch', async (req, res) => {
    // Extract new model name from request body
    const { modelName } = req.body;

    try {
        // Switch to the new model
        await modelSwitcher.switchModel(modelName);

        // Send success response back to UI
        res.json({ success: true, message: 'Model switched successfully' 
});
    } catch (error) {
        console.error('Error in switch model route:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
