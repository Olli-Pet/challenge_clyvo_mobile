import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAtualizarPet } from "@/hooks/usePets";
import { buscarPet, Pet } from "@/services/api/petsApi";
import { ErroApi } from "@/services/api/clienteApi";
import { avisar } from "@/services/avisar";

interface ModalProntuarioVetProps {
  visible: boolean;
  onClose: () => void;
  pet: Pet | null;
}

export default function ModalProntuarioVet({ visible, onClose, pet }: ModalProntuarioVetProps) {
  const [novaEvolucao, setNovaEvolucao] = useState("");

  const historicoAtual = pet?.info || "Sem registros clínicos anteriores.";

  const { mutateAsync: salvarPet, isPending: salvando } = useAtualizarPet();

  const salvarNovaEntradaClinica = async () => {
    if (!pet || !novaEvolucao.trim()) {
      avisar("Aviso", "Por favor, digite alguma informação para adicionar ao prontuário.");
      return;
    }

    try {
      const dataHoje = new Date().toLocaleDateString("pt-BR");

      const atual = await buscarPet(pet.id);
      const historicoAtualizado =
        `[${dataHoje} - Registro Med Vet]: ${novaEvolucao}

${atual.info || ""}`.trim();

      await salvarPet({ id: pet.id, dados: { ...atual, info: historicoAtualizado } });

      setNovaEvolucao("");
      avisar("Sucesso", "Prontuário atualizado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar o prontuário:", error);
      avisar(
        "Erro",
        error instanceof ErroApi ? error.message : "Não foi possível atualizar os dados."
      );
    }
  };

  if (!pet) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>

          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="medical" size={22} color="#66A6FA" />
              <Text style={styles.title}>Prontuário: {pet.nome}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>

            <Text style={styles.sectionLabel}>Histórico de Procedimentos e Consultas</Text>
            <View style={styles.historicoBox}>
              <Text style={styles.historicoText}>{historicoAtual}</Text>
            </View>

            <Text style={styles.sectionLabel}>Adicionar Nova Consulta / Cirurgia</Text>
            <TextInput
              style={styles.inputClinico}
              placeholder="Ex: Realizada cirurgia eletiva sem intercorrências... ou Consulta de rotina, vacinação em dia."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={novaEvolucao}
              onChangeText={setNovaEvolucao}
            />

            <TouchableOpacity 
              style={[styles.btnSalvar, salvando && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={salvarNovaEntradaClinica}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
                  <Text style={styles.btnSalvarText}>Salvar no Prontuário</Text>
                </>
              )}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  content: { backgroundColor: "#FFF", borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: "90%", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "bold", color: "#222" },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: "#444", marginTop: 15, marginBottom: 8, alignSelf: "flex-start" },
  historicoBox: { backgroundColor: "#F4F8FF", borderRadius: 12, padding: 15, width: "100%", borderWidth: 1, borderColor: "#D2E4FF" },
  historicoText: { fontSize: 14, color: "#333", lineHeight: 20 },
  inputClinico: { backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#66A6FA", borderRadius: 12, padding: 12, width: "100%", minHeight: 100, textAlignVertical: "top", fontSize: 14, color: "#333" },
  btnSalvar: { backgroundColor: "#66A6FA", flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", padding: 14, borderRadius: 30, marginTop: 20, gap: 8, elevation: 2 },
  btnSalvarText: { color: "#FFF", fontWeight: "bold", fontSize: 15 }
});