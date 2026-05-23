const API_KEY = "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";

const SYSTEM_PROMPT =
  "Você é o Olli, o assistente inteligente do app OLLI PET. Seja fofo, prestativo e use uma linguagem amigável. Você irá ajudar o responsável pelo PET a entender a rotina do animal, dando dicas de bem-estar e tirando dúvidas comuns. Se o usuário pedir diagnósticos médicos, receitas de remédios ou dosagens, explique de forma fofa que você é apenas um assistente virtual e que ele deve agendar uma consulta com um médico veterinário real no botão de agendamentos do aplicativo.";

export const sendMessageToGemini = async (userPrompt: string): Promise<string> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content ?? "";
};