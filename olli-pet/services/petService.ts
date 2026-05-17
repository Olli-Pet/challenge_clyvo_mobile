import { db } from "../config/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

// 1. Uma única interface unificada com todos os campos que você usa no app
export interface Pet {
  id?: string;
  nome: string;
  raca: string;
  sexo: string;
  porte: string;
  nascimento: string;
  objetivo?: string;  // Opcional se não for usado em todas as telas
  cor?: string;      // Opcional para evitar erros entre telas
  info?: string;     // Opcional para detalhes extras
  uidTutor?: string; // Opcional para amarrar ao dono
  createdAt: Date;
}

// 2. Função para salvar o Pet no Firestore
export const savePet = async (petData: Pet) => {
  try {
    const docRef = await addDoc(collection(db, "pets"), petData);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao salvar pet: ", e);
    throw e; // Lança o erro para que a tela saiba que falhou e tire o "loading"
  }
};

// 3. Função para escutar os pets em tempo real (Home)
export const subscribePets = (callback: (pets: Pet[]) => void) => {
  const q = query(collection(db, "pets"), orderBy("nome", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const pets = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nome: data.nome || "",
        raca: data.raca || "",
        sexo: data.sexo || "",
        porte: data.porte || "",
        nascimento: data.nascimento || "",
        objetivo: data.objetivo || "",
        cor: data.cor || "",
        info: data.info || "",
        uidTutor: data.uidTutor || "",
        // Converte o Timestamp do Firebase de volta para Date se existir
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      } as Pet;
    });
    
    callback(pets);
  }, (error) => {
    console.error("Erro no onSnapshot dos pets:", error);
  });
};