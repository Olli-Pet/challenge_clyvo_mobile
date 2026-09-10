import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Header from "@/components/Header";
import { ErroApi } from "@/services/api/clienteApi";
import { avisar, confirmar } from "@/services/avisar";
import { useMeusPets } from "@/hooks/usePets";
import {
  useEnviarTriagem,
  useExcluirTriagem,
  useMinhasTriagens,
  useProtocolo,
  useQueixas,
  useRefazerTriagem,
} from "@/hooks/useTriagem";
import { Pet } from "@/services/api/petsApi";
import {
  perguntaVisivel,
  QueixaResumo,
  RespostaInformada,
  ResultadoTriagem,
  VISUAL_CLASSIFICACAO,
} from "@/services/api/triagemApi";

const AMARELO = "#FDCB5C";

type Etapa = "pet" | "queixa" | "perguntas" | "resultado" | "historico";

export default function Triagem() {
  const [etapa, setEtapa] = useState<Etapa>("pet");

  const [petEscolhido, setPetEscolhido] = useState<Pet | null>(null);
  const [queixaEscolhida, setQueixaEscolhida] = useState<QueixaResumo | null>(null);
  const [respostas, setRespostas] = useState<RespostaInformada[]>([]);
  const [resultado, setResultado] = useState<ResultadoTriagem | null>(null);

  const [idEmEdicao, setIdEmEdicao] = useState<number | null>(null);

  const { data: pets = [], isPending: carregandoPets } = useMeusPets();
  const { data: queixas = [], isPending: carregandoQueixas } = useQueixas(
    petEscolhido?.id ?? null
  );
  const { data: protocolo, isPending: carregandoProtocolo } = useProtocolo(
    queixaEscolhida?.id ?? null
  );
  const { data: historico = [], isPending: carregandoHistorico } = useMinhasTriagens();

  const { mutateAsync: enviar, isPending: enviando } = useEnviarTriagem();
  const { mutateAsync: refazer, isPending: refazendo } = useRefazerTriagem();
  const { mutateAsync: excluir } = useExcluirTriagem();

  const salvando = enviando || refazendo;

  const avisarErro = (erro: unknown, titulo: string) => {
    console.error(titulo, erro);
    avisar(titulo, erro instanceof ErroApi ? erro.message : "Algo deu errado. Tente novamente.");
  };

  const escolherPet = (pet: Pet) => {
    setPetEscolhido(pet);
    setQueixaEscolhida(null);
    setEtapa("queixa");
  };

  const escolherQueixa = (queixa: QueixaResumo) => {
    setQueixaEscolhida(queixa);
    setRespostas([]);
    setEtapa("perguntas");
  };

  const responder = (perguntaId: number, opcaoId: number) => {
    setRespostas((atuais) => {
      const novas = [...atuais.filter((r) => r.perguntaId !== perguntaId), { perguntaId, opcaoId }];

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

  const enviarRespostas = async () => {
    if (!petEscolhido || !protocolo) return;

    if (obrigatoriasPendentes.length > 0) {
      avisar(
        "Faltam respostas",
        obrigatoriasPendentes.length === 1
          ? "Responda a pergunta que falta para continuar."
          : `Responda as ${obrigatoriasPendentes.length} perguntas que faltam para continuar.`
      );
      return;
    }

    const idsVisiveis = new Set(perguntasVisiveis.map((p) => p.id));
    const dados = {
      petId: petEscolhido.id,
      queixaId: protocolo.queixaId,
      respostas: respostas.filter((r) => idsVisiveis.has(r.perguntaId)),
    };

    try {
      const avaliacao = idEmEdicao
        ? await refazer({ id: idEmEdicao, dados })
        : await enviar(dados);

      setResultado(avaliacao);
      setIdEmEdicao(null);
      setEtapa("resultado");
    } catch (erro) {
      avisarErro(erro, "Não foi possível concluir a triagem");
    }
  };

  const editarTriagem = (triagem: ResultadoTriagem) => {
    const pet = pets.find((p) => p.id === triagem.petId);

    if (!pet) {
      avisar("Atenção", "Não encontramos o pet desta triagem.");
      return;
    }

    const queixa = queixas.find((q) => q.nome === triagem.queixa);

    setPetEscolhido(pet);
    setIdEmEdicao(triagem.id);
    setRespostas([]);

    if (queixa) {
      setQueixaEscolhida(queixa);
      setEtapa("perguntas");
    } else {
      setQueixaEscolhida(null);
      setEtapa("queixa");
    }
  };

  const excluirTriagemDoHistorico = (triagem: ResultadoTriagem) => {
    confirmar(
      "Excluir triagem",
      `Remover a triagem de ${triagem.nomePet} (${triagem.queixa}) do histórico?`,
      async () => {
        try {
          await excluir(triagem.id);
        } catch (erro) {
          avisarErro(erro, "Não foi possível excluir a triagem");
        }
      },
      "Excluir"
    );
  };

  const recomecar = () => {
    setResultado(null);
    setQueixaEscolhida(null);
    setRespostas([]);
    setIdEmEdicao(null);
    setEtapa(pets.length === 1 ? "queixa" : "pet");
  };

  const carregando =
    (etapa === "pet" && carregandoPets) ||
    (etapa === "queixa" && carregandoQueixas) ||
    (etapa === "perguntas" && carregandoProtocolo);

  return (
    <SafeAreaView style={estilos.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AMARELO} />
      <Header />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.barraTopo}>
          <TouchableOpacity style={estilos.voltar} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={estilos.voltarTexto}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.abaHistorico}
            onPress={() => setEtapa(etapa === "historico" ? "pet" : "historico")}
          >
            <Ionicons
              name={etapa === "historico" ? "add-circle-outline" : "time-outline"}
              size={18}
              color="#8A6A10"
            />
            <Text style={estilos.abaHistoricoTexto}>
              {etapa === "historico" ? "Nova triagem" : "Histórico"}
            </Text>
          </TouchableOpacity>
        </View>

        {carregando && <ActivityIndicator size="large" color={AMARELO} style={estilos.espera} />}

        {!carregando && etapa === "pet" && (
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

        {!carregando && etapa === "queixa" && (
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

        {!carregando && etapa === "perguntas" && protocolo && (
          <>
            <Text style={estilos.titulo}>{protocolo.nome}</Text>
            <Text style={estilos.subtitulo}>{protocolo.descricao}</Text>

            {idEmEdicao !== null && (
              <View style={estilos.faixaEdicao}>
                <Ionicons name="create-outline" size={16} color="#8A6A10" />
                <Text style={estilos.faixaEdicaoTexto}>
                  Refazendo uma triagem já registrada. A classificação pode mudar.
                </Text>
              </View>
            )}

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
              style={[estilos.botao, salvando && { opacity: 0.7 }]}
              onPress={enviarRespostas}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={estilos.botaoTexto}>
                  {idEmEdicao !== null ? "Reavaliar" : "Ver resultado"}
                </Text>
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

        {etapa === "historico" && (
          <>
            <Text style={estilos.titulo}>Minhas triagens</Text>
            <Text style={estilos.subtitulo}>
              Refaça uma avaliação se o quadro mudou, ou remova o que não precisa mais.
            </Text>

            {carregandoHistorico && <ActivityIndicator color={AMARELO} style={estilos.espera} />}

            {!carregandoHistorico &&
              historico.map((triagem) => (
                <View key={triagem.id} style={estilos.cartaoHistorico}>
                  <View style={estilos.linhaHistorico}>
                    <View
                      style={[
                        estilos.selo,
                        { backgroundColor: VISUAL_CLASSIFICACAO[triagem.classificacao].cor },
                      ]}
                    >
                      <Text style={estilos.seloTexto}>
                        {VISUAL_CLASSIFICACAO[triagem.classificacao].rotulo}
                      </Text>
                    </View>

                    <View style={estilos.acoesHistorico}>
                      <TouchableOpacity
                        onPress={() => editarTriagem(triagem)}
                        style={estilos.iconeAcao}
                      >
                        <Ionicons name="create-outline" size={20} color="#444" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => excluirTriagemDoHistorico(triagem)}
                        style={estilos.iconeAcao}
                      >
                        <Ionicons name="trash-outline" size={20} color="#D64545" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={estilos.cartaoTitulo}>{triagem.nomePet}</Text>
                  <Text style={estilos.cartaoSub}>{triagem.queixa}</Text>

                  <TouchableOpacity
                    style={estilos.verDetalhe}
                    onPress={() => {
                      setResultado(triagem);
                      setEtapa("resultado");
                    }}
                  >
                    <Text style={estilos.verDetalheTexto}>Ver orientações</Text>
                    <Ionicons name="chevron-forward" size={16} color="#8A6A10" />
                  </TouchableOpacity>
                </View>
              ))}

            {!carregandoHistorico && historico.length === 0 && (
              <Text style={estilos.vazio}>Você ainda não fez nenhuma triagem.</Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  conteudo: { padding: 20, paddingBottom: 60 },
  espera: { marginVertical: 40 },
  barraTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  voltar: { flexDirection: "row", alignItems: "center" },
  voltarTexto: { fontSize: 15, fontWeight: "600" },
  abaHistorico: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF6DF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  abaHistoricoTexto: { fontSize: 13, color: "#8A6A10", fontWeight: "600" },
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
  faixaEdicao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF6DF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  faixaEdicaoTexto: { flex: 1, fontSize: 12, color: "#8A6A10" },
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
  cartaoHistorico: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  linhaHistorico: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selo: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  seloTexto: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
  acoesHistorico: { flexDirection: "row" },
  iconeAcao: { padding: 6, marginLeft: 4 },
  verDetalhe: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  verDetalheTexto: { fontSize: 13, color: "#8A6A10", fontWeight: "600" },
});
