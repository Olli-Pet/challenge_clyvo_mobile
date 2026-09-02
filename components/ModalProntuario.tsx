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

// O pet vem do banco da clinica; a tipagem e a mesma do servico.
import { Pet } from "@/services/api/petsApi";

interface ModalProntuarioProps {
  visible: boolean;
  onClose: () => void;
  pet: Pet | null;
}

export default function ModalProntuario({ visible, onClose, pet }: ModalProntuarioProps) {
  
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
              <Text style={styles.infoText}><Text style={styles.bold}>• Queixa Principal:</Text> Check-up preventivo de rotina e acompanhamento de bem-estar.</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>• Alimentação:</Text> Ração super premium seca combinada com sachê úmido (2x ao dia).</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>• Vacinação & Vermífugo:</Text> Carteira de vacinação V10, Antirrábica e vermífugos 100% em dia.</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>• Histórico Comportamental:</Text> {pet?.info || "Sem observações comportamentais relevantes relatadas pelo tutor."}</Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.sectionLabel}>LAUDO</Text>
              
              <View style={styles.laudoItem}>
                <Text style={styles.laudoTitle}>Cirurgia de castração - 05/07/2020</Text>
                <Text style={styles.laudoDetail}>• Local: Clínica WE Vets</Text>
                <Text style={styles.laudoDetail}>• Médico: André Rosa</Text>
              </View>

              <View style={[styles.laudoItem, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
                <Text style={styles.laudoTitle}>Cirurgia de amputação - 20/05/2020</Text>
                <Text style={styles.laudoDetail}>• Local: Clínica WE Vets</Text>
                <Text style={styles.laudoDetail}>• Médico: André Rosa</Text>
              </View>
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