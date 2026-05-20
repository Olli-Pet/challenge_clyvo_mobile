import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Configurações e Serviços do Firebase
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { subscribePets, Pet } from "@/services/petService";

// Seus componentes
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import PetCircle from "@/components/PetCircle";
import CardEventos from "@/components/CardEventos";
import BotaoIA from "@/components/BotaoIA";

export default function Home() {
  // Estados para gerenciar os pets do banco e o carregamento do login
  const [meusPets, setMeusPets] = useState<Pet[]>([]);
  const [checandoLogin, setChecandoLogin] = useState(true);

  // 1. ESCUTADOR EM TEMPO REAL DO FIREBASE
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setChecandoLogin(false);

        // Ativa o ouvinte do Firestore trazendo apenas os pets desse tutor logado
        const unsubscribePets = subscribePets((petsCarregados) => {
          setMeusPets(petsCarregados);
        });

        return () => unsubscribePets();
      } else {
        setChecandoLogin(false);
        // Opcional: router.replace("/login") se você tiver uma tela de login
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. FUNÇÃO QUE PASSA OS DADOS DO PET CLICADO PARA A PRÓXIMA TELA
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

  // Enquanto o Firebase valida quem é você, mostra uma rodinha de carregamento linda
  if (checandoLogin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FDCB5C" />
        <Text style={styles.loadingText}>Sincronizando conta...</Text>
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
        
        {/* CARROSSEL DE PETS DINÂMICO */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.petsCarousel}
        >
          {/* MAP VARIANDO OS PETS REAIS DO BANCO DE DADOS */}
          {meusPets.map((pet) => (
            <PetCircle 
              key={pet.id} 
              name={pet.nome} 
              raca={pet.raca} // Repassa a raça para o componente escolher a imagem certa
              onPress={() => navegarParaPerfil(pet)} // Roda a navegação enviando os dados
            />
          ))}

          {/* Se a lista estiver vazia, avisa a dona */}
          {meusPets.length === 0 && (
            <View style={{ justifyContent: "center", paddingHorizontal: 10 }}>
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

        {/* LISTA DE EVENTOS (Estáticos por enquanto) */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  scrollContent: {
    paddingBottom: 120, 
  },
  petsCarousel: {
    paddingVertical: 20,
    paddingLeft: 20,
    maxHeight: 140, 
  },
  petItem: {
    alignItems: "center",
    marginRight: 20,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FDCB5C",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    boxShadow: "0px 2px 2px rgba(0,0,0,0.2)",
  },
  petName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#000",
  },
  verTudo: {
    fontSize: 16,
    color: "#333",
  }
});