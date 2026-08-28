/**
 * O pacote @firebase/auth expõe `getReactNativePersistence` apenas no build
 * React Native (dist/rn/index.rn.d.ts). O TypeScript, porém, casa a condição
 * "types" do campo `exports` antes da condição "react-native", e acaba
 * carregando os typings web (dist/auth-public.d.ts), que não declaram
 * essa função.
 *
 * O Metro resolve o módulo corretamente em runtime, então aqui apenas
 * completamos a tipagem que falta. O `import` abaixo mantém este arquivo
 * como um módulo, de forma que o bloco `declare module` AUMENTE os tipos
 * existentes em vez de substituí-los.
 *
 * Pode ser removido quando o Firebase publicar `getReactNativePersistence`
 * nos typings padrão. Ver: https://github.com/firebase/firebase-js-sdk/issues/7615
 */
import type { Persistence } from "@firebase/auth";

declare module "@firebase/auth" {
  /**
   * Cria uma Persistence apoiada num storage assíncrono (AsyncStorage),
   * para manter a sessão do usuário entre execuções do app.
   */
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
