const fs = require("fs");
const axios = require("axios");
let { log, pint } = require("../../lib/colores");
let Config = require("../../config");
let { jsonformat } = require("../../lib/myfunc");
module.exports = {
  cmd: /^(test)/i,
  ignored: true,
  owner: true,
  register: true,
  check: { pts: 1 },
  async handler(m, {myBot, text, User}) {
    const apiKey = Config.OPEN_AI_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    async function generateResponse(prompt) {
      try {
        const response = await axios.post(apiUrl, {
          prompt: prompt,
          max_tokens: 50,  // Ajusta este valor según tus necesidades
          engine: 'gpt-3.5-turbo',  // Especifica el modelo a usar
          role: 'assistant'  // Define el role (puede ser 'system', 'user', o 'assistant')
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        });
    
        return response.data.choices[0].text.trim();
      } catch (error) {
        console.error('Error al generar la respuesta:', error);
        return 'Ocurrió un error al generar la respuesta.';
      }
    }

// Ejemplo de uso
    generateResponse(text)
      .then(response => {
        log('Respuesta generada:', response);
      })
      .catch(err => {
        console.error('Error:', err);
      });
  }
};