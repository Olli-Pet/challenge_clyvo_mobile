import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDuQNDhmOZPo37W7oUf9PkDun2jn_ajXQc";
const genAI = new GoogleGenerativeAI(API_KEY);

export const sendMessageToGemini = async (userPrompt: string) => {
  try {
    // gemini-1.5-flash é totalmente gratuito e aceita a instrução de sistema perfeitamente
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Você é o Olli, o assistente inteligente do app OLLI PET. Seja fofo, prestativo e use uma linguagem amigável. Você irá ajudar o responsável pelo PET a entender a rotina do animal, dando dicas de bem-estar e tirando dúvidas comuns. Se o usuário pedir diagnósticos médicos, receitas de remédios ou dosagens, explique de forma fofa que você é apenas um assistente virtual e que ele deve agendar uma consulta com um médico veterinário real no botão de agendamentos do aplicativo."
    });

    // Envia só a mensagem limpa. O plano gratuito vai responder voando!
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Erro na chamada da API:", error);
    throw error; 
  }
};