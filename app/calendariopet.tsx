import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@/components/Header";

interface EventoPet {
  id: string;
  data: string; 
  titulo: string;
  descricao: string;
  criadoPor: "tutor" | "vet";
}

/** Converte a data para a chave aaaa-mm-dd usada para agrupar os eventos. */
const formatarDataChave = (data: Date) => {
  const year = data.getFullYear();
  const month = String(data.getMonth() + 1).padStart(2, "0");
  const day = String(data.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function CalendarioPet() {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [eventos, setEventos] = useState<EventoPet[]>([]);
  // Hoje já é o dia inicial: definir isso num efeito causaria um render extra.
  const [diaSelecionado, setDiaSelecionado] = useState<string>(() =>
    formatarDataChave(new Date())
  );
  
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tituloEvento, setTituloEvento] = useState("");
  const [descEvento, setDescEvento] = useState("");
  const [tipoCriador, setTipoCriador] = useState<"tutor" | "vet">("tutor");

  useEffect(() => {
    // A leitura é assíncrona, então o setState acontece fora do render.
    const carregarEventos = async () => {
      try {
        const salvos = await AsyncStorage.getItem("@olli_calendario_eventos");
        if (salvos) setEventos(JSON.parse(salvos));
      } catch (e) {
        console.error("Erro ao carregar agenda", e);
      }
    };

    carregarEventos();
  }, []);

  const gerarDiasDoMes = () => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    
    const primeiroDiaIndex = new Date(ano, mes, 1).getDay();
    const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();
    
    const listaDias = [];
    
    for (let i = 0; i < primeiroDiaIndex; i++) {
      listaDias.push({ dia: null, chave: `vazio-${i}` });
    }
    
    for (let d = 1; d <= totalDiasNoMes; d++) {
      const dataInstancia = new Date(ano, mes, d);
      listaDias.push({
        dia: d,
        chave: formatarDataChave(dataInstancia)
      });
    }
    
    return listaDias;
  };

  const mudarMes = (direcao: "anterior" | "proximo") => {
    const novoMes = new Date(dataAtual);
    if (direcao === "anterior") novoMes.setMonth(dataAtual.getMonth() - 1);
    else novoMes.setMonth(dataAtual.getMonth() + 1);
    setDataAtual(novoMes);
  };

  const salvarNovoEvento = async () => {
    if (!tituloEvento.trim()) {
      Alert.alert("Ops!", "Dê um título para o compromisso.");
      return;
    }

    const novo: EventoPet = {
      id: `evt_${Date.now()}`,
      data: diaSelecionado,
      titulo: tituloEvento,
      descricao: descEvento,
      criadoPor: tipoCriador
    };

    const listaAtualizada = [...eventos, novo];
    setEventos(listaAtualizada);
    await AsyncStorage.setItem("@olli_calendario_eventos", JSON.stringify(listaAtualizada));

    // Resetar campos
    setTituloEvento("");
    setDescEvento("");
    setModalVisivel(false);
  };

  const deletarEvento = async (id: string) => {
    const filtrados = eventos.filter(e => e.id !== id);
    setEventos(filtrados);
    await AsyncStorage.setItem("@olli_calendario_eventos", JSON.stringify(filtrados));
  };

  const mesesAno = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const diasDoMes = gerarDiasDoMes();
  const eventosDoDia = eventos.filter(e => e.data === diaSelecionado);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.headerCalendario}>
          <TouchableOpacity onPress={() => mudarMes("anterior")}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.tituloMes}>
            {mesesAno[dataAtual.getMonth()]} {dataAtual.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => mudarMes("proximo")}>
            <Ionicons name="chevron-forward" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.diasSemanaContainer}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <Text key={i} style={styles.diaSemanaTexto}>{d}</Text>
          ))}
        </View>

        <View style={styles.gradeDias}>
          {diasDoMes.map((item) => {
            const temEvento = eventos.some(e => e.data === item.chave);
            const estaSelecionado = diaSelecionado === item.chave;

            return (
              <TouchableOpacity
                key={item.chave}
                style={[
                  styles.blocoDia,
                  estaSelecionado && styles.blocoSelecionado
                ]}
                disabled={!item.dia}
                onPress={() => item.dia && setDiaSelecionado(item.chave)}
              >
                <Text style={[styles.textoDia, !item.dia && { color: "#CCC" }, estaSelecionado && { fontWeight: "bold" }]}>
                  {item.dia}
                </Text>
                {temEvento && item.dia && <View style={styles.pontoNotificacao} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.containerCompromissos}>
          <View style={styles.linhaTituloEventos}>
            <Text style={styles.tituloEventos}>Compromissos do Dia</Text>
            <TouchableOpacity style={styles.botaoAdd} onPress={() => setModalVisivel(true)}>
              <Ionicons name="add" size={20} color="black" />
              <Text style={styles.textoBotaoAdd}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {eventosDoDia.length === 0 ? (
            <Text style={styles.textoVazio}>Nenhum lembrete para esta data. 🐾</Text>
          ) : (
            eventosDoDia.map((item) => (
              <View 
                key={item.id} 
                style={[
                  styles.cardEvento, 
                  { borderLeftColor: item.criadoPor === "vet" ? "#66A6FA" : "#FDCB5C" }
                ]}
              >
                <View style={styles.infoEvento}>
                  <Text style={styles.tituloCard}>{item.titulo}</Text>
                  {item.descricao ? <Text style={styles.descCard}>{item.descricao}</Text> : null}
                  <Text style={[styles.badgeCriador, { color: item.criadoPor === "vet" ? "#3376cc" : "#b58716" }]}>
                    {item.criadoPor === "vet" ? "🩺 Lembrete Médico Veterinário" : "🏠 Lembrete de Rotina"}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deletarEvento(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.overlayModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>Novo Registro Pet</Text>
            
            <Text style={styles.labelInput}>Título / Atividade</Text>
            <TextInput 
              style={styles.inputModal} 
              placeholder="Ex: Dar remédio de verme, Retorno..." 
              value={tituloEvento}
              onChangeText={setTituloEvento}
            />

            <Text style={styles.labelInput}>Observações (opcional)</Text>
            <TextInput 
              style={[styles.inputModal, { height: 70, textAlignVertical: "top" }]} 
              placeholder="Ex: Dosagem de 2ml, Jejum de 4h..." 
              value={descEvento}
              onChangeText={setDescEvento}
              multiline
            />

            <Text style={styles.labelInput}>Quem está registrando?</Text>
            <View style={styles.seletorCriador}>
              <TouchableOpacity 
                style={[styles.opcaoSeletor, tipoCriador === "tutor" && { backgroundColor: "#FDCB5C" }]}
                onPress={() => setTipoCriador("tutor")}
              >
                <Text style={{ fontWeight: "bold" }}>Responsável</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.opcaoSeletor, tipoCriador === "vet" && { backgroundColor: "#66A6FA" }]}
                onPress={() => setTipoCriador("vet")}
              >
                <Text style={{ fontWeight: "bold", color: tipoCriador === "vet" ? "#FFF" : "#000" }}>Med Vet</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.botoesModal}>
              <TouchableOpacity style={[styles.btnModal, styles.btnCancelar]} onPress={() => setModalVisivel(false)}>
                <Text style={{ fontWeight: "bold" }}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnModal, styles.btnSalvar]} onPress={salvarNovoEvento}>
                <Text style={{ fontWeight: "bold", color: "#000" }}>Agendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContainer: { paddingBottom: 110, paddingHorizontal: 20 },
  headerCalendario: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 20 },
  tituloMes: { fontSize: 20, fontWeight: "bold" },
  diasSemanaContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  diaSemanaTexto: { fontWeight: "600", color: "#666", width: 40, textAlign: "center" },
  gradeDias: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" },
  blocoDia: { width: "14.28%", height: 45, justifyContent: "center", alignItems: "center", marginVertical: 2, borderRadius: 10 },
  blocoSelecionado: { backgroundColor: "#EAEAEA", borderWidth: 1, borderColor: "#BBB" },
  textoDia: { fontSize: 14, color: "#000" },
  pontoNotificacao: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF6B6B", position: "absolute", bottom: 4 },
  containerCompromissos: { marginTop: 25 },
  linhaTituloEventos: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  tituloEventos: { fontSize: 18, fontWeight: "bold" },
  botaoAdd: { flexDirection: "row", alignItems: "center", backgroundColor: "#FDCB5C", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
  textoBotaoAdd: { fontSize: 13, fontWeight: "bold", marginLeft: 4 },
  textoVazio: { color: "#888", fontStyle: "italic", textAlign: "center", marginTop: 10 },
  cardEvento: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F9F9F9", padding: 15, borderRadius: 15, marginBottom: 10, borderLeftWidth: 6, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  infoEvento: { flex: 1, paddingRight: 10 },
  tituloCard: { fontSize: 15, fontWeight: "bold" },
  descCard: { fontSize: 13, color: "#666", marginTop: 2 },
  badgeCriador: { fontSize: 11, fontWeight: "600", marginTop: 5 },
  overlayModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  conteudoModal: { backgroundColor: "#FFF", width: "85%", borderRadius: 25, padding: 20, elevation: 10 },
  tituloModal: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  labelInput: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 4, marginTop: 10 },
  inputModal: { borderWidth: 1.5, borderColor: "#DDD", borderRadius: 12, height: 40, paddingHorizontal: 12, backgroundColor: "#FAFAFA" },
  seletorCriador: { flexDirection: "row", backgroundColor: "#EEE", borderRadius: 12, padding: 4, marginTop: 5 },
  opcaoSeletor: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  botoesModal: { flexDirection: "row", justifyContent: "space-between", marginTop: 25 },
  btnModal: { flex: 1, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  btnCancelar: { backgroundColor: "#EEE", marginRight: 10 },
  btnSalvar: { backgroundColor: "#FDCB5C" },
});