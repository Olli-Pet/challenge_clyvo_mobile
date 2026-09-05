import React from "react";
import { 
  Modal, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// O pet e o historico vem do banco da clinica.
import { Pet } from "@/services/api/petsApi";
import { useConsultasDoPet } from "@/hooks/useConsultas";
import { dataDoEvento, DESCRICAO_STATUS } from "@/services/api/consultasApi";

interface ModalProntuarioProps {
  visible: boolean;
  onClose: () => void;
  pet: Pet | null;
}

export default function ModalProntuario({ visible, onClose, pet }: ModalProntuarioProps) {
  // Laudos reais: as consultas registradas para este pet.
  const { data: consultas = [] } = useConsultasDoPet(pet?.id ?? null);

  
  const obterImagemPet = (termo: string) => {
    const busca = termo?.toLowerCase() || "";
    if (busca.includes("cavalo")) return require("@/app/assets/images/cavalo.png");
    if (busca.includes("ornitorrinco")) return require("@/app/assets/images/ornitorrinco.png");
    return require("@/app/assets/images/dog.png");
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>PRONTUÁRIO PET</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={30} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>

            <View style={styles.cardInfo}>
              <Image 
                source={obterImagemPet(pet?.raca || "")} 
                style={styles.modalAvatar}
                resizeMode="cover"
              />
              <View style={styles.cardInfoText}>
                <Text style={styles.sectionLabel}>PET</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Nome:</Text> {pet?.nome || "Não informado"}</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Raça do pet:</Text> {pet?.raca || "Não informada"}</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Ano nascimento:</Text> {pet?.nascimento || "2023"}</Text>
              </View>
            </View>

            <View style={styles.cardInfo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>RESPONSÁVEL</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Nome:</Text> Mirelly Sousa Alves</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Data de nascimento:</Text> 01/02/2000</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>E-mail:</Text> mirellysousa@gmail.com</Text>
                
                <View style={styles.row}>
                  <Text style={[styles.infoText, { flex: 1 }]}><Text style={styles.bold}>Telefone:</Text> 11 4002-8922</Text>
                  <Text style={[styles.infoText, { flex: 1 }]}><Text style={styles.bold}>CPF:</Text> 555.222.333.55</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.sectionLabel}>FICHA DE ANAMNESE CLÍNICA</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>• Espécie:</Text> {pet?.especie === "GATO" ? "Gato" : "Cão"} · {pet?.raca}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>• Idade:</Text> {pet?.idade} ano(s) — nascido em {pet?.nascimento}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>• Características:</Text> Porte {pet?.porte?.toLowerCase()}, pelagem {pet?.cor?.toLowerCase()}, sexo {pet?.sexo?.toLowerCase()}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>• Responsável:</Text> {pet?.nomeResponsavel}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>• Histórico Comportamental:</Text> {pet?.info || "Sem observações comportamentais relevantes relatadas pelo tutor."}</Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.sectionLabel}>LAUDO</Text>

              {consultas.length === 0 ? (
                <Text style={styles.laudoDetail}>
                  Nenhum atendimento registrado para {pet?.nome} até o momento.
                </Text>
              ) : (
                consultas.map((consulta, indice) => (
                  <View
                    key={consulta.id}
                    style={[
                      styles.laudoItem,
                      indice === consultas.length - 1 && {
                        borderBottomWidth: 0,
                        paddingBottom: 0,
                        marginBottom: 0,
                      },
                    ]}
                  >
                    <Text style={styles.laudoTitle}>
                      {consulta.motivo} - {dataDoEvento(consulta.dataHora)}
                    </Text>
                    <Text style={styles.laudoDetail}>• Médico: {consulta.nomeVeterinario}</Text>
                    <Text style={styles.laudoDetail}>
                      • {consulta.observacoes || DESCRICAO_STATUS[consulta.status]}
                    </Text>
                  </View>
                ))
              )}
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    justifyContent: "flex-end", 
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "85%", 
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.5,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  cardInfo: {
    borderWidth: 1.5,
    borderColor: "#FDCB5C",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#FFF",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  modalAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    backgroundColor: "#EEE",
  },
  cardInfoText: {
    flex: 1,
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    width: "100%",
  },
  infoText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "600",
    color: "#000",
  },
  row: {
    flexDirection: "row",
    width: "100%",
    marginTop: 2,
  },

  laudoItem: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#FFEBBF",
    paddingBottom: 10,
    marginBottom: 10,
  },
  laudoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  laudoDetail: {
    fontSize: 13,
    color: "#333",
    marginLeft: 5,
    marginBottom: 2,
  },
});