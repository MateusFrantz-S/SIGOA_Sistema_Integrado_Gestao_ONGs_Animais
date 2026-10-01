// Local no projeto: app/animais/page.tsx (SUBSTITUA o arquivo já existente)
import { createClient } from '@/utils/supabase/server'
import NovoAnimalForm from '@/components/NovoAnimalForm'

const especieIcone: Record<string, string> = { Gato: '🐱', Cachorro: '🐶' }
const especieCor: Record<string, string> = { Gato: 'pink', Cachorro: 'cyan' }

export default async function AnimaisPage() {
  const supabase = await createClient()
  const { data: animais } = await supabase
    .from('animais')
    .select('*')
    .order('criado_em', { ascending: false })

  return (
    <>
      <div className="page-header">
        <h1>Cadastro de animal</h1>
        <p>Preencha as informações do animal resgatado</p>
      </div>

      <NovoAnimalForm />

      <div className="section-title">Animais cadastrados</div>
      <div className="animal-grid">
        {animais?.map((a) => (
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
        ))}
      </div>
    </>
  )
}
