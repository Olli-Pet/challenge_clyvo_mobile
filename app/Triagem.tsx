import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Header from "@/components/Header";
import { ErroApi } from "@/services/api/clienteApi";
import { listarMeusPets, Pet } from "@/services/api/petsApi";
import {
  buscarProtocolo,
  buscarQueixas,
  enviarTriagem,
  perguntaVisivel,
  ProtocoloTriagem,
  QueixaResumo,
  RespostaInformada,
  ResultadoTriagem,
  VISUAL_CLASSIFICACAO,
} from "@/services/api/triagemApi";

const AMARELO = "#FDCB5C";

/** Etapas do fluxo, na ordem em que o tutor as percorre. */
type Etapa = "pet" | "queixa" | "perguntas" | "resultado";

export default function Triagem() {
  const [etapa, setEtapa] = useState<Etapa>("pet");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [pets, setPets] = useState<Pet[]>([]);
  const [petEscolhido, setPetEscolhido] = useState<Pet | null>(null);

  const [queixas, setQueixas] = useState<QueixaResumo[]>([]);
  const [protocolo, setProtocolo] = useState<ProtocoloTriagem | null>(null);
  const [respostas, setRespostas] = useState<RespostaInformada[]>([]);
  const [resultado, setResultado] = useState<ResultadoTriagem | null>(null);

  /** Mostra o erro da API já em linguagem de tela. */
  const avisarErro = (erro: unknown, tituloPadrao: string) => {
    console.error(tituloPadrao, erro);
    Alert.alert(
      tituloPadrao,
      erro instanceof ErroApi ? erro.message : "Algo deu errado. Tente novamente."
    );
  };

  const escolherPet = async (pet: Pet) => {
    setPetEscolhido(pet);
    setCarregando(true);
    try {
      // As queixas dependem da espécie, por isso vêm por pet.
      setQueixas(await buscarQueixas(pet.id));
      setEtapa("queixa");
    } catch (erro) {
      avisarErro(erro, "Não foi possível carregar as queixas");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const meusPets = await listarMeusPets();
        setPets(meusPets);

        // Com um pet só, a escolha é óbvia: pula direto para a queixa.
        if (meusPets.length === 1) {
          await escolherPet(meusPets[0]);
        }
      } catch (erro) {
        avisarErro(erro, "Não foi possível carregar seus pets");
      } finally {
        setCarregando(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const escolherQueixa = async (queixa: QueixaResumo) => {
    setCarregando(true);
    try {
      setProtocolo(await buscarProtocolo(queixa.id));
      setRespostas([]);
      setEtapa("perguntas");
    } catch (erro) {
      avisarErro(erro, "Não foi possível carregar o questionário");
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Registra a resposta. Ao trocar a resposta de uma pergunta, as respostas das
   * perguntas que dependiam da opção anterior são descartadas — senão o envio
   * levaria respostas de perguntas que deixaram de ser exibidas.
   */
  const responder = (perguntaId: number, opcaoId: number) => {
    setRespostas((atuais) => {
      const semEsta = atuais.filter((r) => r.perguntaId !== perguntaId);
      const novas = [...semEsta, { perguntaId, opcaoId }];

      if (!protocolo) return novas;

      return novas.filter((r) => {
        const pergunta = protocolo.perguntas.find((p) => p.id === r.perguntaId);
        return pergunta ? perguntaVisivel(pergunta, novas) : true;
      });
    });
  };

  const perguntasVisiveis = protocolo
    ? protocolo.perguntas
        .filter((p) => perguntaVisivel(p, respostas))
        .sort((a, b) => a.ordem - b.ordem)
    : [];

  const obrigatoriasPendentes = perguntasVisiveis.filter(
    (p) => p.obrigatoria && !respostas.some((r) => r.perguntaId === p.id)
  );

  const enviar = async () => {
    if (!petEscolhido || !protocolo) return;

    if (obrigatoriasPendentes.length > 0) {
      Alert.alert(
        "Faltam respostas",
        obrigatoriasPendentes.length === 1
          ? "Responda a pergunta que falta para continuar."
          : `Responda as ${obrigatoriasPendentes.length} perguntas que faltam para continuar.`
      );
      return;
    }

    setEnviando(true);
    try {
      // Envia só as respostas das perguntas efetivamente exibidas.
      const idsVisiveis = new Set(perguntasVisiveis.map((p) => p.id));
      setResultado(
        await enviarTriagem({
          petId: petEscolhido.id,
          queixaId: protocolo.queixaId,
          respostas: respostas.filter((r) => idsVisiveis.has(r.perguntaId)),
        })
      );
      setEtapa("resultado");
    } catch (erro) {
      avisarErro(erro, "Não foi possível concluir a triagem");
    } finally {
      setEnviando(false);
    }
  };

  const recomecar = () => {
    setResultado(null);
    setProtocolo(null);
    setRespostas([]);
    setEtapa(pets.length === 1 ? "queixa" : "pet");
  };

  if (carregando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={AMARELO} />
        <Text style={estilos.textoCarregando}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={estilos.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AMARELO} />
      <Header />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={estilos.voltar} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
          <Text style={estilos.voltarTexto}>Voltar</Text>
        </TouchableOpacity>

        {etapa === "pet" && (
          <>
            <Text style={estilos.titulo}>Triagem</Text>
            <Text style={estilos.subtitulo}>Para qual pet é a triagem?</Text>

            {pets.map((pet) => (
              <TouchableOpacity key={pet.id} style={estilos.cartao} onPress={() => escolherPet(pet)}>
                <View style={estilos.avatar}>
                  <Ionicons name="paw" size={22} color="#FFF" />
                </View>
                <View style={estilos.cartaoTexto}>
                  <Text style={estilos.cartaoTitulo}>{pet.nome}</Text>
                  <Text style={estilos.cartaoSub}>
                    {pet.raca} · {pet.especie === "CAO" ? "Cão" : "Gato"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={AMARELO} />
              </TouchableOpacity>
            ))}

            {pets.length === 0 && (
              <Text style={estilos.vazio}>Cadastre um pet antes de fazer a triagem.</Text>
            )}
          </>
        )}

        {etapa === "queixa" && (
          <>
            <Text style={estilos.titulo}>O que está acontecendo?</Text>
            <Text style={estilos.subtitulo}>
              Escolha o sintoma principal de {petEscolhido?.nome}.
            </Text>

            {queixas.map((queixa) => (
              <TouchableOpacity
                key={queixa.id}
                style={estilos.cartao}
                onPress={() => escolherQueixa(queixa)}
              >
                <View style={estilos.cartaoTexto}>
                  <Text style={estilos.cartaoTitulo}>{queixa.nome}</Text>
                  <Text style={estilos.cartaoSub}>{queixa.descricao}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={AMARELO} />
              </TouchableOpacity>
            ))}

            {queixas.length === 0 && (
              <Text style={estilos.vazio}>Nenhuma queixa disponível para este pet.</Text>
            )}
          </>
        )}

        {etapa === "perguntas" && protocolo && (
          <>
            <Text style={estilos.titulo}>{protocolo.nome}</Text>
            <Text style={estilos.subtitulo}>{protocolo.descricao}</Text>

            {perguntasVisiveis.map((pergunta) => {
              const respondida = respostas.find((r) => r.perguntaId === pergunta.id);

              return (
                <View key={pergunta.id} style={estilos.blocoPergunta}>
                  <Text style={estilos.pergunta}>
                    {pergunta.texto}
                    {pergunta.obrigatoria && <Text style={estilos.asterisco}> *</Text>}
                  </Text>

                  {pergunta.opcoes
                    .slice()
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((opcao) => {
                      const escolhida = respondida?.opcaoId === opcao.id;
                      return (
                        <TouchableOpacity
                          key={opcao.id}
                          style={[estilos.opcao, escolhida && estilos.opcaoEscolhida]}
                          onPress={() => responder(pergunta.id, opcao.id)}
                        >
                          <Ionicons
                            name={escolhida ? "radio-button-on" : "radio-button-off"}
                            size={20}
                            color={escolhida ? "#8A6A10" : "#999"}
                          />
                          <Text
                            style={[estilos.opcaoTexto, escolhida && estilos.opcaoTextoEscolhido]}
                          >
                            {opcao.texto}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              );
            })}

            <TouchableOpacity
              style={[estilos.botao, enviando && { opacity: 0.7 }]}
              onPress={enviar}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={estilos.botaoTexto}>Ver resultado</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {etapa === "resultado" && resultado && (
          <>
            <View
              style={[
                estilos.faixaResultado,
                { backgroundColor: VISUAL_CLASSIFICACAO[resultado.classificacao].cor },
              ]}
            >
              <Ionicons
                name={VISUAL_CLASSIFICACAO[resultado.classificacao].icone as any}
                size={40}
                color="#FFF"
              />
              <Text style={estilos.faixaTitulo}>
                {VISUAL_CLASSIFICACAO[resultado.classificacao].rotulo}
              </Text>
              {resultado.prazoRecomendado && (
                <Text style={estilos.faixaPrazo}>
                  Procure atendimento em: {resultado.prazoRecomendado}
                </Text>
              )}
            </View>

            <Text style={estilos.resultadoPet}>
              {resultado.nomePet} · {resultado.queixa}
            </Text>

            {resultado.motivoSugerido && (
              <View style={estilos.blocoMotivo}>
                <Text style={estilos.motivo}>{resultado.motivoSugerido}</Text>
              </View>
            )}

            {resultado.orientacoes.length > 0 && (
              <View style={estilos.blocoLista}>
                <Text style={estilos.listaTitulo}>O que fazer agora</Text>
                {resultado.orientacoes.map((orientacao, i) => (
                  <View key={i} style={estilos.itemLista}>
                    <Ionicons name="ellipse" size={7} color={AMARELO} style={{ marginTop: 6 }} />
                    <Text style={estilos.itemTexto}>{orientacao}</Text>
                  </View>
                ))}
              </View>
            )}

            {resultado.observacoesClinicas.length > 0 && (
              <View style={estilos.blocoLista}>
                <Text style={estilos.listaTitulo}>O que pesou nesta avaliação</Text>
                {resultado.observacoesClinicas.map((observacao, i) => (
                  <View key={i} style={estilos.itemLista}>
                    <Ionicons
                      name="information-circle"
                      size={14}
                      color="#66A6FA"
                      style={{ marginTop: 2 }}
                    />
                    <Text style={estilos.itemTexto}>{observacao}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={estilos.aviso}>
              <Ionicons name="alert-circle-outline" size={18} color="#8A6A10" />
              <Text style={estilos.avisoTexto}>{resultado.aviso}</Text>
            </View>

            <TouchableOpacity style={estilos.botao} onPress={recomecar}>
              <Text style={estilos.botaoTexto}>Fazer outra triagem</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={estilos.botaoSecundario}
              onPress={() => router.replace("/Home")}
            >
              <Text style={estilos.botaoSecundarioTexto}>Voltar ao início</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  centro: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  textoCarregando: { marginTop: 10, color: "#666" },
  conteudo: { padding: 20, paddingBottom: 60 },
  voltar: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  voltarTexto: { fontSize: 15, fontWeight: "600" },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#222", marginTop: 8 },
  subtitulo: { fontSize: 14, color: "#666", marginTop: 4, marginBottom: 20 },
  cartao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AMARELO,
    justifyContent: "center",
    alignItems: "center",
  },
  cartaoTexto: { flex: 1, marginLeft: 12 },
  cartaoTitulo: { fontSize: 16, fontWeight: "bold", color: "#222" },
  cartaoSub: { fontSize: 13, color: "#666", marginTop: 2 },
  vazio: { textAlign: "center", color: "#999", marginTop: 40, fontStyle: "italic" },
  blocoPergunta: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  pergunta: { fontSize: 15, fontWeight: "600", color: "#222", marginBottom: 12 },
  asterisco: { color: "#D64545" },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#FAFAFA",
  },
  opcaoEscolhida: { backgroundColor: "#FFF6DF", borderWidth: 1.5, borderColor: AMARELO },
  opcaoTexto: { flex: 1, marginLeft: 10, fontSize: 14, color: "#444" },
  opcaoTextoEscolhido: { color: "#8A6A10", fontWeight: "600" },
  botao: {
    backgroundColor: AMARELO,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  botaoTexto: { fontSize: 16, fontWeight: "bold", color: "#000" },
  botaoSecundario: { height: 46, justifyContent: "center", alignItems: "center", marginTop: 8 },
  botaoSecundarioTexto: { fontSize: 14, color: "#666", textDecorationLine: "underline" },
  faixaResultado: { borderRadius: 20, padding: 24, alignItems: "center", marginTop: 8 },
  faixaTitulo: { fontSize: 22, fontWeight: "bold", color: "#FFF", marginTop: 8 },
  faixaPrazo: { fontSize: 14, color: "#FFF", marginTop: 4, opacity: 0.95 },
  resultadoPet: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    textAlign: "center",
    marginTop: 16,
  },
  blocoMotivo: { backgroundColor: "#FFF6DF", borderRadius: 14, padding: 14, marginTop: 16 },
  motivo: { fontSize: 14, color: "#8A6A10", lineHeight: 20 },
  blocoLista: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginTop: 14 },
  listaTitulo: { fontSize: 15, fontWeight: "bold", color: "#222", marginBottom: 10 },
  itemLista: { flexDirection: "row", gap: 10, marginBottom: 8 },
  itemTexto: { flex: 1, fontSize: 14, color: "#555", lineHeight: 20 },
  aviso: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FFF6DF",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  avisoTexto: { flex: 1, fontSize: 12, color: "#8A6A10", lineHeight: 18 },
});
