// Local no projeto: utils/castracao.ts (arquivo novo)
// Cálculo automático da data prevista de castração.
// Regra: castração recomendada aos 6 meses de idade.
//  - Se há data de nascimento estimada: nascimento + 6 meses.
//  - Se essa data já passou, ou se não há nascimento: hoje + 30 dias.
// Para mudar a regra, altere só este arquivo.

function paraISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}

function deISO(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export function somarDias(iso: string, dias: number): string {
  const d = deISO(iso)
  d.setDate(d.getDate() + dias)
  return paraISO(d)
}

export function calcularDataCastracao(nascimentoEstimado?: string | null): string {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const padrao = new Date(hoje)
  padrao.setDate(padrao.getDate() + 30)

  if (!nascimentoEstimado) return paraISO(padrao)
  const alvo = deISO(nascimentoEstimado)
  alvo.setMonth(alvo.getMonth() + 6)
  return alvo >= hoje ? paraISO(alvo) : paraISO(padrao)
}
