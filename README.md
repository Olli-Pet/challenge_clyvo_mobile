# 🐾 OLLI PET — Cuidado Inteligente e Integrado

> Aplicativo mobile do desafio **Clyvo**, focado em medicina veterinária preventiva, gestão da rotina do pet e triagem clínica assistida.

**Vídeo de apresentação:** _(link do YouTube)_

---

## 💡 O problema e a solução

Hoje o histórico de saúde de um pet vive espalhado: caderneta de vacinação em papel, receitas soltas, o que o tutor lembra da última consulta. Quando o animal adoece, o tutor não sabe se aquilo espera até segunda-feira ou é urgência — e a clínica recebe o caso sem contexto nenhum.

O **OLLI PET** ataca esses dois pontos:

1. **Centraliza o cadastro e o prontuário do pet** num só lugar, acessível ao tutor e à clínica.
2. **Classifica a urgência antes da consulta**, por meio de um questionário clínico fechado. A avaliação não é um simples somatório de respostas: o backend cruza o que foi respondido com a idade do animal, a situação da vacinação e atendimentos recentes. As **mesmas respostas** produzem classificações diferentes para pets diferentes.

O resultado orienta o tutor (emergência, urgente, pouco urgente ou orientação) e prioriza quem realmente precisa ser atendido primeiro.

> A triagem é ferramenta de **orientação, nunca de diagnóstico** — todo resultado carrega esse aviso.

---

## 🧱 Arquitetura

O projeto separa claramente interface, regra de negócio e acesso a dados:

```
app/                    Telas e rotas (expo-router)
  _layout.tsx           Providers + guard de rotas protegidas
  index.tsx             Login
  Cadastro.tsx          Cadastro de tutor
  cadastrovet.tsx       Primeiro acesso do veterinário
  Home.tsx              Home do tutor
  homevet.tsx           Painel clínico do veterinário
  Administracao.tsx     Gestão da equipe (perfil ADMIN)
  AddPet.tsx            Cadastro de pet
  PetProfile.tsx        Perfil do pet
  HistoricoPet.tsx      Histórico e prontuário
  Triagem.tsx           Triagem clínica (fluxo + histórico)
  Agendar.tsx           Agendamento de consulta (tutor)
  AgendaVet.tsx         Agenda e atendimento (veterinário)
  calendariopet.tsx     Agenda de compromissos
  chatia.tsx            Assistente virtual

components/             Componentes reutilizáveis e modais
contexts/
  AuthContext.tsx       Estado de autenticação compartilhado
hooks/                  Lógica de dados isolada da UI (TanStack Query)
  usePets.ts            useQuery/useMutation dos pets
  useTriagem.ts         useQuery/useMutation da triagem
  useConsultas.ts       Agendamento e fluxo de atendimento
  useAdmin.ts           Gestão da equipe clínica
services/
  firebaseConfig.ts     Inicialização do Firebase
  sessao.ts             Perfil e sessão do usuário
  avisar.ts             Alertas compatíveis com web e mobile
  api/
    clienteApi.ts       Cliente HTTP (injeta o token, trata erros)
    petsApi.ts          Endpoints de pets
    triagemApi.ts       Endpoints de triagem
    consultasApi.ts     Endpoints de consultas e veterinários
    adminApi.ts         Endpoints da administração
    autenticacaoApi.ts  Vínculo da conta Firebase com a clínica
```

**Nenhuma tela faz chamada HTTP direta.** As telas consomem hooks; os hooks chamam os serviços; os serviços falam com a API. O `clienteApi` é o único ponto que monta requisições.

---

## 🔌 Integração com a API

O app conversa com uma **API REST em Spring Boot** (projeto `challenge_clyvo_java`), consumida via HTTP com **TanStack Query**.

### Divisão de responsabilidades

| Responsabilidade | Onde vive | Por quê |
|---|---|---|
| Login, cadastro e sessão | Firebase Authentication | serviço de autenticação real, com persistência |
| Perfil do usuário | Cloud Firestore | dado simples, ligado à conta |
| Pets, prontuário e triagem | **API Java + H2/Flyway** | exigem regra de negócio que o cliente não deve aplicar |

O app **não faz um segundo login**: envia o ID token que o Firebase já emite, e a API o valida contra as chaves públicas do Google.

```ts
const token = await auth.currentUser.getIdToken();
// clienteApi.ts injeta isso em toda requisição
```

### Funcionalidades com CRUD completo

Todas usam dados reais da API — nada mockado.

