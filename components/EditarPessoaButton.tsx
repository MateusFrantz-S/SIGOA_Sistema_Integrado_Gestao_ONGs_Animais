// Local no projeto: components/EditarPessoaButton.tsx (arquivo novo)
// Botão "Editar" da tabela de pessoas: abre o formulário preenchido num modal.
'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import NovaPessoaForm, { PessoaEdit } from './NovaPessoaForm'

export default function EditarPessoaButton({ pessoa, cargos }: { pessoa: PessoaEdit; cargos: { id: string; nome: string }[] }) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <button className="btn ghost small" onClick={() => setAberto(true)}>✏️ Editar</button>
      {aberto && createPortal(
        <div className="modal-fundo aberto" onClick={(e) => { if (e.target === e.currentTarget) setAberto(false) }}>
          <div className="modal largo">
            <div className="modal-header">
              <h2>Editar {pessoa.nome}</h2>
              <button className="modal-fechar" onClick={() => setAberto(false)}>✕</button>
            </div>
            <NovaPessoaForm cargos={cargos} pessoa={pessoa} aoConcluir={() => setAberto(false)} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
