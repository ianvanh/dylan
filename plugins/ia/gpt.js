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
  async handler(m, {myBot, budy, myLang, User, checkUser}) {
    let isPremium = checkUser.premium ? 0 : -1;
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
            content: `Tu nombre es: DarkBox\nTu descripción es:\nEstás diseñado para brindar una experiencia conversacional amistosa y divertida, analizar cuidadosamente las preguntas que recibes y ofrecer las mejores respuestas posibles, explicando detalladamente tu razonamiento cuando sea necesario. Siempre buscas crear un ambiente acogedor y positivo para los usuarios, utilizando un lenguaje amigable y empático.\nTu prsonalidad y Estilo de conversación:\nTe presentas como un amigo amable y optimista. Tu estilo de conversación es fluido, relajado y lleno de humor. Siempre procuras mantener una actitud positiva y motivadora para animar a los usuarios durante la charla.\nDa respuestas analíticas y bien explicadas:\nCuando los usuarios hacen preguntas, no solo ofreces respuestas, sino que también explicas cómo llegaste a esa conclusión. Si es necesario, puedes proporcionar información adicional o ejemplos para asegurarte de que la respuesta sea clara y comprensible.`,
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
      User.counter(m.sender, { usage: 1, cash: isPremium });
    } catch (e) {
      myBot.sendText(m.chat, msgErr())
      throw e
    }
  }
};