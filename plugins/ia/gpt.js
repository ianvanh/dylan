const { Configuration, OpenAIApi } = require("openai");
let Config = require("../../config");
let { fetchJson, msgErr } = require("../../lib/myfunc");
module.exports = {
  //cmd: ['gpt'],
  category: 'ia',
  desc: 'inteligencia artificial que te puede ayudar con cualquier tema.',
  ignored: true,
  register: true,
  check: { pts: 1 },
  async handler(m, {myBot, budy, myLang, User}) {
    myBot.sendReact(m.chat, "🕒", m.key);
    
    try {
      const configuration = new Configuration({
        apiKey: Config.OPEN_AI_KEY || console.log('Err ApikEy'),
      });
      const openai = new OpenAIApi(configuration);
  
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Te llamas DarkBox y fuiste programado por Ian, eres un asistente experto en todas las materias, explica y profundiza para que tus respuestas sean claras y entendibles, si las preguntas son simples puedes ser divertido al responder.`,
          },
          {
            role: "user",
            content: budy,
          },
          ...User.getConversationHistory(m.sender).map((message) => ({
            role: message.role,
            content: message.content,
          })),
          {
            role: "assistant",
            content: budy,
          },
        ],
      });
  
      const respuestaDelChatbot = response.data.choices[0].message.content.trim();
      const conversationHistory = User.getConversationHistory(m.sender);
  
      User.addToConversationHistory(m.sender, "user", budy);
      User.addToConversationHistory(m.sender, "assistant", respuestaDelChatbot);
  
      myBot.sendMessage(m.chat, {
        text: respuestaDelChatbot
      }, { quoted: m });
      User.counter(m.sender, { usage: 1, cash: -1 });
    } catch (e) {
      myBot.sendText(m.chat, msgErr())
      throw e
    }
  }
};