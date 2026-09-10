import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ErroApi } from "@/services/api/clienteApi";
import { avisar, confirmar } from "@/services/avisar";
import {
  useAgenda,
  useConcluirConsulta,
  useConfirmarConsulta,
  useIniciarConsulta,
  useRegistrarFalta,
} from "@/hooks/useConsultas";
import { Consulta, dataDoEvento, DESCRICAO_STATUS } from "@/services/api/consultasApi";

const AZUL = "#66A6FA";

const COR_STATUS: Record<string, string> = {
  SOLICITADA: "#E8833A",
  CONFIRMADA: "#4C8DD6",
  EM_ATENDIMENTO: "#7B5CD6",
  CONCLUIDA: "#4CAF7D",
  CANCELADA: "#999",
  NAO_COMPARECEU: "#D64545",
};

export default function AgendaVet() {
  /** Consulta em processo de encerramento; abre o formulário do prontuário. */
  const [encerrando, setEncerrando] = useState<Consulta | null>(null);
  const [procedimento, setProcedimento] = useState("");
  const [local, setLocal] = useState("Clínica Olli Pet");
  const [observacoes, setObservacoes] = useState("");

  const { data: agenda = [], isPending: carregando, isError } = useAgenda();

  const { mutateAsync: confirmarConsulta } = useConfirmarConsulta();
  const { mutateAsync: iniciarConsulta } = useIniciarConsulta();
  const { mutateAsync: concluirConsulta, isPending: concluindo } = useConcluirConsulta();
  const { mutateAsync: marcarFalta } = useRegistrarFalta();

  const mensagemDeErro = (erro: unknown, padrao: string) =>
    erro instanceof ErroApi ? erro.message : padrao;

  /** Executa uma transição de status e avisa em caso de recusa da API. */
  const mudarStatus = async (acao: () => Promise<unknown>, contexto: string) => {
    try {
      await acao();
    } catch (erro) {
      console.error(contexto, erro);
      avisar(contexto, mensagemDeErro(erro, "A clínica recusou esta operação."));
    }
  };

  const abrirEncerramento = (consulta: Consulta) => {
    setEncerrando(consulta);
    setProcedimento(consulta.motivo);
    setLocal("Clínica Olli Pet");
    setObservacoes("");
  };

  const concluir = async () => {
    if (!encerrando) return;

    if (!procedimento.trim() || !local.trim()) {
      avisar("Atenção", "Informe o procedimento realizado e o local do atendimento.");
      return;
    }

    try {
      // Concluir grava o prontuário na mesma transação, por isso o
      // procedimento e o local são obrigatórios.
      await concluirConsulta({
        id: encerrando.id,
        dados: {
          procedimento: procedimento.trim(),
          localAtendimento: local.trim(),
          observacoes: observacoes.trim() || undefined,
        },
      });

      setEncerrando(null);
      avisar("Atendimento concluído", "O prontuário do paciente foi registrado.");
    } catch (erro) {
      console.error("Erro ao concluir a consulta:", erro);
      avisar("Não foi possível concluir", mensagemDeErro(erro, "Tente novamente."));
    }
  };

  if (carregando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={AZUL} />
        <Text style={estilos.textoCarregando}>Carregando a agenda...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={estilos.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AZUL} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={estilos.voltar} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={AZUL} />
            <Text style={estilos.voltarTexto}>Voltar</Text>
          </TouchableOpacity>

          <Text style={estilos.titulo}>Agenda da clínica</Text>
          <Text style={estilos.subtitulo}>
            Confirme, inicie e conclua os atendimentos do dia.
          </Text>

          {isError && (
            <Text style={estilos.aviso}>
              Não foi possível carregar a agenda. Verifique se a API está no ar.
            </Text>
          )}

          {!isError && agenda.length === 0 && (
            <Text style={estilos.vazio}>Nenhuma consulta na agenda.</Text>
          )}

          {agenda.map((consulta) => (
            <View key={consulta.id} style={estilos.cartao}>
              <View style={estilos.cartaoTopo}>
                <Text style={estilos.cartaoTitulo}>{consulta.motivo}</Text>
                <View
                  style={[
                    estilos.selo,
                    { backgroundColor: COR_STATUS[consulta.status] ?? "#999" },
                  ]}
                >
                  <Text style={estilos.seloTexto}>
                    {consulta.status.replace(/_/g, " ").toLowerCase()}
                  </Text>
                </View>
              </View>

              <Text style={estilos.cartaoLinha}>
                {consulta.nomePet} · tutor: {consulta.nomeResponsavel}
              </Text>
              <Text style={estilos.cartaoLinha}>
                {dataDoEvento(consulta.dataHora)} às {consulta.dataHora.slice(11, 16)}
              </Text>
              <Text style={estilos.cartaoDescricao}>
                {consulta.observacoes || DESCRICAO_STATUS[consulta.status]}
              </Text>

              {/* As ações seguem o fluxo da API; proximosStatus diz o que é permitido. */}
              <View style={estilos.acoes}>
                {consulta.proximosStatus?.includes("CONFIRMADA") && (
                  <TouchableOpacity
                    style={[estilos.acao, { backgroundColor: AZUL }]}
                    onPress={() =>
                      mudarStatus(
                        () => confirmarConsulta(consulta.id),
                        "Não foi possível confirmar"
                      )
                    }
                  >
                    <Text style={estilos.acaoTexto}>Confirmar</Text>
                  </TouchableOpacity>
                )}

                {consulta.proximosStatus?.includes("EM_ATENDIMENTO") && (
                  <TouchableOpacity
                    style={[estilos.acao, { backgroundColor: "#7B5CD6" }]}
                    onPress={() =>
                      mudarStatus(
                        () => iniciarConsulta(consulta.id),
                        "Não foi possível iniciar"
                      )
                    }
                  >
                    <Text style={estilos.acaoTexto}>Iniciar</Text>
                  </TouchableOpacity>
                )}

                {consulta.proximosStatus?.includes("CONCLUIDA") && (
                  <TouchableOpacity
                    style={[estilos.acao, { backgroundColor: "#4CAF7D" }]}
                    onPress={() => abrirEncerramento(consulta)}
                  >
                    <Text style={estilos.acaoTexto}>Concluir</Text>
                  </TouchableOpacity>
                )}

                {consulta.proximosStatus?.includes("NAO_COMPARECEU") && (
                  <TouchableOpacity
                    style={[estilos.acao, estilos.acaoSecundaria]}
                    onPress={() =>
                      confirmar(
                        "Registrar falta",
                        `${consulta.nomePet} não compareceu à consulta?`,
                        () =>
                          mudarStatus(
                            () => marcarFalta(consulta.id),
                            "Não foi possível registrar a falta"
                          ),
                        "Registrar"
                      )
                    }
                  >
                    <Text style={estilos.acaoSecundariaTexto}>Faltou</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Formulário de encerramento: vira o prontuário do paciente. */}
              {encerrando?.id === consulta.id && (
                <View style={estilos.formulario}>
                  <Text style={estilos.rotulo}>Procedimento realizado</Text>
                  <TextInput
                    style={estilos.campo}
                    value={procedimento}
                    onChangeText={setProcedimento}
                    placeholder="Ex.: consulta clínica e aplicação de vacina"
                    placeholderTextColor="#999"
                    maxLength={255}
                  />

                  <Text style={estilos.rotulo}>Local do atendimento</Text>
                  <TextInput
                    style={estilos.campo}
                    value={local}
                    onChangeText={setLocal}
                    maxLength={120}
                  />

                  <Text style={estilos.rotulo}>Observações clínicas</Text>
                  <TextInput
                    style={[estilos.campo, estilos.campoLongo]}
                    value={observacoes}
                    onChangeText={setObservacoes}
                    placeholder="Evolução, prescrições e recomendações ao tutor"
                    placeholderTextColor="#999"
                    multiline
                    maxLength={500}
                  />

                  <View style={estilos.acoes}>
                    <TouchableOpacity
                      style={[estilos.acao, estilos.acaoSecundaria]}
                      onPress={() => setEncerrando(null)}
                    >
                      <Text style={estilos.acaoSecundariaTexto}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[estilos.acao, { backgroundColor: "#4CAF7D" }]}
                      onPress={concluir}
                      disabled={concluindo}
                    >
                      {concluindo ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={estilos.acaoTexto}>Salvar prontuário</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  centro: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  textoCarregando: { marginTop: 10, color: "#666" },
  conteudo: { padding: 20, paddingTop: 50, paddingBottom: 60 },
  voltar: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  voltarTexto: { fontSize: 15, fontWeight: "600", color: AZUL },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#222", marginTop: 8 },
  subtitulo: { fontSize: 14, color: "#666", marginTop: 4, marginBottom: 20 },
  aviso: { fontSize: 13, color: "#8A6A10", fontStyle: "italic", marginBottom: 12 },
  vazio: { textAlign: "center", color: "#999", marginTop: 30, fontStyle: "italic" },
  cartao: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  cartaoTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  cartaoTitulo: { flex: 1, fontSize: 15, fontWeight: "bold", color: "#222" },
  selo: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  seloTexto: { fontSize: 10, color: "#FFF", fontWeight: "700", textTransform: "capitalize" },
  cartaoLinha: { fontSize: 13, color: "#555", marginTop: 2 },
  cartaoDescricao: { fontSize: 12, color: "#777", marginTop: 8, lineHeight: 17 },
  acoes: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  acao: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  acaoTexto: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  acaoSecundaria: { backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#DDD" },
  acaoSecundariaTexto: { color: "#666", fontSize: 13, fontWeight: "600" },
  formulario: { marginTop: 16, borderTopWidth: 1, borderTopColor: "#EEE", paddingTop: 14 },
  rotulo: { fontSize: 13, fontWeight: "600", color: "#444", marginTop: 10, marginBottom: 6 },
  campo: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#222",
  },
  campoLongo: { minHeight: 70, textAlignVertical: "top" },
});
