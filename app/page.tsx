// Local no projeto: app/page.tsx (SUBSTITUA o arquivo já existente —
// é o mesmo arquivo que hoje mostra a tela de Categorias; a tela de
// Categorias continua existindo em app/categorias/page.tsx)
import { createClient } from '@/utils/supabase/server'

const especieIcone: Record<string, string> = { Gato: '🐱', Cachorro: '🐶' }
const especieCor: Record<string, string> = { Gato: 'pink', Cachorro: 'cyan' }

export default async function DashboardPage() {
  const supabase = await createClient()

  const { count: totalAnimais } = await supabase
    .from('animais').select('*', { count: 'exact', head: true })

  const { count: emTratamento } = await supabase
    .from('tratamentos').select('*', { count: 'exact', head: true })
    .in('etapa', ['triagem', 'em_tratamento'])

  const { count: emProcessoAdocao } = await supabase
    .from('adocoes').select('*', { count: 'exact', head: true })
    .eq('etapa', 'em_processo_adocao')

  const inicioMes = new Date()
  inicioMes.setDate(1)
  const { count: adotadosMes } = await supabase
    .from('adocoes').select('*', { count: 'exact', head: true })
    .eq('etapa', 'adotado')
    .gte('data_adocao', inicioMes.toISOString().slice(0, 10))

  // Animais aguardando adoção: busca a partir de "adocoes" (toda vez que
  // um animal é cadastrado, o gatilho do banco já cria essa linha) e traz
  // junto os dados do animal (animais é uma tabela relacionada por FK).
  const { data: aguardando } = await supabase
    .from('adocoes')
    .select('animal_id, animais(id, nome, especie, raca, descricao, castrado)')
    .eq('etapa', 'aguardando_adocao')

  return (
    <>
      <div className="page-header">
        <h1>Painel geral</h1>
        <p>Visão rápida da situação atual da ONG</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple"><p>Animais cadastrados</p><div className="num">{totalAnimais ?? 0}</div></div>
        <div className="stat-card cyan"><p>Em tratamento</p><div className="num">{emTratamento ?? 0}</div></div>
        <div className="stat-card pink"><p>Em processo de adoção</p><div className="num">{emProcessoAdocao ?? 0}</div></div>
        <div className="stat-card green"><p>Adotados este mês</p><div className="num">{adotadosMes ?? 0}</div></div>
      </div>

      <div className="section-title">Aguardando adoção</div>
      <div className="animal-grid">
        {aguardando && aguardando.length > 0 ? (
          aguardando.map((item: any) => {
            const a = item.animais
            if (!a) return null
            return (
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
                </div>
              </div>
            )
          })
        ) : (
          <p>Nenhum animal aguardando adoção no momento.</p>
        )}
      </div>
    </>
  )
}
