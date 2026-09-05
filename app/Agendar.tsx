import React, { useState } from "react";
import {
  SafeAreaView,
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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Header from "@/components/Header";
import { ErroApi } from "@/services/api/clienteApi";
import { avisar, confirmar } from "@/services/avisar";
import { useMeusPets } from "@/hooks/usePets";
import {
  useCancelarConsulta,
  useMinhasConsultas,
  useSolicitarConsulta,
  useVeterinarios,
} from "@/hooks/useConsultas";
import {
  Consulta,
  dataDoEvento,
  DESCRICAO_STATUS,
} from "@/services/api/consultasApi";

const AMARELO = "#FDCB5C";

/** Horários que a clínica atende (08:00 às 18:00, consultas de 30 min). */
const HORARIOS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
];

/** Cor de cada status na lista de consultas. */
const COR_STATUS: Record<string, string> = {
  SOLICITADA: "#E8833A",
  CONFIRMADA: "#4C8DD6",
  EM_ATENDIMENTO: "#7B5CD6",
  CONCLUIDA: "#4CAF7D",
  CANCELADA: "#999",
  NAO_COMPARECEU: "#D64545",
};

/** dd/mm/aaaa + hh:mm -> ISO local que a API espera. */
function montarDataHora(dataBr: string, hora: string): string | null {
  const partes = dataBr.split("/");
  if (partes.length !== 3) return null;

  const [dia, mes, ano] = partes;
  if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return null;

  const iso = `${ano}-${mes}-${dia}T${hora}:00`;
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return null;

  // Rejeita datas que só existem por overflow, como 31/02.
  if (data.getDate() !== Number(dia) || data.getMonth() + 1 !== Number(mes)) {
    return null;
  }

  return iso;
}

