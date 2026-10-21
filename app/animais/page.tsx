// Local no projeto: app/animais/page.tsx (SUBSTITUA o arquivo existente)
import { createClient } from '@/utils/supabase/server'
import NovoAnimalForm from '@/components/NovoAnimalForm'
import EditarAnimalButton from '@/components/EditarAnimalButton'

const especieIcone: Record<string, string> = { Gato: '🐱', Cachorro: '🐶' }
const especieCor: Record<string, string> = { Gato: 'pink', Cachorro: 'cyan' }

export default async function AnimaisPage() {
  const supabase = await createClient()
  const { data: animais } = await supabase
    .from('animais')
    .select('*, animal_condicoes(id, tipo_condicao_id, status_id, observacoes, tipos_condicao(nome), opcoes_status_condicao(nome))')
    .order('criado_em', { ascending: false })
  const { data: tipos } = await supabase.from('tipos_condicao').select('id, nome, categoria, especie_restricao, usa_status').order('nome')
  const { data: statusOpcoes } = await supabase.from('opcoes_status_condicao').select('id, nome').order('ordem_exibicao')

  return (
    <>
      <div className="page-header">
        <h1>Cadastro de animal</h1>
        <p>Preencha as informações do animal resgatado</p>
      </div>

      <NovoAnimalForm tipos={tipos ?? []} statusOpcoes={statusOpcoes ?? []} />

      <div className="section-title">Animais cadastrados</div>
      <div className="animal-grid">
        {animais?.map((a: any) => (
          <div className="animal-card" key={a.id}>
            <div className="top-row">
              <div className="avatar">{especieIcone[a.especie] || '🐾'}</div>
              <span className={`badge ${especieCor[a.especie] || 'purple'}`}>{a.especie}</span>
            </div>
            <h3>{a.nome}</h3>
            <p className="desc">{a.descricao}</p>
            <div className="badge-row">
              {a.raca && <span className="badge purple">{a.raca}</span>}
              <span className={`badge ${a.castrado ? 'green' : 'orange'}`}>
                {a.castrado ? 'Castrado' : 'Não castrado'}
              </span>
              {!a.castrado && a.data_castracao_prevista && (
                <span className="badge yellow">Castrar até {new Date(a.data_castracao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              )}
              {a.animal_condicoes?.map((c: any) => (
                <span key={c.id} className="badge red">
                  {c.tipos_condicao?.nome}{c.opcoes_status_condicao ? `: ${c.opcoes_status_condicao.nome}` : ''}
                </span>
              ))}
            </div>
            <EditarAnimalButton
              animal={{
                id: a.id, nome: a.nome, especie: a.especie, raca: a.raca, cor: a.cor,
                data_nascimento_estimada: a.data_nascimento_estimada, data_resgate: a.data_resgate,
                local_resgate: a.local_resgate, descricao: a.descricao, castrado: a.castrado,
                data_castracao_prevista: a.data_castracao_prevista, data_castracao_realizada: a.data_castracao_realizada,
              }}
              condicoes={(a.animal_condicoes ?? []).map((c: any) => ({
                key: c.id, id: c.id, tipo_condicao_id: c.tipo_condicao_id,
                status_id: c.status_id ?? '', observacoes: c.observacoes ?? '',
              }))}
              tipos={tipos ?? []}
              statusOpcoes={statusOpcoes ?? []}
            />
          </div>
        ))}
      </div>
    </>
  )
}
