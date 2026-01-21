const axios = require('axios');

const OLLAMA_API_URL = 'http://localhost:11434/api'; // Update with your Ollama server URL

async function listModels() {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/tags`);
    return response.data.models;
  } catch (error) {
    console.error('Error listing models:', error);
    throw error;
  }
}

async function generateResponse(model, prompt, context = []) {
  try {
    const payload = { model, prompt, context };
    const response = await axios.post(`${OLLAMA_API_URL}/generate`, 
payload);
    return response.data;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

// Add more functions for session management and model switching as needed

module.exports = { listModels, generateResponse };
