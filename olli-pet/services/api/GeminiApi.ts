import { GoogleGenerativeAI } from "@google/generative-ai";

// Tente usar variáveis de ambiente (.env) para sua chave no futuro!
const API_KEY = "SUA_API_KEY_AQUI";
const genAI = new GoogleGenerativeAI(API_KEY);

export const sendMessageToGemini = async (userPrompt: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const context = "Você é o Olli, o assistente inteligente do app OLLI PET. Seja fofo e prestativo. Você irá ajudar o responsavel pelo PET a entender a rotina do mesmo, bem como aconselhar em casos de problemas e duvidas. Armazene o que te falarem de acordo com o login do user e caso hajam duvidas o user solicite um diagnostico ou até mesmo que remédio dar ao PET, informe que o ideal é agendar uma consulta com um med vet e encaminhe para o agendamento.";
    const fullPrompt = `${context}\n\nUsuário: ${userPrompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro na chamada da API:", error);
    throw error; // Repassa o erro para o componente tratar (ex: mostrar um alerta)
  }
};