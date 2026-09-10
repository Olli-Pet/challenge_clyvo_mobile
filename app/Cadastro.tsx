import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image, 
  ActivityIndicator
} from "react-native";
import { router } from "expo-router";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";
import { useAutenticacao } from "@/contexts/AuthContext";
import { apenasDigitos, garantirVinculoAntesDeNavegar } from "../services/api/autenticacaoApi";

import { avisar, avisarEEntao } from "../services/avisar";

import OndaTop from "../components/Onda";
import OndaBottom from "../components/OndaBottom";

const PRIMARY_YELLOW = "#FDCB5C";

/** Aplica a máscara 000.000.000-00 enquanto o tutor digita. */
function formatarCpf(texto: string): string {
  const numeros = texto.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 3) return numeros;
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  if (numeros.length <= 9) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
  }
  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const { entrar: registrarSessao } = useAutenticacao();

  const handleCadastro = async () => {
    if (!nome.trim() || !cpf.trim() || !email.trim() || !senha.trim()) {
      avisar("Atenção", "Preencha todos os campos obrigatórios!");
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

    // A clínica exige 11 dígitos. Validar aqui evita criar a conta no Firebase
    // e só descobrir o problema depois, com o usuário já logado.
    if (apenasDigitos(cpf).length !== 11) {
      avisar("Erro", "O CPF precisa ter 11 dígitos.");
      return;
    }

    setLoading(true);

    try {
      const emailNormalizado = email.trim().toLowerCase();
      // A API da clinica exige o CPF com 11 digitos crus, sem pontos nem tracos.
      const cpfNormalizado = apenasDigitos(cpf);

      // 1. Cria a conta no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, emailNormalizado, senha);
      const user = userCredential.user;

      // 2. Prepara os dados. O campo 'tipo' é o que o login usa para saber
      //    se a conta é de responsável ou de veterinário.
      const tutorData = {
        uid: user.uid,
        tipo: "tutor" as const,
        nome: nome.trim(),
        cpf: cpfNormalizado,
        email: emailNormalizado,
        createdAt: serverTimestamp()
      };

      // 3. Salva na coleção unificada 'users', usando o UID gerado pelo Auth
      await setDoc(doc(db, "users", user.uid), tutorData);

      // 4. Publica a sessão no contexto, que a persiste e já libera as rotas
      //    protegidas. createdAt vira Date aqui porque serverTimestamp() é um
      //    marcador que só o Firestore resolve, e não sobrevive ao JSON.
      await registrarSessao({ ...tutorData, createdAt: new Date() });

      // 5. Vincula a conta à clínica ANTES de navegar: sem o vínculo o usuário
      //    ainda é PRE_CADASTRO para a API, e a Home receberia 403 ao buscar
      //    pets e consultas. A espera é limitada, então uma API fora do ar
      //    atrasa alguns segundos mas não impede o cadastro.
      const perfilNaClinica = await garantirVinculoAntesDeNavegar(cpfNormalizado);

      // 6. Se o e-mail já pertence à equipe ou à administração, a API devolve
      //    esse perfil e ele prevalece sobre o "tutor" gravado aqui.
      if (perfilNaClinica && perfilNaClinica !== "tutor") {
        await registrarSessao({ ...tutorData, createdAt: new Date(), tipo: perfilNaClinica });
      }

      const destino =
        perfilNaClinica === "admin"
          ? "/Administracao"
          : perfilNaClinica === "vet"
            ? "/homevet"
            : "/Home";

      avisarEEntao("Sucesso! ✨", "Cadastro realizado com sucesso!", () =>
        router.replace(destino)
      );

    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      let mensagemErro = "Não foi possível realizar o cadastro.";

      if (error.code === "auth/email-already-in-use") {
        mensagemErro = "Este e-mail já está em uso por outra conta. Tente fazer login ou use outro e-mail.";
      } else if (error.code === "auth/invalid-email") {
        mensagemErro = "Formato de e-mail inválido.";
      } else if (error.code === "auth/weak-password") {
        mensagemErro = "A senha escolhida é muito fraca.";
      } else if (error.code === "permission-denied") {
        // A conta foi criada no Authentication, mas o perfil não pôde ser
        // gravado: as regras do Firestore estão negando a escrita.
        mensagemErro =
          "A conta foi criada, mas não conseguimos salvar seu perfil. " +
          "Publique as regras do Firestore (arquivo firestore.rules) e entre pelo login.";
      } else if (error.code === "auth/network-request-failed") {
        mensagemErro = "Sem conexão com o Firebase. Verifique sua internet.";
      }

      avisar("Erro de Cadastro", mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <OndaTop />
      <OndaBottom />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require("./assets/images/olli-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.form}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput 
                style={styles.input} 
                value={nome} 
                onChangeText={setNome}
                placeholder="Digite seu nome"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF</Text>
              <TextInput 
                style={styles.input} 
                value={cpf} 
                onChangeText={(texto) => setCpf(formatarCpf(texto))}
                placeholder="000.000.000-00"
                maxLength={14}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
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
              <Text style={styles.label}>Confirmar senha</Text>
              <TextInput 
                style={styles.input} 
                value={confirmarSenha} 
                onChangeText={setConfirmarSenha}
                placeholder="Repita sua senha"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              activeOpacity={0.8}
              onPress={handleCadastro} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginLink} 
              onPress={() => router.push("/")}
            >
              <Text style={styles.loginLinkText}>Já possuo uma conta</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", overflow: "hidden" },
  scrollContent: { paddingHorizontal: 40, paddingTop: 40, paddingBottom: 40, alignItems: "center" },
  logoContainer: { marginBottom: 10, width: '100%', alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: 210, height: 240 },
  form: { width: "100%" },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: "#000", marginBottom: 5, marginLeft: 10, fontWeight: "500" },
  input: { width: "100%", height: 45, borderWidth: 1.5, borderColor: PRIMARY_YELLOW, borderRadius: 25, paddingHorizontal: 20, fontSize: 16, backgroundColor: "#FFF" },
  button: { backgroundColor: PRIMARY_YELLOW, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginTop: 20, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4 },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  loginLink: { marginTop: 30, alignItems: "center" },
  loginLinkText: { fontSize: 14, color: "#000", textDecorationLine: "underline", fontWeight: "500" },
});