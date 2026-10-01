// Local no projeto: app/clinico/page.tsx (arquivo novo)
import { createClient } from '@/utils/supabase/server'
import KanbanClinico from '@/components/KanbanClinico'
import IniciarTratamentoForm from '@/components/IniciarTratamentoForm'

export default async function ClinicoPage() {
  const supabase = await createClient()

  const { data: tratamentos } = await supabase
    .from('tratamentos')
    .select('id, etapa, animais(id, nome, especie, raca, descricao)')

  const { data: animais } = await supabase.from('animais').select('id, nome')
  const idsComTratamentoAtivo = new Set(
    (tratamentos ?? [])
      .filter((t) => t.etapa !== 'concluido')
      .map((t) => (t.animais as any)?.id)
  )
  const animaisSemTratamento = (animais ?? []).filter((a) => !idsComTratamentoAtivo.has(a.id))

  return (
    <>
      <div className="page-header">
        <h1>Controle clínico</h1>
        <p>Arraste os cartões conforme o tratamento avança</p>
      </div>

      <IniciarTratamentoForm animaisSemTratamento={animaisSemTratamento} />

      <KanbanClinico tratamentos={(tratamentos ?? []) as any} />
    </>
  )
}
