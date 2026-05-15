import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

interface PetCircleProps {
  name: string;
  imageUri?: string;
  selected?: boolean;
  onPress?: () => void;
}

export default function PetCircle({ name, imageUri, selected, onPress }: PetCircleProps) {
  return (
    <TouchableOpacity style={styles.petItem} onPress={onPress} activeOpacity={0.7}>
      <View style={selected ? styles.petCircleSelected : styles.petCircle}>
        <Image source={require ("@/assets/images/dog.png")} style={styles.petImage} />
      </View>
      <Text style={styles.petName}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  petItem: { alignItems: "center", marginRight: 20 },
  petCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: "#FDCB5C", overflow: "hidden",
  },
  petCircleSelected: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: "#FDCB5C", overflow: "hidden",
    elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3,
  },
  petImage: { width: "100%", height: "100%" },
  petName: { marginTop: 5, fontSize: 14, fontWeight: "500" },
});