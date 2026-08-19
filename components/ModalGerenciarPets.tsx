import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NativeAsyncStorage from "@react-native-async-storage/async-storage";

interface Pet {
  id: string;
  nome: string;
  raca: string;
  info: string;
  uidTutor: string;
}

interface ModalGerenciarPetsProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModalGerenciarPets({ visible, onClose }: ModalGerenciarPetsProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [petEditando, setPetEditando] = useState<string | null>(null);
  const [novaInfo, setNovaInfo] = useState("");

  const carregarPets = async () => {
    const userRaw = await NativeAsyncStorage.getItem("@olli_user_logado");
    const petsRaw = await NativeAsyncStorage.getItem("@olli_pets");
    if (userRaw && petsRaw) {
      const user = JSON.parse(userRaw);
      const todos: Pet[] = JSON.parse(petsRaw);
      setPets(todos.filter(p => p.uidTutor === user.uid));
    }
  };

  useEffect(() => { if (visible) carregarPets(); }, [visible]);

  const salvarEdicao = async (id: string) => {
    const petsRaw = await NativeAsyncStorage.getItem("@olli_pets");
    if (petsRaw) {
      const todos: Pet[] = JSON.parse(petsRaw);
      const atualizados = todos.map(p => p.id === id ? { ...p, info: novaInfo } : p);
      await NativeAsyncStorage.setItem("@olli_pets", JSON.stringify(atualizados));
      setPetEditando(null);
      carregarPets();
      Alert.alert("Sucesso", "Informações do pet atualizadas!");
    }
  };

  const deletarPet = (id: string, nome: string) => {
    Alert.alert("Excluir Pet", `Tem certeza que deseja apagar os registros de ${nome}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Apagar", style: "destructive", onPress: async () => {
          const petsRaw = await NativeAsyncStorage.getItem("@olli_pets");
          if (petsRaw) {
            const todos: Pet[] = JSON.parse(petsRaw);
            const filtrados = todos.filter(p => p.id !== id);
            await NativeAsyncStorage.setItem("@olli_pets", JSON.stringify(filtrados));
            carregarPets();
          }
        }}
    ]);
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
                    <TouchableOpacity style={styles.saveBtn} onPress={() => salvarEdicao(pet.id)}>
                      <Text style={styles.saveText}>Salvar Bio</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.petInfo}>{pet.info || "Sem descrição definida."}</Text>
                )}
              </View>
            ))}
            {pets.length === 0 && <Text style={styles.empty}>Nenhum pet encontrado.</Text>}
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