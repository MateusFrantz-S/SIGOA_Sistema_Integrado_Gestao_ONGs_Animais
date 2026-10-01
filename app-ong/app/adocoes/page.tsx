// Local no projeto: app/adocoes/page.tsx (arquivo novo)
import { createClient } from '@/utils/supabase/server'
import KanbanAdocoes from '@/components/KanbanAdocoes'

export default async function AdocoesPage() {
  const supabase = await createClient()

  const { data: adocoes } = await supabase
    .from('adocoes')
    .select('id, etapa, pessoa_id, animais(id, nome, especie, raca, descricao, castrado, data_nascimento_estimada), pessoas(id, nome)')

  const { data: pessoasTodas } = await supabase.from('vw_pessoas_com_cargos').select('*')
  const pessoasAdotantes = (pessoasTodas ?? []).filter((p: any) => p.cargos?.includes('Adotante'))

  return (
    <>
      <div className="page-header">
        <h1>Adoções</h1>
        <p>Arraste os cartões entre as etapas, e use &quot;Vincular pessoa&quot; para ligar um adotante já cadastrado</p>
      </div>
      <KanbanAdocoes adocoes={(adocoes ?? []) as any} pessoasAdotantes={pessoasAdotantes} />
    </>
  )
}
