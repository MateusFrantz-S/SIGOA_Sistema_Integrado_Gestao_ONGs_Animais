// Local no projeto: app/produtos/page.tsx (SUBSTITUA o arquivo existente)
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import NovoProdutoForm from '@/components/NovoProdutoForm'

export default async function ProdutosPage() {
  const supabase = await createClient()

  const { data: categorias } = await supabase.from('categorias_produtos').select('id, nome').order('nome')
  const { data: pessoasTodas } = await supabase.from('vw_pessoas_com_cargos').select('*')
  const fornecedores = (pessoasTodas ?? []).filter((p: any) => p.cargos?.includes('Fornecedor'))

  const { data: produtos } = await supabase
    .from('produtos')
    .select('id, nome, cor, tamanho, categorias_produtos(nome)')
    .order('criado_em', { ascending: false })

  const { data: vinculos } = await supabase.from('fornecedor_produtos').select('produto_id, pessoas(nome)')
  const fornecedorPorProduto = new Map((vinculos ?? []).map((v: any) => [v.produto_id, v.pessoas?.nome]))

  return (
    <>
      <div className="page-header header-com-acao">
        <div>
          <h1>Produtos</h1>
          <p>Catálogo de ração, medicamentos e demais itens</p>
        </div>
        <Link href="/categorias" className="btn ghost small">Gerenciar categorias</Link>
      </div>

      <NovoProdutoForm categorias={categorias ?? []} fornecedores={fornecedores} />

      <div className="tabela-wrap">
        <table>
          <thead><tr><th>Produto</th><th>Categoria</th><th>Fornecedor</th></tr></thead>
          <tbody>
            {produtos?.map((p: any) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.categorias_produtos ? <span className="badge cyan">{p.categorias_produtos.nome}</span> : '—'}</td>
                <td>{fornecedorPorProduto.get(p.id) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
