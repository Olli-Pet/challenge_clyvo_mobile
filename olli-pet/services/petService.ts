import { db } from "../config/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";


export interface PetData {
  nome: string;
  raca: string;
  sexo: string;
  porte: string;
  nascimento: string;
  objetivo: string;
  uidTutor: string;
  createdAt: Date;
}
// 1. Criamos a "forma do bolo" (Interface)
export interface Pet {
  id?: string;
  nome: string;
  raca: string;
  nascimento?: string;
  cor: string;
  porte: string;
  sexo: string;
  info?: string;
  createdAt?: Date;
}

// 2. Dizemos que o petData segue o formato da Interface Pet
export const savePet = async (petData: PetData) => {
  try {
    const docRef = await addDoc(collection(db, "pets"), petData);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao salvar pet: ", e);
  }
};

// 3. Tipamos o callback também para a Home não reclamar depois
export const subscribePets = (callback: (pets: Pet[]) => void) => {
  const q = query(collection(db, "pets"), orderBy("nome", "asc"));
  return onSnapshot(q, (snapshot) => {
    const pets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pet[]; // Forçamos o tipo para o array de Pets
    callback(pets);
  });
};