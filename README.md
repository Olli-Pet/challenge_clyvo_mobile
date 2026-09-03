# 🐾 OLLI PET — Cuidado Inteligente e Integrado

> Aplicativo mobile do desafio **Clyvo**, focado em medicina veterinária preventiva, gestão da rotina do pet e triagem clínica assistida.

**Vídeo de apresentação:** _(inserir link do YouTube antes da entrega)_

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
  cadastrovet.tsx       Cadastro de veterinário
  Home.tsx              Home do tutor
  homevet.tsx           Painel clínico do veterinário
  AddPet.tsx            Cadastro de pet
  PetProfile.tsx        Perfil do pet
  HistoricoPet.tsx      Histórico e prontuário
  Triagem.tsx           Triagem clínica (fluxo + histórico)
  calendariopet.tsx     Agenda de compromissos
  chatia.tsx            Assistente virtual

components/             Componentes reutilizáveis e modais
contexts/
  AuthContext.tsx       Estado de autenticação compartilhado
hooks/                  Lógica de dados isolada da UI (TanStack Query)
  usePets.ts            useQuery/useMutation dos pets
  useTriagem.ts         useQuery/useMutation da triagem
services/
  firebaseConfig.ts     Inicialização do Firebase
  sessao.ts             Perfil e sessão do usuário
  avisar.ts             Alertas compatíveis com web e mobile
  api/
    clienteApi.ts       Cliente HTTP (injeta o token, trata erros)
    petsApi.ts          Endpoints de pets
    triagemApi.ts       Endpoints de triagem
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

Ambas usam dados reais da API — nada mockado.

| Operação | Pets | Triagem |
|---|---|---|
| **Create** | `POST /pets` — tela AddPet | `POST /triagem` — questionário |
| **Read** | `GET /pets/meus`, `GET /pets` | `GET /triagem/minhas`, `/protocolos/{id}` |
| **Update** | `PUT /pets/{id}` — editar bio, prontuário | `PUT /triagem/{id}` — refazer avaliação |
| **Delete** | `DELETE /pets/{id}` — gerenciar pets | `DELETE /triagem/{id}` — histórico |

Toda mutação invalida o cache do TanStack Query, então **a interface se atualiza sozinha** — sem recarregar a tela ou reiniciar o app.

---

## 🔐 Autenticação

- **Firebase Authentication** com e-mail e senha (serviço externo real)
- **Persistência de sessão** via AsyncStorage: o usuário não reautentica ao reabrir o app
- **Proteção de rotas** no `_layout.tsx`: quem não está autenticado é enviado ao login, inclusive ao digitar a URL de uma tela interna
- **Logout** disponível nos modais de perfil, com bloqueio imediato das telas protegidas
- Dois perfis: **Responsável (tutor)** e **Médico Veterinário**, cada um com sua home

---

## 🛠️ Tecnologias

**Mobile:** React Native · Expo · TypeScript · expo-router · TanStack Query · Firebase (Auth + Firestore)

**Backend:** Java 21 · Spring Boot · Spring Security (OAuth2 Resource Server) · Spring Data JPA · Flyway · H2 · Swagger

---

## ▶️ Como executar

### 1. Backend (obrigatório)

O projeto exige **Java 21**. Se o seu `JAVA_HOME` apontar para outra versão, informe-o na execução:

```bash
cd challenge_clyvo_java-master
JAVA_HOME="/caminho/para/jdk-21" ./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080` (Swagger em `/swagger-ui.html`).

> O banco é **H2 em memória**: ao reiniciar, os dados voltam ao estado inicial das migrations.

### 2. Aplicativo

```bash
npm install
npx expo start
```

O endereço da API fica em [`services/api/clienteApi.ts`](services/api/clienteApi.ts) — ajuste conforme o ambiente:

| Ambiente | URL |
|---|---|
| Web / simulador iOS | `http://localhost:8080` |
| Emulador Android | `http://10.0.2.2:8080` |
| Celular físico (Expo Go) | `http://SEU_IP_NA_REDE:8080` |

### 3. Firestore

As regras de segurança estão em [`firestore.rules`](firestore.rules) e precisam estar publicadas no console do Firebase para o cadastro e o login funcionarem.

### Contas de demonstração

Criadas pela migration do Flyway. Senha de todas: `123456`.

| Perfil | E-mail |
|---|---|
| Tutora | `maria.silva@email.com` |
| Tutor | `joao.pereira@email.com` |
| Veterinária | `camila.duarte@ollipet.com` |
| Veterinário | `rafael.nunes@ollipet.com` |

> Essas contas existem no banco da API. Para entrar pelo app, crie uma conta pela tela de cadastro — ela é vinculada à clínica automaticamente no primeiro acesso.

---

## 👥 Equipe

**Olli Pet**

- Andre Rosa Colombo — RM563112
- Gabriely Bonfim Silva — RM566242
- Henrique Rodrigues Vespasiano — RM562917
- Mirelly Sousa Alves — RM566299
- Ruan Luca Feliciano — RM562218
