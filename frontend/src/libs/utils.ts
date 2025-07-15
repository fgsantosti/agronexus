// Função utilitária para concatenar classes CSS de forma segura
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
