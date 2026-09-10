import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAtualizarPet, useMeusPets, useRemoverPet } from "@/hooks/usePets";
import { Pet } from "@/services/api/petsApi";
import { ErroApi } from "@/services/api/clienteApi";
import { avisar, confirmar } from "@/services/avisar";

interface ModalGerenciarPetsProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModalGerenciarPets({ visible, onClose }: ModalGerenciarPetsProps) {
  const [petEditando, setPetEditando] = useState<number | null>(null);
  const [novaInfo, setNovaInfo] = useState("");

  const { data: pets = [], isPending: carregando } = useMeusPets();
  const { mutateAsync: salvarPet, isPending: salvando } = useAtualizarPet();
  const { mutateAsync: excluirPet } = useRemoverPet();

  const mensagemDeErro = (erro: unknown, padrao: string) =>
    erro instanceof ErroApi ? erro.message : padrao;

  const salvarEdicao = async (pet: Pet) => {
    try {

      await salvarPet({ id: pet.id, dados: { ...pet, info: novaInfo } });
      setPetEditando(null);
      avisar("Sucesso", "Informações do pet atualizadas!");
    } catch (erro) {
      console.error("Erro ao atualizar o pet:", erro);
      avisar("Erro", mensagemDeErro(erro, "Não foi possível salvar as alterações."));
    }
  };

  const deletarPet = (id: number, nome: string) => {
    confirmar(
      "Excluir Pet",
      `Tem certeza que deseja apagar os registros de ${nome}?`,
      async () => {
        try {
          await excluirPet(id);
        } catch (erro) {
          console.error("Erro ao excluir o pet:", erro);
          avisar("Erro", mensagemDeErro(erro, "Não foi possível excluir o pet."));
        }
      },
      "Apagar"
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Meus Pets Cadastrados</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="black" /></TouchableOpacity>
          </View>

          <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
            {pets.map((pet) => (
              <View key={pet.id} style={styles.petCard}>
                <View style={styles.petRow}>
                  <View>
                    <Text style={styles.petName}>{pet.nome}</Text>
                    <Text style={styles.petBreed}>{pet.raca}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => { setPetEditando(pet.id); setNovaInfo(pet.info); }} style={styles.iconBtn}>
                      <Ionicons name="create-outline" size={22} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deletarPet(pet.id, pet.nome)} style={styles.iconBtn}>
                      <Ionicons name="trash-outline" size={22} color="#FF4D4D" />
                    </TouchableOpacity>
                  </View>
                </View>

                {petEditando === pet.id ? (
                  <View style={styles.editSection}>
                    <TextInput style={styles.input} value={novaInfo} onChangeText={setNovaInfo} multiline />
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={() => salvarEdicao(pet)}
                      disabled={salvando}
                    >
                      {salvando ? (
                        <ActivityIndicator color="#000" size="small" />
                      ) : (
                        <Text style={styles.saveText}>Salvar Bio</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.petInfo}>{pet.info || "Sem descrição definida."}</Text>
                )}
              </View>
            ))}
            {carregando && (
              <ActivityIndicator color="#FDCB5C" style={{ marginVertical: 20 }} />
            )}

            {!carregando && pets.length === 0 && (
              <Text style={styles.empty}>Nenhum pet encontrado.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  content: { backgroundColor: "#FFF", borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: "85%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold" },
  petCard: { borderWidth: 1, borderColor: "#FDCB5C", borderRadius: 15, padding: 15, marginBottom: 15, backgroundColor: "#FFF" },
  petRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  petName: { fontSize: 16, fontWeight: "bold" },
  petBreed: { fontSize: 12, color: "#666" },
  actions: { flexDirection: "row" },
  iconBtn: { marginLeft: 15, padding: 5 },
  petInfo: { fontSize: 13, color: "#555", marginTop: 8, fontStyle: "italic" },
  editSection: { marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, padding: 8, fontSize: 13, minHeight: 60, textAlignVertical: "top" },
  saveBtn: { backgroundColor: "#FDCB5C", padding: 8, borderRadius: 8, marginTop: 5, alignItems: "center" },
  saveText: { fontSize: 12, fontWeight: "bold" },
  empty: { textAlign: "center", color: "#999", marginVertical: 30 }
});