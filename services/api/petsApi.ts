import { chamarApi } from "./clienteApi";

/**
 * Pets — agora vindos exclusivamente do banco da API (nada de AsyncStorage).
 *
 * A API guarda nome, raca, especie e data de nascimento. Cor, porte e sexo nao
 * existem no modelo dela, entao viajam dentro de 'descricao' num prefixo
 * estruturado, preservando o que o app ja mostrava sem alterar o backend.
 */

export type Especie = "CAO" | "GATO";

export type PetApi = {
  id: number;
  nome: string;
  descricao: string | null;
  raca: string;
  especie: Especie;
  dataNascimento: string; // ISO: aaaa-mm-dd
  idade: number;
  responsavelId: number;
  nomeResponsavel: string;
};

/** Pet no formato que as telas do app consomem. */
export type Pet = {
  id: number;
  nome: string;
  raca: string;
  especie: Especie;
  nascimento: string; // dd/mm/aaaa, como o app exibe
  idade: number;
  cor: string;
  porte: string;
  sexo: string;
  info: string;
  nomeResponsavel: string;
};

const MARCADOR_ATRIBUTOS = "[olli]";

/**
 * Empacota os campos que a API nao modela dentro da descricao.
 * Formato: "[olli] cor=Caramelo; porte=Medio; sexo=Macho || bio livre"
 */
function montarDescricao(dados: {
  cor: string;
  porte: string;
  sexo: string;
  info: string;
}): string {
  const atributos = [
    `cor=${dados.cor}`,
    `porte=${dados.porte}`,
    `sexo=${dados.sexo}`,
  ].join("; ");

  const descricao = `${MARCADOR_ATRIBUTOS} ${atributos} || ${dados.info}`;
  // A API limita descricao a 255 caracteres.
  return descricao.slice(0, 255);
}

/** Desempacota a descricao. Tolera pets criados fora do app (ex.: dados do Flyway). */
function lerDescricao(descricao: string | null): {
  cor: string;
  porte: string;
  sexo: string;
  info: string;
} {
  const padrao = {
    cor: "Nao informado",
    porte: "Nao informado",
    sexo: "Nao informado",
    info: "Este pet nao possui uma biografia cadastrada.",
  };

  if (!descricao) return padrao;

  if (!descricao.startsWith(MARCADOR_ATRIBUTOS)) {
    // Pet criado direto na API: a descricao inteira e a biografia.
    return { ...padrao, info: descricao };
  }

  const semMarcador = descricao.slice(MARCADOR_ATRIBUTOS.length).trim();
  const [atributos, ...restoBio] = semMarcador.split("||");
  const bio = restoBio.join("||").trim();

  const valores: Record<string, string> = {};
  atributos.split(";").forEach((par) => {
    const [chave, ...valor] = par.split("=");
    if (chave && valor.length) {
      valores[chave.trim()] = valor.join("=").trim();
    }
  });

  return {
    cor: valores.cor || padrao.cor,
    porte: valores.porte || padrao.porte,
    sexo: valores.sexo || padrao.sexo,
    info: bio || padrao.info,
  };
}

/** aaaa-mm-dd (API) -> dd/mm/aaaa (app) */
export function paraDataBrasileira(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** dd/mm/aaaa (app) -> aaaa-mm-dd (API). Retorna null se a data for invalida. */
export function paraDataIso(brasileira: string): string | null {
  const partes = brasileira.split("/");
  if (partes.length !== 3) return null;

  const [dia, mes, ano] = partes;
  if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return null;

  const data = new Date(`${ano}-${mes}-${dia}T00:00:00`);
  if (Number.isNaN(data.getTime())) return null;

  // Rejeita datas que "existem" por overflow, como 31/02.
  if (data.getDate() !== Number(dia) || data.getMonth() + 1 !== Number(mes)) {
    return null;
  }

  return `${ano}-${mes}-${dia}`;
}

function converter(pet: PetApi): Pet {
  const { cor, porte, sexo, info } = lerDescricao(pet.descricao);
  return {
    id: pet.id,
    nome: pet.nome,
    raca: pet.raca,
    especie: pet.especie,
    nascimento: paraDataBrasileira(pet.dataNascimento),
    idade: pet.idade,
    nomeResponsavel: pet.nomeResponsavel,
    cor,
    porte,
    sexo,
    info,
  };
}

/** Pets do tutor autenticado. */
export async function listarMeusPets(): Promise<Pet[]> {
  const pets = await chamarApi<PetApi[]>("/pets/meus");
  return pets.map(converter);
}

/** Um pet especifico. A API recusa (403) se nao for do tutor autenticado. */
export async function buscarPet(id: number): Promise<Pet> {
  return converter(await chamarApi<PetApi>(`/pets/${id}`));
}

export type DadosPet = {
  nome: string;
  raca: string;
  especie: Especie;
  /** dd/mm/aaaa */
  nascimento: string;
  cor: string;
  porte: string;
  sexo: string;
  info: string;
};

function montarCorpo(dados: DadosPet) {
  const dataNascimento = paraDataIso(dados.nascimento);
  if (!dataNascimento) {
    throw new Error("Data de nascimento invalida. Use o formato dd/mm/aaaa.");
  }

  return {
    nome: dados.nome,
    raca: dados.raca,
    especie: dados.especie,
    dataNascimento,
    descricao: montarDescricao(dados),
  };
}

/** Cadastra o pet no banco, vinculado ao tutor autenticado. */
export async function criarPet(dados: DadosPet): Promise<Pet> {
  const criado = await chamarApi<PetApi>("/pets", {
    metodo: "POST",
    corpo: montarCorpo(dados),
  });
  return converter(criado);
}

/** Atualiza um pet existente. */
export async function atualizarPet(id: number, dados: DadosPet): Promise<Pet> {
  const atualizado = await chamarApi<PetApi>(`/pets/${id}`, {
    metodo: "PUT",
    corpo: montarCorpo(dados),
  });
  return converter(atualizado);
}

/** Remove o pet do banco. */
export async function removerPet(id: number): Promise<void> {
  await chamarApi<void>(`/pets/${id}`, { metodo: "DELETE" });
}

/** Lista paginada para a clinica (perfil VETERINARIO). */
export async function listarTodosOsPets(): Promise<Pet[]> {
  const pagina = await chamarApi<{ content: PetApi[] }>("/pets?size=100");
  return (pagina.content ?? []).map(converter);
}
