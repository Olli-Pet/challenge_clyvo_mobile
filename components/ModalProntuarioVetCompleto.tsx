import React, { useState } from "react";
import {
  Modal, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, TextInput, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAtualizarPet } from "@/hooks/usePets";
import { buscarPet, Pet } from "@/services/api/petsApi";
import { ErroApi } from "@/services/api/clienteApi";
import { avisar } from "@/services/avisar";

interface PetComTutor extends Pet {
  nomeTutor: string;
}

interface ModalProntuarioVetCompletoProps {
  visible: boolean;
  onClose: () => void;
  pet: PetComTutor | null;
}

const obterImagemPet = (termo: string) => {
  const busca = termo?.toLowerCase() || "";
  if (busca.includes("cavalo")) return require("@/app/assets/images/cavalo.png");
  if (busca.includes("ornitorrinco")) return require("@/app/assets/images/ornitorrinco.png");
  return require("@/app/assets/images/dog.png");
};

export default function ModalProntuarioVetCompleto({
  visible, onClose, pet,
}: ModalProntuarioVetCompletoProps) {
  const [novaEvolucao, setNovaEvolucao] = useState("");

  const historicoAtual = pet?.info || "Sem registros clínicos anteriores.";

  const { mutateAsync: salvarPet, isPending: salvando } = useAtualizarPet();

  const salvar = async () => {
    if (!pet || !novaEvolucao.trim()) {
      avisar("Aviso", "Digite alguma informação para adicionar ao prontuário.");
      return;
    }

    try {
      const data = new Date().toLocaleDateString("pt-BR");

      const atual = await buscarPet(pet.id);
      const novoHistorico =
        `[${data} - Med Vet]: ${novaEvolucao.trim()}

${atual.info || ""}`.trim();

      await salvarPet({ id: pet.id, dados: { ...atual, info: novoHistorico } });

      setNovaEvolucao("");
      avisar("Sucesso", "Prontuário atualizado!");
      onClose();
    } catch (error) {
      console.error("Erro ao salvar o prontuário:", error);
      avisar(
        "Erro",
        error instanceof ErroApi ? error.message : "Não foi possível salvar."
      );
    }
  };

  if (!pet) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>PRONTUÁRIO VET</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={30} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

            <View style={styles.cardRow}>
              <Image
                source={obterImagemPet(pet.raca || pet.nome)}
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>PET</Text>
                <Text style={styles.info}><Text style={styles.bold}>Nome:</Text> {pet.nome}</Text>
                <Text style={styles.info}><Text style={styles.bold}>Raça:</Text> {pet.raca || "Não informada"}</Text>
                <Text style={styles.info}><Text style={styles.bold}>Nascimento:</Text> {pet.nascimento || "Não informado"}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>FICHA DO ANIMAL</Text>
              <View style={styles.row}>
                <Text style={[styles.info, { flex: 1 }]}><Text style={styles.bold}>Porte:</Text> {pet.porte || "—"}</Text>
                <Text style={[styles.info, { flex: 1 }]}><Text style={styles.bold}>Cor:</Text> {pet.cor || "—"}</Text>
                <Text style={[styles.info, { flex: 1 }]}><Text style={styles.bold}>Sexo:</Text> {pet.sexo || "—"}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>RESPONSÁVEL</Text>
              <Text style={styles.info}><Text style={styles.bold}>Nome:</Text> {pet.nomeTutor}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>HISTÓRICO CLÍNICO</Text>
              <Text style={styles.historicoText}>{historicoAtual}</Text>
            </View>

            <Text style={styles.addLabel}>Adicionar nova consulta / procedimento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Consulta de rotina, vacinação aplicada, cirurgia sem intercorrências..."
              placeholderTextColor="#99B8D8"
              multiline
              numberOfLines={4}
              value={novaEvolucao}
              onChangeText={setNovaEvolucao}
            />

            <TouchableOpacity
              style={[styles.btnSalvar, salvando && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={salvar}
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

const BLUE = "#66A6FA";
const BLUE_LIGHT = "#EBF3FF";
const BLUE_BORDER = "#B8D4F8";

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#FFF", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    height: "90%", paddingTop: 20,
  },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 22, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 20, fontWeight: "900", color: BLUE, letterSpacing: 0.5,
  },
  scroll: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40,
  },
  card: {
    borderWidth: 1.5, borderColor: BLUE_BORDER, borderRadius: 14,
    padding: 15, marginBottom: 16, backgroundColor: BLUE_LIGHT,
    flexDirection: "column",
  },
  cardRow: {
    borderWidth: 1.5, borderColor: BLUE_BORDER, borderRadius: 14,
    padding: 15, marginBottom: 16, backgroundColor: BLUE_LIGHT,
    flexDirection: "row", alignItems: "center",
  },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    marginRight: 15, backgroundColor: "#DDD",
  },
  cardText: { flex: 1, justifyContent: "center" },
  cardLabel: {
    fontSize: 13, fontWeight: "bold", color: BLUE,
    marginBottom: 8, width: "100%",
  },
  info: { fontSize: 13, color: "#333", marginBottom: 4, lineHeight: 18 },
  bold: { fontWeight: "700", color: "#111" },
  row: { flexDirection: "row", width: "100%", flexWrap: "wrap" },
  historicoText: {
    fontSize: 13, color: "#333", lineHeight: 20,
    flexShrink: 1, flexWrap: "wrap", width: "100%",
  },
  addLabel: {
    fontSize: 14, fontWeight: "700", color: "#444",
    marginBottom: 8, marginTop: 4,
  },
  input: {
    backgroundColor: "#FFF", borderWidth: 1.5, borderColor: BLUE,
    borderRadius: 12, padding: 12, minHeight: 100,
    textAlignVertical: "top", fontSize: 14, color: "#333",
  },
  btnSalvar: {
    backgroundColor: BLUE, flexDirection: "row", justifyContent: "center",
    alignItems: "center", padding: 14, borderRadius: 30,
    marginTop: 16, gap: 8, elevation: 2,
  },
  btnSalvarText: { color: "#FFF", fontWeight: "bold", fontSize: 15 },
});
