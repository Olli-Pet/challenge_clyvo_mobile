import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ModalPerfilProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModalPerfil({ visible, onClose }: ModalPerfilProps) {
  const [tutor, setTutor] = useState<{ nome?: string; email?: string } | null>(null);

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem("@olli_user_logado").then((raw) => {
        if (raw) setTutor(JSON.parse(raw));
      });
    }
  }, [visible]);

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Perfil do Responsável</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={50} color="#666" />
          </View>

          <Text style={styles.label}>Nome Completo</Text>
          <Text style={styles.value}>{tutor?.nome || "Tutor Olli"}</Text>

          <Text style={styles.label}>E-mail de Contato</Text>
          <Text style={styles.value}>{tutor?.email || "tutor@olli.com.br"}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 25 },
  content: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold" },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#F2F2F2", justifyContent: "center", alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: "#FDCB5C" },
  label: { fontSize: 12, color: "#999", width: "100%", textAlign: "left", marginTop: 10 },
  value: { fontSize: 16, fontWeight: "600", color: "#333", width: "100%", textAlign: "left", marginBottom: 5, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  button: { backgroundColor: "#FDCB5C", width: "100%", padding: 12, borderRadius: 25, alignItems: "center", marginTop: 25 },
  buttonText: { fontWeight: "bold", color: "#000" }
});