/** Máscara dd/mm/aaaa enquanto o tutor digita. */
function formatarData(texto: string): string {
  const numeros = texto.replace(/\D/g, "").slice(0, 8);

  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

export default function Agendar() {
  const [petId, setPetId] = useState<number | null>(null);
  const [veterinarioId, setVeterinarioId] = useState<number | null>(null);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");

  const { data: pets = [], isPending: carregandoPets } = useMeusPets();
  const { data: veterinarios = [], isPending: carregandoVets } = useVeterinarios();
  const { data: consultas = [], isPending: carregandoConsultas } = useMinhasConsultas();

  const { mutateAsync: solicitar, isPending: enviando } = useSolicitarConsulta();
  const { mutateAsync: cancelar } = useCancelarConsulta();

  const mensagemDeErro = (erro: unknown, padrao: string) =>
    erro instanceof ErroApi ? erro.message : padrao;

  const agendar = async () => {
    if (!petId || !veterinarioId || !data || !hora || !motivo.trim()) {
      avisar("Atenção", "Preencha todos os campos para agendar.");
      return;
    }

    const dataHora = montarDataHora(data, hora);
    if (!dataHora) {
      avisar("Atenção", "Informe uma data válida no formato dd/mm/aaaa.");
      return;
    }

    try {
      await solicitar({ petId, veterinarioId, dataHora, motivo: motivo.trim() });

      // Limpa o formulário: a consulta já aparece na lista abaixo.
      setData("");
      setHora("");
      setMotivo("");

      avisar(
        "Consulta solicitada!",
        "A clínica vai confirmar o horário em breve. Acompanhe abaixo."
      );
    } catch (erro) {
      console.error("Erro ao agendar consulta:", erro);
      avisar(
        "Não foi possível agendar",
        mensagemDeErro(erro, "Verifique a data e tente novamente.")
      );
    }
  };

  const cancelarConsultaSolicitada = (consulta: Consulta) => {
    confirmar(
      "Cancelar consulta",
      `Cancelar a consulta de ${consulta.nomePet} em ${dataDoEvento(consulta.dataHora)}?`,
      async () => {
        try {
          await cancelar({ id: consulta.id, motivo: "Cancelado pelo responsável" });
          avisar("Pronto", "A consulta foi cancelada.");
        } catch (erro) {
          console.error("Erro ao cancelar consulta:", erro);
          avisar(
            "Não foi possível cancelar",
            mensagemDeErro(erro, "O cancelamento exige 6 horas de antecedência.")
          );
        }
      },
      "Cancelar consulta"
    );
  };

  /** Só faz sentido cancelar o que ainda não aconteceu. */
  const podeCancelar = (consulta: Consulta) =>
    consulta.status === "SOLICITADA" || consulta.status === "CONFIRMADA";

  if (carregandoPets || carregandoVets) {
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
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={estilos.voltarTexto}>Voltar</Text>
          </TouchableOpacity>

          <Text style={estilos.titulo}>Agendar consulta</Text>

          {pets.length === 0 ? (
            <Text style={estilos.vazio}>
              Cadastre um pet antes de agendar uma consulta.
            </Text>
          ) : (
            <>
              <Text style={estilos.rotulo}>Para qual pet?</Text>
              <View style={estilos.listaOpcoes}>
                {pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[estilos.chip, petId === pet.id && estilos.chipAtivo]}
                    onPress={() => setPetId(pet.id)}
                  >
                    <Text
                      style={[estilos.chipTexto, petId === pet.id && estilos.chipTextoAtivo]}
                    >
                      {pet.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={estilos.rotulo}>Com qual veterinário?</Text>
              {veterinarios.length === 0 ? (
                <Text style={estilos.aviso}>Nenhum veterinário disponível no momento.</Text>
              ) : (
                <View style={estilos.listaOpcoes}>
                  {veterinarios.map((vet) => (
                    <TouchableOpacity
                      key={vet.id}
                      style={[estilos.chip, veterinarioId === vet.id && estilos.chipAtivo]}
                      onPress={() => setVeterinarioId(vet.id)}
                    >
                      <Text
                        style={[
                          estilos.chipTexto,
                          veterinarioId === vet.id && estilos.chipTextoAtivo,
                        ]}
                      >
                        {vet.nome}
                        {vet.especialidade ? ` · ${vet.especialidade}` : ""}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={estilos.rotulo}>Data</Text>
              <TextInput
                style={estilos.campo}
                value={data}
                onChangeText={(texto) => setData(formatarData(texto))}
                placeholder="dd/mm/aaaa"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={10}
              />
              <Text style={estilos.dica}>
                A clínica atende de segunda a sábado, das 08:00 às 18:00.
              </Text>

              <Text style={estilos.rotulo}>Horário</Text>
              <View style={estilos.listaOpcoes}>
                {HORARIOS.map((horario) => (
                  <TouchableOpacity
                    key={horario}
                    style={[estilos.chipHora, hora === horario && estilos.chipAtivo]}
                    onPress={() => setHora(horario)}
                  >
                    <Text
                      style={[estilos.chipTexto, hora === horario && estilos.chipTextoAtivo]}
                    >
                      {horario}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={estilos.rotulo}>Motivo da consulta</Text>
              <TextInput
                style={[estilos.campo, estilos.campoLongo]}
                value={motivo}
                onChangeText={setMotivo}
                placeholder="Ex.: vacinação anual, o pet está mancando..."
                placeholderTextColor="#999"
                multiline
                maxLength={255}
              />

              <TouchableOpacity
                style={[estilos.botao, enviando && { opacity: 0.7 }]}
                onPress={agendar}
                disabled={enviando}
              >
                {enviando ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={estilos.botaoTexto}>Solicitar consulta</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={estilos.divisor} />

          <Text style={estilos.subtitulo}>Minhas consultas</Text>

          {carregandoConsultas ? (
            <ActivityIndicator color={AMARELO} style={{ marginTop: 16 }} />
          ) : consultas.length === 0 ? (
            <Text style={estilos.vazio}>Você ainda não tem consultas.</Text>
          ) : (
            consultas.map((consulta) => (
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
                  {consulta.nomePet} · {dataDoEvento(consulta.dataHora)} às{" "}
                  {consulta.dataHora.slice(11, 16)}
                </Text>
                <Text style={estilos.cartaoLinha}>Dr(a). {consulta.nomeVeterinario}</Text>
                <Text style={estilos.cartaoDescricao}>
                  {consulta.observacoes || DESCRICAO_STATUS[consulta.status]}
                </Text>

                {podeCancelar(consulta) && (
                  <TouchableOpacity
                    style={estilos.botaoCancelar}
                    onPress={() => cancelarConsultaSolicitada(consulta)}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#D64545" />
                    <Text style={estilos.botaoCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  titulo: { fontSize: 24, fontWeight: "bold", color: "#222", marginTop: 8, marginBottom: 16 },
  subtitulo: { fontSize: 18, fontWeight: "bold", color: "#222", marginBottom: 12 },
  rotulo: { fontSize: 14, fontWeight: "600", color: "#444", marginTop: 16, marginBottom: 8 },
  dica: { fontSize: 12, color: "#888", marginTop: 6 },
  aviso: { fontSize: 13, color: "#8A6A10", fontStyle: "italic" },
  vazio: { textAlign: "center", color: "#999", marginTop: 20, fontStyle: "italic" },
  listaOpcoes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  chipHora: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  chipAtivo: { backgroundColor: "#FFF6DF", borderColor: AMARELO },
  chipTexto: { fontSize: 13, color: "#555" },
  chipTextoAtivo: { color: "#8A6A10", fontWeight: "700" },
  campo: {
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: AMARELO,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
  },
  campoLongo: { minHeight: 80, textAlignVertical: "top" },
  botao: {
    backgroundColor: AMARELO,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    elevation: 3,
  },
  botaoTexto: { fontSize: 16, fontWeight: "bold", color: "#000" },
  divisor: { height: 1, backgroundColor: "#E5E5E5", marginVertical: 28 },
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
  botaoCancelar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  botaoCancelarTexto: { color: "#D64545", fontSize: 13, fontWeight: "600" },
});
