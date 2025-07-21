"use client"

import CadastroInseminacao from "@/app/reproducao/coberturas/cadastrar/page";

// Componente de exportação para uso em outras rotas (ex: editar)
export function CadastroInseminacaoForm(props: any) {
  // Garante que initialData seja passado como initialData e não sobrescreva o estado local do formulário
  return <CadastroInseminacao {...props} initialData={props.initialData} />;
}
