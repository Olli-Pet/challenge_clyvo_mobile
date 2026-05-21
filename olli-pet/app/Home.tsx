import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

// Importando o AsyncStorage para ler os dados do aparelho
import AsyncStorage from "@react-native-async-storage/async-storage";

// Seus componentes
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import PetCircle from "@/components/PetCircle";
import CardEventos from "@/components/CardEventos";
import BotaoIA from "@/components/BotaoIA";

// Definição da tipagem local do Pet para o TypeScript ficar feliz
interface Pet {
  id: string;
  nome: string;
  raca: string;
  cor: string;
  porte: string;
  sexo: string;
  nascimento: string;
  info: string;
  uidTutor: string;
}

export default function Home() {
  const [meusPets, setMeusPets] = useState<Pet[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navigation = useNavigation();

  // Função para carregar os dados locais do mini-banco
  const carregarDadosLocais = async () => {
    try {
      setCarregando(true);

      // 1. Verificar quem é o usuário logado atual
      const usuarioLogadoRaw = await AsyncStorage.getItem("@olli_user_logado");
      const usuarioLogado = usuarioLogadoRaw ? JSON.parse(usuarioLogadoRaw) : null;

      if (!usuarioLogado) {
        // Se por algum motivo bizarro não tiver ninguém logado, manda de volta pra index
        router.replace("/");
        return;
      }

      // 2. Buscar todos os pets salvos no aparelho
      const petsExistentesRaw = await AsyncStorage.getItem("@olli_pets");
      const todosOsPets: Pet[] = petsExistentesRaw ? JSON.parse(petsExistentesRaw) : [];

      // 3. Filtrar com segurança: só exibe os pets que pertencem ao tutor logado!
      const petsDoTutor = todosOsPets.filter(pet => pet.uidTutor === usuarioLogado.uid);

      setMeusPets(petsDoTutor);
    } catch (error) {
      console.error("Erro ao carregar dados locais na Home:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Executa assim que a tela monta e também toda vez que a tela ganha foco novamente
  useEffect(() => {
    carregarDadosLocais();

    // Adiciona um listener para atualizar a lista automaticamente sempre que voltar de outra tela
    const unsubscribe = navigation.addListener("focus", () => {
      carregarDadosLocais();
    });

    return unsubscribe;
  }, [navigation]);

  // Navegação passando os parâmetros limpos para a PetProfile
  const navegarParaPerfil = (pet: Pet) => {
    router.push({
      pathname: "/petprofile",
      params: {
        nome: pet.nome,
        raca: pet.raca,
        cor: pet.cor,
        porte: pet.porte,
        sexo: pet.sexo,
        nascimento: pet.nascimento,
        info: pet.info,
      },
    });
  };

  // Enquanto lê a memória do celular, mostra o feedback visual
  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FDCB5C" />
        <Text style={styles.loadingText}>Carregando seus pets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDCB5C" />
      
      <Header />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* CARROSSEL DE PETS DINÂMICO LOCAL */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.petsCarousel}
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {/* Renderiza a lista de pets vindas do dispositivo */}
          {meusPets.map((pet) => (
            <PetCircle 
              key={pet.id} 
              name={pet.nome} 
              raca={pet.raca} 
              onPress={() => navegarParaPerfil(pet)} 
            />
          ))}

          {/* Mensagem amigável caso o usuário não tenha pets cadastrados */}
          {meusPets.length === 0 && (
            <View style={{ justifyContent: "center", paddingHorizontal: 10, marginRight: 10 }}>
              <Text style={{ fontSize: 13, color: "#666", fontStyle: "italic" }}>Nenhum pet cadastrado...</Text>
            </View>
          )}

          {/* BOTÃO ADICIONAR */}
          <View style={styles.petItem}>
            <TouchableOpacity 
              style={styles.addButton}
              activeOpacity={0.7}
              onPress={() => router.push("/addpet")}
            >
              <Ionicons name="add" size={35} color="black" />
            </TouchableOpacity>
            <Text style={styles.petName}>Adicionar</Text>
          </View>
        </ScrollView>

        {/* TÍTULO SEÇÃO */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="list" size={24} color="black" />
            <Text style={styles.sectionTitle}>Últimos Eventos</Text>
          </View>
          
          <TouchableOpacity onPress={() => router.push("/historicopet")}>
            <Text style={styles.verTudo}>ver tudo</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DE EVENTOS ESTRUTURAIS */}
        <CardEventos 
          title="Cirurgia de castração"
          petName="Nina"
          date="05/07/2020"
          doctor="André Rosa"
          clinic="WE Vets"
          status="finalizada"
        />

        <CardEventos 
          title="Cirurgia de amputação"
          petName="Pipo"
          date="20/05/2020"
          doctor="André Rosa"
          clinic="WE Vets"
          status="finalizada"
        />

      </ScrollView>

      <BotaoIA />
      <Navbar />
    </SafeAreaView>
  );
}

// Seus estilos intocados e perfeitos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  loadingText: { marginTop: 10, fontSize: 14, color: "#666" },
  scrollContent: { paddingBottom: 120 },
  petsCarousel: { paddingVertical: 20, paddingLeft: 20, maxHeight: 140 },
  petItem: { alignItems: "center", marginRight: 20 },
  addButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FDCB5C", justifyContent: "center", alignItems: "center", elevation: 3 },
  petName: { marginTop: 5, fontSize: 14, fontWeight: "500", color: "#000" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 10, marginBottom: 15 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 10, color: "#000" },
  verTudo: { fontSize: 16, color: "#333" }
});