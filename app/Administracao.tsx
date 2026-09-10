import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ErroApi } from "@/services/api/clienteApi";
import { avisar, confirmar } from "@/services/avisar";
import { useAutenticacao } from "@/contexts/AuthContext";
import {
  useCadastrarVeterinario,
  useEquipe,
  useRemoverVeterinario,
  useTutores,
} from "@/hooks/useAdmin";
import { apenasDigitos } from "@/services/api/autenticacaoApi";

const ROXO = "#7B5CD6";

/** Máscara 000.000.000-00 enquanto a administração digita. */
function formatarCpf(texto: string): string {
  const numeros = texto.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 3) return numeros;
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  if (numeros.length <= 9) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
  }
  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

type Aba = "equipe" | "tutores";

export default function Administracao() {
  const { usuario, sair } = useAutenticacao();
  const [aba, setAba] = useState<Aba>("equipe");
  const [formularioAberto, setFormularioAberto] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [crmv, setCrmv] = useState("");
  const [especialidade, setEspecialidade] = useState("");

  const { data: equipe = [], isPending: carregandoEquipe } = useEquipe();
  const { data: tutores = [], isPending: carregandoTutores } = useTutores();

  const { mutateAsync: cadastrar, isPending: cadastrando } = useCadastrarVeterinario();
  const { mutateAsync: remover } = useRemoverVeterinario();

  const mensagemDeErro = (erro: unknown, padrao: string) =>
    erro instanceof ErroApi ? erro.message : padrao;

  const limparFormulario = () => {
    setNome("");
    setEmail("");
    setCpf("");
    setCrmv("");
    setEspecialidade("");
    setFormularioAberto(false);
  };

  const cadastrarVeterinario = async () => {
    if (!nome.trim() || !email.trim() || !cpf.trim() || !crmv.trim()) {
      avisar("Atenção", "Preencha nome, e-mail, CPF e CRMV.");
      return;
    }

    if (apenasDigitos(cpf).length !== 11) {
      avisar("Atenção", "O CPF precisa ter 11 dígitos.");
      return;
    }

    try {
      const criado = await cadastrar({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        cpf: apenasDigitos(cpf),
        crmv: crmv.trim(),
        especialidade: especialidade.trim() || undefined,
      });

      limparFormulario();
      avisar(
        "Veterinário cadastrado",
        `${criado.nome} já pode acessar o app pelo "Primeiro acesso", usando o e-mail cadastrado.`
      );
    } catch (erro) {
      console.error("Erro ao cadastrar veterinário:", erro);
      avisar("Não foi possível cadastrar", mensagemDeErro(erro, "Tente novamente."));
    }
  };

  const removerDaEquipe = (id: number, nomeVet: string) => {
    confirmar(
      "Remover da equipe",
      `${nomeVet} perderá o acesso ao app e deixará de aparecer para agendamento. ` +
        "As consultas que já atendeu continuam no histórico.",
      async () => {
        try {
          await remover(id);
          avisar("Pronto", `${nomeVet} foi removido(a) da equipe.`);
        } catch (erro) {
          console.error("Erro ao remover veterinário:", erro);
          avisar("Não foi possível remover", mensagemDeErro(erro, "Tente novamente."));
        }
      },
      "Remover"
    );
  };

  const sairDaConta = () => {
    confirmar("Sair da conta", "Deseja encerrar a sessão?", async () => {
      await sair();
    }, "Sair");
  };

  return (
    <SafeAreaView style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor={ROXO} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={estilos.faixa}>
            <View style={estilos.faixaTopo}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.faixaTitulo}>Administração</Text>
                <Text style={estilos.faixaSub}>Olá, {usuario?.nome || "Clínica"}!</Text>
              </View>
              <TouchableOpacity onPress={sairDaConta}>
                <Ionicons name="log-out-outline" size={26} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={estilos.faixaDesc}>
              Cadastre a equipe clínica e acompanhe os usuários da plataforma.
            </Text>
          </View>

          <View style={estilos.abas}>
            <TouchableOpacity
              style={[estilos.aba, aba === "equipe" && estilos.abaAtiva]}
              onPress={() => setAba("equipe")}
            >
              <Text style={[estilos.abaTexto, aba === "equipe" && estilos.abaTextoAtivo]}>
                Equipe ({equipe.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[estilos.aba, aba === "tutores" && estilos.abaAtiva]}
              onPress={() => setAba("tutores")}
            >
              <Text style={[estilos.abaTexto, aba === "tutores" && estilos.abaTextoAtivo]}>
                Tutores ({tutores.length})
              </Text>
            </TouchableOpacity>
          </View>

          {aba === "equipe" && (
            <>
              {!formularioAberto ? (
                <TouchableOpacity
                  style={estilos.botao}
                  onPress={() => setFormularioAberto(true)}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                  <Text style={estilos.botaoTexto}>Cadastrar veterinário</Text>
                </TouchableOpacity>
              ) : (
                <View style={estilos.formulario}>
                  <Text style={estilos.formularioTitulo}>Novo veterinário</Text>
                  <Text style={estilos.formularioAviso}>
                    Ele criará a senha no primeiro acesso, com o e-mail informado aqui.
                  </Text>

                  <Text style={estilos.rotulo}>Nome completo</Text>
                  <TextInput
                    style={estilos.campo}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Dr(a). ..."
                    placeholderTextColor="#999"
                  />

                  <Text style={estilos.rotulo}>E-mail profissional</Text>
                  <TextInput
                    style={estilos.campo}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="nome@ollipet.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={estilos.rotulo}>CPF</Text>
                  <TextInput
                    style={estilos.campo}
                    value={cpf}
                    onChangeText={(texto) => setCpf(formatarCpf(texto))}
                    placeholder="000.000.000-00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={14}
                  />

                  <Text style={estilos.rotulo}>CRMV</Text>
                  <TextInput
                    style={estilos.campo}
                    value={crmv}
                    onChangeText={setCrmv}
                    placeholder="SP-00000"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                  />

                  <Text style={estilos.rotulo}>Especialidade (opcional)</Text>
                  <TextInput
                    style={estilos.campo}
                    value={especialidade}
                    onChangeText={setEspecialidade}
                    placeholder="Clínica Geral, Dermatologia..."
                    placeholderTextColor="#999"
                  />

                  <View style={estilos.acoes}>
                    <TouchableOpacity
                      style={[estilos.acao, estilos.acaoSecundaria]}
                      onPress={limparFormulario}
                    >
                      <Text style={estilos.acaoSecundariaTexto}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[estilos.acao, { backgroundColor: ROXO }]}
                      onPress={cadastrarVeterinario}
                      disabled={cadastrando}
                    >
                      {cadastrando ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={estilos.acaoTexto}>Cadastrar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {carregandoEquipe ? (
                <ActivityIndicator color={ROXO} style={{ marginTop: 20 }} />
              ) : equipe.length === 0 ? (
                <Text style={estilos.vazio}>Nenhum veterinário cadastrado.</Text>
              ) : (
                equipe.map((vet) => (
                  <View key={vet.id} style={estilos.cartao}>
                    <View style={estilos.avatar}>
                      <Ionicons name="medkit" size={22} color="#FFF" />
                    </View>

                    <View style={estilos.cartaoTexto}>
                      <Text style={estilos.cartaoTitulo}>{vet.nome}</Text>
                      <Text style={estilos.cartaoSub}>
                        {vet.crmv}
                        {vet.especialidade ? ` · ${vet.especialidade}` : ""}
                      </Text>
                      <Text style={estilos.cartaoEmail}>{vet.email}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => removerDaEquipe(vet.id, vet.nome)}
                      style={estilos.botaoIcone}
                    >
                      <Ionicons name="trash-outline" size={20} color="#D64545" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          )}

          {aba === "tutores" && (
            <>
              {carregandoTutores ? (
                <ActivityIndicator color={ROXO} style={{ marginTop: 20 }} />
              ) : tutores.length === 0 ? (
                <Text style={estilos.vazio}>Nenhum tutor cadastrado.</Text>
              ) : (
                tutores.map((tutor) => (
                  <View key={tutor.id} style={estilos.cartao}>
                    <View style={[estilos.avatar, { backgroundColor: "#E7B84C" }]}>
                      <Ionicons name="person" size={22} color="#FFF" />
                    </View>

                    <View style={estilos.cartaoTexto}>
                      <Text style={estilos.cartaoTitulo}>{tutor.nome}</Text>
                      <Text style={estilos.cartaoEmail}>{tutor.email}</Text>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  conteudo: { paddingBottom: 60 },
  faixa: {
    backgroundColor: ROXO,
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  faixaTopo: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  faixaTitulo: { fontSize: 22, fontWeight: "bold", color: "#FFF" },
  faixaSub: { fontSize: 15, color: "#E8E0FF", marginTop: 2, fontWeight: "600" },
  faixaDesc: { fontSize: 13, color: "#DDD4FF", marginTop: 8 },
  abas: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  aba: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  abaAtiva: { backgroundColor: "#F0EBFF", borderColor: ROXO },
  abaTexto: { fontSize: 13, color: "#666", fontWeight: "600" },
  abaTextoAtivo: { color: ROXO, fontWeight: "700" },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: ROXO,
    height: 46,
    borderRadius: 23,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  botaoTexto: { color: "#FFF", fontWeight: "bold", fontSize: 15 },
  formulario: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 1,
  },
  formularioTitulo: { fontSize: 16, fontWeight: "bold", color: "#222" },
  formularioAviso: { fontSize: 12, color: "#7A6BA8", marginTop: 4, lineHeight: 17 },
  rotulo: { fontSize: 13, fontWeight: "600", color: "#444", marginTop: 14, marginBottom: 6 },
  campo: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#222",
  },
  acoes: { flexDirection: "row", gap: 8, marginTop: 20 },
  acao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  acaoTexto: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  acaoSecundaria: { backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#DDD" },
  acaoSecundariaTexto: { color: "#666", fontSize: 14, fontWeight: "600" },
  cartao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 12,
    elevation: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: ROXO,
    justifyContent: "center",
    alignItems: "center",
  },
  cartaoTexto: { flex: 1 },
  cartaoTitulo: { fontSize: 15, fontWeight: "bold", color: "#222" },
  cartaoSub: { fontSize: 12, color: "#666", marginTop: 2 },
  cartaoEmail: { fontSize: 11, color: "#999", marginTop: 2 },
  botaoIcone: { padding: 6 },
  vazio: { textAlign: "center", color: "#999", marginTop: 30, fontStyle: "italic" },
});
