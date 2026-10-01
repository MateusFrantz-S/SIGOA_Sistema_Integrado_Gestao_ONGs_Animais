// Local no projeto: app/pessoas/page.tsx (arquivo novo)
import { createClient } from '@/utils/supabase/server'
import NovaPessoaForm from '@/components/NovaPessoaForm'

const corCargo: Record<string, string> = { Adotante: 'pink', Fornecedor: 'orange' }

export default async function PessoasPage() {
  const supabase = await createClient()
  const { data: cargos } = await supabase.from('cargos').select('*').order('nome')
  const { data: pessoas } = await supabase.from('vw_pessoas_com_cargos').select('*').order('nome')

  return (
    <>
      <div className="page-header">
        <h1>Pessoas</h1>
        <p>Cadastro único — marque um ou mais cargos para cada pessoa</p>
      </div>

      <NovaPessoaForm cargos={cargos ?? []} />

      <div className="tabela-wrap">
        <table>
          <thead><tr><th>Nome</th><th>Cargos</th><th>Contato</th></tr></thead>
          <tbody>
            {pessoas?.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>
                  {(p.cargos as string)?.split(', ').filter(Boolean).map((c: string) => (
                    <span key={c} className={`badge ${corCargo[c] || 'purple'}`} style={{ marginRight: 6 }}>{c}</span>
                  )) || <span className="badge purple">Sem cargo</span>}
                </td>
                <td>{p.telefone || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
