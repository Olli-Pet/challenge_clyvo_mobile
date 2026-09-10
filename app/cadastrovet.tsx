import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";
import { useAutenticacao } from "@/contexts/AuthContext";
import { avisar, avisarEEntao } from "../services/avisar";
import { garantirVinculoAntesDeNavegar } from "../services/api/autenticacaoApi";
import { ehVeterinarioDaEquipe } from "../services/api/adminApi";

const AZUL = "#66A6FA";

/**
 * Primeiro acesso do veterinário.
 *
 * Não é um cadastro aberto: quem cria o veterinário é a administração da
 * clínica, pela API. Aqui o profissional apenas define a senha, e só consegue
 * se o e-mail já constar na equipe — senão qualquer pessoa que baixasse o
 * aplicativo poderia se declarar médica.
 */
export default function PrimeiroAcessoVet() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const { entrar: registrarSessao } = useAutenticacao();

  const criarAcesso = async () => {
    if (!email.trim() || !senha.trim()) {
      avisar("Atenção", "Informe o e-mail cadastrado e defina uma senha.");
      return;
    }

    if (senha !== confirmarSenha) {
      avisar("Erro", "As senhas não conferem!");
      return;
    }

    if (senha.length < 6) {
      avisar("Erro", "A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const emailNormalizado = email.trim().toLowerCase();

      // 1. Confere na clínica ANTES de criar qualquer conta: só quem a
      //    administração cadastrou pode ter acesso de veterinário.
      let daEquipe: boolean;
      try {
        daEquipe = await ehVeterinarioDaEquipe(emailNormalizado);
      } catch (erro) {
        console.error("Erro ao consultar a equipe:", erro);
        avisar(
          "Clínica indisponível",
          "Não conseguimos confirmar seu cadastro agora. Tente novamente em instantes."
        );
        return;
      }

      if (!daEquipe) {
        avisar(
          "E-mail não encontrado",
          "Este e-mail não consta na equipe clínica. Peça à administração para " +
            "cadastrá-lo antes do primeiro acesso."
        );
        return;
      }

      // 2. Cria a senha no Firebase, que é quem autentica o app.
      const credencial = await createUserWithEmailAndPassword(auth, emailNormalizado, senha);
      const usuario = credencial.user;

      // 3. Registra o perfil. Nome e CRMV vêm do cadastro da clínica, não daqui:
      //    o profissional não declara os próprios dados profissionais.
      const dadosVet = {
        uid: usuario.uid,
        tipo: "vet" as const,
        email: emailNormalizado,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", usuario.uid), dadosVet);
      await registrarSessao({ ...dadosVet, createdAt: new Date() });

      // 4. Vincula à clínica antes de navegar: é o que grava o firebase_uid no
      //    cadastro existente e faz a API aceitá-lo como VETERINARIO.
      await garantirVinculoAntesDeNavegar();

      avisarEEntao("Acesso criado!", "Bem-vindo(a) ao painel clínico.", () =>
        router.replace("/homevet")
      );
    } catch (error: any) {
      console.error("Erro no primeiro acesso:", error);
      let mensagemErro = "Não foi possível criar seu acesso.";

      if (error.code === "auth/email-already-in-use") {
        mensagemErro =
          "Você já tem acesso criado com este e-mail. Volte e entre pela tela de login.";
      } else if (error.code === "auth/invalid-email") {
        mensagemErro = "Formato de e-mail inválido.";
      } else if (error.code === "auth/weak-password") {
        mensagemErro = "A senha escolhida é muito fraca.";
      } else if (error.code === "permission-denied") {
        mensagemErro =
          "O acesso foi criado, mas não conseguimos salvar seu perfil. " +
          "Publique as regras do Firestore e entre pelo login.";
      }

      avisar("Erro no primeiro acesso", mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={AZUL} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <Ionicons name="medical" size={60} color={AZUL} style={{ alignSelf: "center" }} />
          <Text style={styles.title}>Primeiro acesso</Text>

          <View style={styles.aviso}>
            <Ionicons name="information-circle-outline" size={18} color="#2E6BB8" />
            <Text style={styles.avisoTexto}>
              Use o e-mail que a clínica cadastrou para você. O acesso de veterinário é
              criado pela administração.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail cadastrado na clínica</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="nome@ollipet.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Defina sua senha</Text>
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirme a senha</Text>
            <TextInput
              style={styles.input}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              placeholder="Repita a senha"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={criarAcesso} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Criar acesso</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.replace("/")}>
            <Text style={styles.loginLinkText}>Já tenho acesso</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { padding: 30, paddingTop: 60, paddingBottom: 40 },
  back: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backText: { color: AZUL, marginLeft: 5, fontWeight: "bold" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#333",
  },
  aviso: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#EBF3FF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  avisoTexto: { flex: 1, fontSize: 12, color: "#2E6BB8", lineHeight: 18 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, color: "#666", marginBottom: 6 },
  input: { borderBottomWidth: 2, borderBottomColor: AZUL, height: 42, fontSize: 16 },
  button: {
    backgroundColor: AZUL,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  loginLink: { marginTop: 24, alignItems: "center" },
  loginLinkText: { fontSize: 14, color: "#666", textDecorationLine: "underline" },
});
