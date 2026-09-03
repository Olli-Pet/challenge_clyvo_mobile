import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAutenticacao } from "@/contexts/AuthContext";
import { confirmar } from "@/services/avisar";
import { obterSessao } from "@/services/sessao";

interface ModalPerfilProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModalPerfil({ visible, onClose }: ModalPerfilProps) {
  const [tutor, setTutor] = useState<{ nome?: string; email?: string } | null>(null);
  const { sair } = useAutenticacao();

  // Encerra a sessão no Firebase e limpa os dados locais. O guard em
  // _layout.tsx percebe a mudança e leva o usuário de volta ao login.
  const sairDaConta = () => {
    confirmar("Sair da conta", "Deseja encerrar a sessão?", async () => {
      onClose();
      await sair();
    }, "Sair");
  };

  useEffect(() => {
    if (visible) {
      obterSessao().then((sessao) => {
        if (sessao) setTutor(sessao);
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

          <TouchableOpacity style={styles.botaoSair} onPress={sairDaConta}>
            <Ionicons name="log-out-outline" size={18} color="#D64545" />
            <Text style={styles.botaoSairTexto}>Sair da conta</Text>
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
  botaoSair: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: 12, marginTop: 10 },
  botaoSairTexto: { color: "#D64545", fontWeight: "600", fontSize: 14 },
  buttonText: { fontWeight: "bold", color: "#000" }
});