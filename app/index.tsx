import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { carregarPerfil, salvarSessao } from "../services/sessao";
import { garantirCadastroNaClinica } from "../services/api/autenticacaoApi";
import { avisar } from "../services/avisar";

import OndaTop from "../components/Onda";
import OndaBottom from "../components/OndaBottom";

export default function Index() {
  // Inicializados vazios para input real do usuário
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<"tutor" | "vet">("tutor");
  const [loading, setLoading] = useState(false);
  // Enquanto verificamos se já existe sessão salva, evitamos piscar o formulário.
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  const corAtiva = tipoUsuario === "vet" ? "#66A6FA" : "#E7B84C";

  // Auto-login: o Firebase Auth restaura a sessão do AsyncStorage ao abrir o
  // app. Se já houver usuário autenticado, vai direto para a home dele.
  useEffect(() => {
    let ativo = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (ativo) setVerificandoSessao(false);
        return;
      }

      try {
        const perfil = await carregarPerfil(user.uid);
        if (!ativo) return;

        if (perfil) {
          await salvarSessao(perfil);
          router.replace(perfil.tipo === "vet" ? "/homevet" : "/Home");
          return;
        }
      } catch (erro) {
        console.warn("Falha ao restaurar a sessão:", erro);
      }

      if (ativo) setVerificandoSessao(false);
    });

    return () => {
      ativo = false;
      unsubscribe();
    };
  }, []);

  if (verificandoSessao) {
    return (
      <SafeAreaView style={[styles.container, styles.centralizado]}>
        <ActivityIndicator size="large" color={corAtiva} />
      </SafeAreaView>
    );
  }

  async function entrar() {
    if (!email.trim() || !senha.trim()) {
      avisar("Atenção", "Por favor, preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    try {
      const emailNormalizado = email.trim().toLowerCase();
      
      // 1. Autentica no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, emailNormalizado, senha);
      const user = userCredential.user;

      // 2. Busca o perfil. Cobre tanto a coleção nova ('users') quanto as
      //    contas antigas em 'tutores', que são migradas e tratadas como tutor.
      const perfil = await carregarPerfil(user.uid);

      if (!perfil) {
        avisar("Erro", "Dados do usuário não encontrados no banco.");
        return;
      }

      // Garante que o usuário está tentando entrar pelo perfil correto
      if (perfil.tipo !== tipoUsuario) {
        avisar(
          "Acesso Negado",
          `Esta conta está registrada como ${perfil.tipo === "vet" ? "Veterinário" : "Responsável"}.`
        );
        return;
      }

      // 3. Salva a sessão localmente (fica ativa para as demais telas)
      await salvarSessao(perfil);

      // 4. Revalida o vínculo com a clínica (API Java). É idempotente, então
      //    cobre também os tutores cadastrados antes da integração existir.
      //    Falha aqui não impede o login: a API é um complemento do Firebase.
      if (perfil.tipo === "tutor" && perfil.cpf) {
        await garantirCadastroNaClinica(perfil.cpf);
      }

      // 5. Redireciona conforme o tipo. Usa replace para o botão "voltar"
      //    não retornar à tela de login já autenticado.
      router.replace(perfil.tipo === "vet" ? "/homevet" : "/Home");

    } catch (error: any) {
      let mensagemErro = "Ocorreu um erro ao tentar entrar.";
      
      if (
        error.code === "auth/invalid-credential" || 
        error.code === "auth/user-not-found" || 
        error.code === "auth/wrong-password"
      ) {
        mensagemErro = "E-mail ou senha incorretos!";
      } else if (error.code === "auth/invalid-email") {
        mensagemErro = "Formato de e-mail inválido!";
      } else if (error.code === "permission-denied") {
        // Autenticou, mas o Firestore recusou a leitura do perfil.
        mensagemErro =
          "Entramos na sua conta, mas não conseguimos ler seu perfil. " +
          "Publique as regras do Firestore (arquivo firestore.rules).";
      } else if (error.code === "auth/network-request-failed") {
        mensagemErro = "Sem conexão com o Firebase. Verifique sua internet.";
      }

      avisar("Erro de Autenticação", mensagemErro);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={corAtiva} />

      <OndaTop color={corAtiva} />
      <OndaBottom color={corAtiva} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require("../app/assets/images/olli-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.selectorContainer}>
            <TouchableOpacity
              style={[styles.selectorButton, tipoUsuario === "tutor" && { backgroundColor: "#E7B84C" }]}
              onPress={() => setTipoUsuario("tutor")}
            >
              <Text style={[styles.selectorText, tipoUsuario === "tutor" && { color: "#000" }]}>Responsável</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.selectorButton, tipoUsuario === "vet" && { backgroundColor: "#66A6FA" }]}
              onPress={() => setTipoUsuario("vet")}
            >
              <Text style={[styles.selectorText, tipoUsuario === "vet" && { color: "#FFF" }]}>Med Vet</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{tipoUsuario === "vet" ? "Acesso Clínico" : "Bem-vindo de volta"}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[styles.input, { borderColor: corAtiva }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={[styles.input, { borderColor: corAtiva }]}
              value={senha}
              onChangeText={setSenha}
              placeholder="Digite sua senha"
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: corAtiva }]} 
            onPress={entrar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={tipoUsuario === "vet" ? "#FFF" : "#000"} />
            ) : (
              <Text style={[styles.buttonText, { color: tipoUsuario === "vet" ? "#FFF" : "#000" }]}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push(tipoUsuario === "vet" ? "/cadastrovet" : "/Cadastro")}>
            <Text style={styles.link}>Não possui conta? Cadastre-se</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  centralizado: { justifyContent: "center", alignItems: "center" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },
  logoContainer: { marginBottom: 10, alignItems: 'center' },
  logoImage: { width: 220, height: 120 },
  selectorContainer: { flexDirection: "row", backgroundColor: "#DDD", borderRadius: 25, padding: 4, marginBottom: 20, width: "70%", alignSelf: "center" },
  selectorButton: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: "center" },
  selectorText: { fontWeight: "bold", fontSize: 13, color: "#666" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 5, marginLeft: 10, fontWeight: "500" },
  input: { backgroundColor: "#FFF", borderRadius: 25, paddingHorizontal: 15, height: 45, borderWidth: 1.5, color: "#000" },
  button: { height: 45, borderRadius: 25, justifyContent: "center", alignItems: "center", marginTop: 10, elevation: 3 },
  buttonText: { fontWeight: "bold" },
  link: { textAlign: "center", marginTop: 25, textDecorationLine: "underline", color: "#333" }
});