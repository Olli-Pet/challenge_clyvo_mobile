# 🐾 OLLI PET — Cuidado Inteligente e Integrado

> Um ecossistema digital desenvolvido para o desafio **Clyvo**, focado em medicina veterinária preventiva, gestão de rotina e suporte assistencial inteligente para pets.

---

## 💡 A Proposta
O **OLLI PET** nasceu para solucionar um grande desafio do mercado pet atual: a falta de centralização no histórico de cuidados do animal e a lacuna de comunicação entre tutores e clínicas. 

Unindo uma interface altamente intuitiva no ambiente mobile com o poder da Inteligência Artificial, o aplicativo atua como o braço direito do tutor na organização do bem-estar animal, ao mesmo tempo em que fortalece a relevância e o retorno às consultas com Médicos Veterinários reais.

---

## ✨ Funcionalidades Principais

### 🔐 1. Acesso Multiperfil
O sistema ramifica a experiência logo na tela de entrada:
* **Ambiente do Responsável (Tutor):** Focado na gestão diária, visualização de insights e acompanhamento preventivo.
* **Ambiente do Med Vet:** Focado no acompanhamento clínico e direcionamento de lembretes médicos.

### 📋 2. Cadastro Adaptável de Pets
* Formulários inteligentes protegidos com `KeyboardAvoidingView` para evitar obstrução do teclado.
* Máscara automática para inserção padronizada da data de nascimento.
* Seletores rápidos de porte (Pequeno, Médio e Grande) e sexo.
* **Avatares Dinâmicos:** Reconhecimento automático da raça/termo digitado (como cães, cavalos ou ornitorrincos) alterando a imagem de exibição em tempo real.

### 🤖 3. Inteligência Artificial: Assistente OLLIA
Conectado à API do **GOpenIA** (GPT), o chat oferece um suporte preventivo de ponta:
* **Foco Ético e Seguro:** A IA atua estritamente tirando dúvidas comportamentais e de bem-estar. Caso identifique menções a sintomas ou pedidos de remédios, a assistente reforça que não substitui um profissional e direciona o tutor imediatamente para o agendamento clínico.
* Interface fluida com histórico rolável automático e indicadores visuais de carregamento.

### 📆 4. Calendário Pet de Via Dupla
Um gerenciador de compromissos persistente (`AsyncStorage`) com divisão visual por cores:
* 🟡 **Tags Amarelas:** Compromissos de rotina gerados pelo Responsável (banho, passeio, ração).
* 🔵 **Tags Azuis:** Compromissos e avisos clínicos emitidos pelo Médico Veterinário (consultas, vacinas pendentes, exames).

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** [React Native](https://reactnative.dev/) com [Expo (Router)](https://docs.expo.dev/router/introduction/)
* **Linguagem:** TypeScript
* **Inteligência Artificial:** Google Generative AI SDK (`gemini-1.5-flash`)
* **Persistência de Dados:** AsyncStorage
* **Ícones:** @expo/vector-icons (Ionicons & MaterialCommunityIcons)

---

## 👥 Equipe de Desenvolvimento

O projeto foi planejado, desenhado e codificado com muito carinho por:

* **Gabriely Bonfim**
* **Mirelly Sousa**
* **Andre Rosa**
* **Henrique Vespasiano**
* **Ruan Luca**

---

## 🚀 Como Executar o Projeto

1. Clone o repositório fechado:
   ```bash
   git clone <link-do-repositorio>

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
   npx expo start
   ```
## Agora é só selecionar o modo de visualização e aproveitar a experiência!

