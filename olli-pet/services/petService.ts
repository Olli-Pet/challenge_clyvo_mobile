import { db, auth } from "../config/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, where } from "firebase/firestore";

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

// 2. Função para salvar o Pet no Firestore (Injetando o ID real do Tutor logado)
export const savePet = async (petData: Pet) => {
  try {
    // Pega o usuário logado de verdade no momento do cadastro
    const usuarioAtual = auth.currentUser;

    if (!usuarioAtual) {
      throw new Error("Nenhum usuário logado para associar o pet!");
    }

    // Mescla os dados do formulário com o UID real do tutor
    const dadosFinais = {
      ...petData,
      uidTutor: usuarioAtual.uid,
      createdAt: new Date() // Garante a data atualizada de criação
    };

    const docRef = await addDoc(collection(db, "pets"), dadosFinais);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao salvar pet: ", e);
    throw e; // Lança o erro para que a tela saiba que falhou e tire o "loading"
  }
};

// 3. Função para escutar os pets em tempo real (Filtrando APENAS os do tutor atual)
export const subscribePets = (callback: (pets: Pet[]) => void) => {
  // Pega quem está logado usando o app
  const usuarioAtual = auth.currentUser;

  // Se ninguém estiver logado, evita crashar o app e retorna uma lista vazia
  if (!usuarioAtual) {
    callback([]);
    return () => {};
  }

  // MONTA A QUERY FILTRADA: Onde o 'uidTutor' do pet seja IGUAL ao 'uid' do usuário atual
  const q = query(
    collection(db, "pets"), 
    where("uidTutor", "==", usuarioAtual.uid),
    orderBy("nome", "asc")
  );
  
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