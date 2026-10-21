// Local no projeto: app/adocoes/page.tsx (SUBSTITUA o arquivo existente)
import { createClient } from '@/utils/supabase/server'
import KanbanAdocoes from '@/components/KanbanAdocoes'

export default async function AdocoesPage() {
  const supabase = await createClient()

  // Garante que todo animal tenha um cartão no kanban (animais cadastrados
  // antes do gatilho do banco não tinham linha em "adocoes").
  const { data: todosAnimais } = await supabase.from('animais').select('id')
  const { data: existentes } = await supabase.from('adocoes').select('animal_id')
  const comCartao = new Set((existentes ?? []).map((x: any) => x.animal_id))
  const semCartao = (todosAnimais ?? []).filter((a: any) => !comCartao.has(a.id))
  if (semCartao.length > 0) {
    await supabase.from('adocoes').insert(semCartao.map((a: any) => ({ animal_id: a.id, etapa: 'aguardando_adocao' })))
  }

  const { data: adocoes } = await supabase
    .from('adocoes')
    .select('id, etapa, pessoa_id, animais(id, nome, especie, raca, descricao, castrado, data_nascimento_estimada, data_castracao_prevista), pessoas(id, nome)')

  const { data: pessoasTodas } = await supabase.from('vw_pessoas_com_cargos').select('*').order('nome')
  const pessoasAdotantes = (pessoasTodas ?? []).filter((p: any) => (p.cargos as string)?.includes('Adotante'))

  return (
    <>
      <div className="page-header">
        <h1>Adoções</h1>
        <p>Arraste os cartões entre as etapas, e use &quot;Vincular adotante&quot; para ligar um adotante já cadastrado</p>
      </div>
      <KanbanAdocoes adocoes={(adocoes ?? []) as any} pessoasAdotantes={pessoasAdotantes} />
    </>
  )
}