| Operação | Pets | Triagem | Consultas |
|---|---|---|---|
| **Create** | `POST /pets` — tela AddPet | `POST /triagem` — questionário | `POST /consultas` — agendamento |
| **Read** | `GET /pets/meus`, `GET /pets` | `GET /triagem/minhas`, `/protocolos/{id}` | `GET /consultas/minhas`, `/agenda` |
| **Update** | `PUT /pets/{id}` — editar bio, prontuário | `PUT /triagem/{id}` — refazer avaliação | `PATCH /consultas/{id}/confirmar`, `/iniciar`, `/concluir` |
| **Delete** | `DELETE /pets/{id}` — gerenciar pets | `DELETE /triagem/{id}` — histórico | `PATCH /consultas/{id}/cancelar` |

Toda mutação invalida o cache do TanStack Query, então **a interface se atualiza sozinha** — sem recarregar a tela ou reiniciar o app.

---

## 🔐 Autenticação

- **Firebase Authentication** com e-mail e senha (serviço externo real)
- **Persistência de sessão** via AsyncStorage: o usuário não reautentica ao reabrir o app
- **Proteção de rotas** no `_layout.tsx`: quem não está autenticado é enviado ao login, inclusive ao digitar a URL de uma tela interna
- **Logout** disponível nos modais de perfil, com bloqueio imediato das telas protegidas
- Três perfis, cada um com sua home: **Responsável**, **Médico Veterinário** e **Administração**
- **O perfil vem da API, não do Firestore.** O documento do Firestore é escrito
  pelo próprio cadastro e diria "tutor" para todo mundo; quem sabe quem é quem é
  o cadastro da clínica
- **Cadastro de veterinário não é público**: só a administração cadastra a equipe.
  O profissional define a senha no primeiro acesso, e o app confere na API se
  aquele e-mail pertence mesmo à equipe antes de criar a conta

---

## 🛠️ Tecnologias

**Mobile:** React Native · Expo · TypeScript · expo-router · TanStack Query · Firebase (Auth + Firestore)

**Backend:** Java 21 · Spring Boot · Spring Security (OAuth2 Resource Server) · Spring Data JPA · Flyway · H2 · Swagger

---

## ▶️ Como executar

### 1. Backend (obrigatório)

O projeto exige **Java 21**. Se o seu `JAVA_HOME` apontar para outra versão, informe-o na execução:

Repositório: https://github.com/GabyBonfim/java-ollipet

```bash
git clone https://github.com/GabyBonfim/java-ollipet.git
cd java-ollipet
JAVA_HOME="/caminho/para/jdk-21" ./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080` (Swagger em `/swagger-ui.html`).

> O banco roda em arquivo (`data/`), então os dados sobrevivem ao reinício. Para
> começar do zero, apague essa pasta.

**Ou use a API publicada**, sem subir nada: `https://java-ollipet.onrender.com`
(hospedagem gratuita hiberna — a primeira chamada pode levar alguns minutos).

### 2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

| Variável | Para quê |
|---|---|
| `EXPO_PUBLIC_API_URL` | Endereço da API. Deixe vazio para o app descobrir sozinho |
| `EXPO_PUBLIC_FIREBASE_*` | Credenciais do projeto Firebase |

Sem `EXPO_PUBLIC_API_URL`, o app resolve o endereço por conta própria:
`localhost` no navegador, `10.0.2.2` no emulador Android e o IP do computador
de desenvolvimento no celular — o mesmo que o Expo usa para servir o bundle.

### 3. Aplicativo

```bash
npm install
npx expo start --clear
```

O `--clear` importa: variáveis de ambiente só entram no bundle na inicialização.

### 4. Firestore

As regras de segurança estão em [`firestore.rules`](firestore.rules) e precisam
estar publicadas no console do Firebase para o cadastro e o login funcionarem.

### Contas de demonstração

Existem no banco da API, criadas pela migration do Flyway. A senha `123456` vale
para o **Swagger e a API**; no aplicativo, quem guarda a senha é o Firebase.

| Perfil | E-mail |
|---|---|
| Administração | `admin@ollipet.com` | senha: Admin@123
| Veterinária | `camila.duarte@ollipet.com` |
| Veterinário | `rafael.nunes@ollipet.com` |

**Para entrar pelo app:**

- **Tutor** — crie uma conta pela tela de cadastro; ela é vinculada à clínica
  automaticamente.
- **Veterinário** — use "Primeiro acesso" com um dos e-mails acima e defina a
  senha. Quem não está na equipe não passa dessa tela.
- **Administração** — cadastre `admin@ollipet.com` pela tela de responsável. O
  app consulta a API, reconhece o perfil e leva à tela de gestão da equipe.

---

## 👥 Equipe

**Olli Pet**

- Andre Rosa Colombo — RM563112
- Gabriely Bonfim Silva — RM566242
- Henrique Rodrigues Vespasiano — RM562917
- Mirelly Sousa Alves — RM566299
- Ruan Luca Feliciano — RM562218
