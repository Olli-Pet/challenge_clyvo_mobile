import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface ModalInsightsProps {
  visivel: boolean;
  onClose: () => void;
  nomePet: string;
  onInsightsGerados: (novosInsights: string[]) => void;
}

export default function ModalInsights({ visivel, onClose, nomePet, onInsightsGerados }: ModalInsightsProps) {
  const [carregandoIA, setCarregandoIA] = useState(false);

  const [statusAlimentacao, setStatusAlimentacao] = useState("Alimentação em dia");
  const [statusDisposicao, setStatusDisposicao] = useState("Disposição: normal");
  const [statusPelo, setStatusPelo] = useState("Pelo: saudável");

  const processarNovosInsights = () => {
    setCarregandoIA(true);

    setTimeout(() => {
      const resultados = [
        "Condição física: avaliada",
        statusPelo,
        statusDisposicao,
        statusAlimentacao
      ];
      
      onInsightsGerados(resultados);
      setCarregandoIA(false);
      onClose();
      Alert.alert("Sucesso! ✨", `Os insights da inteligência artificial para ${nomePet} foram atualizados.`);
    }, 1500);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visivel}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>✨ Alimentar IA para {nomePet}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>Selecione o estado atual do pet para a IA analisar:</Text>

          <Text style={styles.selectLabel}>Alimentação de hoje:</Text>
          <View style={styles.optionsRow}>
            {["Alimentação em dia", "Comeu pouco", "Não quis comer"].map((opcao) => (
              <TouchableOpacity 
                key={opcao} 
                style={[styles.optionBtn, statusAlimentacao === opcao && styles.optionBtnSelected]}
                onPress={() => setStatusAlimentacao(opcao)}
              >
                <Text style={[styles.optionBtnText, statusAlimentacao === opcao && styles.optionBtnTextSelected]}>
                  {opcao.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.optionsRow ? styles.selectLabel : styles.selectLabel}>Comportamento / Energia:</Text>
          <View style={styles.optionsRow}>
            {["Disposição: normal", "Muito agitado", "Meio caidinho/apático"].map((opcao) => (
              <TouchableOpacity 
                key={opcao} 
                style={[styles.optionBtn, statusDisposicao === opcao && styles.optionBtnSelected]}
                onPress={() => setStatusDisposicao(opcao)}
              >
                <Text style={[styles.optionBtnText, statusDisposicao === opcao && styles.optionBtnTextSelected]}>
                  {opcao.includes("normal") ? "Normal" : opcao.includes("agitado") ? "Agitado" : "Apático"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.selectLabel}>Estado da pelagem:</Text>
          <View style={styles.optionsRow}>
            {["Pelo: saudável", "Caindo bastante", "Coçando muito"].map((opcao) => (
              <TouchableOpacity 
                key={opcao} 
                style={[styles.optionBtn, statusPelo === opcao && styles.optionBtnSelected]}
                onPress={() => setStatusPelo(opcao)}
              >
                <Text style={[styles.optionBtnText, statusPelo === opcao && styles.optionBtnTextSelected]}>
                  {opcao.includes("saudável") ? "Saudável" : opcao.includes("Caindo") ? "Queda" : "Coceira"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.btnSalvarIA} 
            onPress={processarNovosInsights}
            disabled={carregandoIA}
          >
            {carregandoIA ? (
              <ActivityIndicator color="black" />
            ) : (
              <>
                <MaterialCommunityIcons name="creation" size={20} color="black" />
                <Text style={styles.btnSalvarIAText}>Computar com IA</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 19, fontWeight: 'bold' },
  modalSubtitle: { fontSize: 13, color: '#666', marginBottom: 20 },
  selectLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 8 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  optionBtn: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 },
  optionBtnSelected: { backgroundColor: '#FDE4A8', borderColor: '#FDCB5C' },
  optionBtnText: { fontSize: 12, color: '#555', fontWeight: '500' },
  optionBtnTextSelected: { color: 'black', fontWeight: 'bold' },
  btnSalvarIA: { backgroundColor: '#FDCB5C', paddingVertical: 14, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 25, elevation: 2 },
  btnSalvarIAText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: 'black' }
});