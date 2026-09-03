import { Alert, Platform } from "react-native";

/**
 * Mostra um aviso ao usuário em qualquer plataforma.
 *
 * `Alert.alert` do React Native não faz nada no web — a tela simplesmente não
 * reage, o que faz um erro real parecer "o botão não funciona". No navegador
 * usamos o alert nativo; no celular, o Alert do RN.
 */
export function avisar(titulo: string, mensagem: string): void {
  if (Platform.OS === "web") {
    // eslint-disable-next-line no-alert
    window.alert(`${titulo}\n\n${mensagem}`);
    return;
  }

  Alert.alert(titulo, mensagem);
}

/**
 * Versão com callback executado após o usuário confirmar.
 * No web o `window.alert` é bloqueante, então o callback roda logo em seguida.
 */
export function avisarEEntao(titulo: string, mensagem: string, aoConfirmar: () => void): void {
  if (Platform.OS === "web") {
    // eslint-disable-next-line no-alert
    window.alert(`${titulo}\n\n${mensagem}`);
    aoConfirmar();
    return;
  }

  Alert.alert(titulo, mensagem, [{ text: "OK", onPress: aoConfirmar }]);
}

/**
 * Pede confirmação antes de uma ação destrutiva.
 *
 * Assim como o Alert com botões, o diálogo do React Native não aparece no web;
 * lá usamos o window.confirm, que é bloqueante e devolve a escolha direto.
 */
export function confirmar(
  titulo: string,
  mensagem: string,
  aoConfirmar: () => void,
  textoConfirmar = "Confirmar"
): void {
  if (Platform.OS === "web") {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${titulo}\n\n${mensagem}`)) {
      aoConfirmar();
    }
    return;
  }

  Alert.alert(titulo, mensagem, [
    { text: "Cancelar", style: "cancel" },
    { text: textoConfirmar, style: "destructive", onPress: aoConfirmar },
  ]);
}
