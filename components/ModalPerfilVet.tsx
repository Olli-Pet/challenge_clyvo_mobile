import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { atualizarPerfil, obterSessao } from "../services/sessao";
import { useAutenticacao } from "@/contexts/AuthContext";
import { avisar, confirmar } from "@/services/avisar";

interface Vet {
  uid?: string;
  nome?: string;
  crmv?: string;
  email?: string;
  tipo?: string;
}

interface ModalPerfilVetProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModalPerfilVet({ visible, onClose }: ModalPerfilVetProps) {
  const [vet, setVet] = useState<Vet | null>(null);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [crmv, setCrmv] = useState("");
  const [email, setEmail] = useState("");

  const { sair } = useAutenticacao();

  // Encerra a sessão; o guard em _layout.tsx devolve o usuário ao login.
  const sairDaConta = () => {
    confirmar(
      "Sair da conta",
      "Deseja encerrar a sessão?",
      async () => {
        onClose();
        await sair();
      },
      "Sair"
    );
  };

  useEffect(() => {
    if (!visible) return;

    // Todos os setState ficam dentro do then: assíncronos, eles rodam fora do
    // render e não disparam a cascata de renderizações que o React alerta.
    obterSessao().then((dados) => {
      if (dados) {
        setVet(dados);
        setNome(dados.nome || "");
        setCrmv(dados.crmv || "");
        setEmail(dados.email || "");
      }
      setEditando(false);
    });
  }, [visible]);

  const salvar = async () => {
    if (!nome.trim() || !crmv.trim() || !email.trim()) {
      avisar("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      // Grava no Firestore E na sessão local, mantendo os dois em sincronia:
      // assim a alteração acompanha o vet em qualquer dispositivo.
      const atualizado = await atualizarPerfil({
        nome: nome.trim(),
        crmv: crmv.trim(),
        email: email.trim(),
      });

      setVet(atualizado as Vet);
      setEditando(false);
      avisar("Sucesso", "Perfil atualizado!");
    } catch (erro) {
      console.error("Erro ao atualizar o perfil do veterinário:", erro);
      avisar("Erro", "Não foi possível salvar as alterações. Tente novamente.");
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", width: "100%" }}>

            <View style={styles.header}>
              <Text style={styles.title}>Perfil Médico</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarCircle}>
              <Ionicons name="medkit" size={46} color="#66A6FA" />
            </View>

            {editando ? (
              <>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Dr(a). ..."
                />

                <Text style={styles.label}>CRMV</Text>
                <TextInput
                  style={styles.input}
                  value={crmv}
                  onChangeText={setCrmv}
                  placeholder="00000-UF"
                  autoCapitalize="characters"
                />

                <Text style={styles.label}>E-mail Profissional</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={styles.botoesRow}>
                  <TouchableOpacity style={styles.btnCancelar} onPress={() => setEditando(false)}>
                    <Text style={styles.btnCancelarText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnSalvar} onPress={salvar}>
                    <Text style={styles.btnSalvarText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>Nome Completo</Text>
                <Text style={styles.value}>{vet?.nome || "—"}</Text>

                <Text style={styles.label}>CRMV</Text>
                <Text style={styles.value}>{vet?.crmv || "—"}</Text>

                <Text style={styles.label}>E-mail Profissional</Text>
                <Text style={styles.value}>{vet?.email || "—"}</Text>

                <TouchableOpacity style={styles.btnEditar} onPress={() => setEditando(true)}>
                  <Ionicons name="pencil-outline" size={16} color="#FFF" />
                  <Text style={styles.btnEditarText}>Editar Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnVoltar} onPress={onClose}>
                  <Text style={styles.btnVoltarText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnSair} onPress={sairDaConta}>
                  <Ionicons name="log-out-outline" size={18} color="#D64545" />
                  <Text style={styles.btnSairText}>Sair da conta</Text>
                </TouchableOpacity>
              </>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", padding: 25,
  },
  content: {
    backgroundColor: "#FFF", borderRadius: 24, padding: 20,
    alignItems: "center", maxHeight: "85%",
  },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    width: "100%", alignItems: "center", marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#222" },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "#EBF3FF", justifyContent: "center",
    alignItems: "center", marginBottom: 20,
    borderWidth: 2, borderColor: "#66A6FA",
  },
  label: {
    fontSize: 12, color: "#999", width: "100%",
    textAlign: "left", marginTop: 12,
  },
  value: {
    fontSize: 16, fontWeight: "600", color: "#333",
    width: "100%", textAlign: "left",
    paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: "#EEE",
    marginBottom: 2,
  },
  input: {
    width: "100%", borderBottomWidth: 2, borderBottomColor: "#66A6FA",
    fontSize: 15, paddingVertical: 6, color: "#333", marginBottom: 4,
  },
  botoesRow: {
    flexDirection: "row", gap: 12, marginTop: 24, width: "100%",
  },
  btnCancelar: {
    flex: 1, borderWidth: 1.5, borderColor: "#66A6FA",
    borderRadius: 25, padding: 12, alignItems: "center",
  },
  btnCancelarText: { color: "#66A6FA", fontWeight: "bold" },
  btnSalvar: {
    flex: 1, backgroundColor: "#66A6FA",
    borderRadius: 25, padding: 12, alignItems: "center",
  },
  btnSalvarText: { color: "#FFF", fontWeight: "bold" },
  btnEditar: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#66A6FA", width: "100%",
    padding: 12, borderRadius: 25, justifyContent: "center", marginTop: 24,
  },
  btnEditarText: { color: "#FFF", fontWeight: "bold" },
  btnVoltar: {
    width: "100%", padding: 12, borderRadius: 25,
    alignItems: "center", marginTop: 10,
    borderWidth: 1, borderColor: "#DDD",
  },
  btnVoltarText: { color: "#666", fontWeight: "600" },
  btnSair: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: 12, marginTop: 6 },
  btnSairText: { color: "#D64545", fontWeight: "600", fontSize: 14 },
});
