import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

interface PetCircleProps {
  name: string;
  raca?: string; 
  selected?: boolean;
  onPress?: () => void;
}

export default function PetCircle({ name, raca = "", selected, onPress }: PetCircleProps) {
  
  const obterImagemPorRaca = (termo: string) => {
    const busca = termo.toLowerCase();
    if (busca.includes("cavalo")) {
      return require("../app/assets/images/cavalo.png"); 
    }
    if (busca.includes("ornitorrinco")) {
      return require("../app/assets/images/ornitorrinco.png");
    }
    // Padrão se for dog ou outra coisa
    return require("../app/assets/images/dog.png");
  };

  return (
    <TouchableOpacity style={styles.petItem} onPress={onPress} activeOpacity={0.7}>
      <View style={selected ? styles.petCircleSelected : styles.petCircle}>
        <Image 
          source={obterImagemPorRaca(raca || name)} 
          style={styles.petImage} 
          resizeMode="cover"
        />
      </View>
      <Text style={styles.petName}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  petItem: { alignItems: "center", marginRight: 20 },
  petCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#FDCB5C",
    overflow: "hidden",
    backgroundColor: "#FFF"
  },
  petCircleSelected: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#E0A82E", 
    overflow: "hidden",
    backgroundColor: "#FFF"
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  petName: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#000"
  }
});