export default class MedicationUtils {
  static calcularQuantidade(mgPorDose, mgPorComprimido) {
    if (!mgPorDose || !mgPorComprimido) return 0;
    return Math.ceil(mgPorDose / mgPorComprimido);
  }

  static atualizarEstoqueComDias(lista) {
    return lista.map((med) => {
      const mgPorComprimido = parseFloat(med.mgPorComprimido) || 0;
      const mgPorDose = parseFloat(med.mgPorDose) || 0;
      const dosesPorDia = parseInt(med.dosesPorDia, 10) || 0;
      const estoque = parseFloat(med.estoque) || 0;
      const dataCadastro = new Date(med.dataCadastro);
      console.log('[DEBUG][MedicationUtils] med.id:', med.id, 'dataCadastro bruto:', med.dataCadastro, 'dataCadastro Date:', dataCadastro);
      if (isNaN(dataCadastro.getTime())) {
        console.warn('[DEBUG][MedicationUtils] Data inválida para med.id:', med.id, 'dataCadastro:', med.dataCadastro);
        return {
          ...med,
          estoqueAtual: '0.00',
          diasRestantes: '0.00',
          diasPassados: 0,
          dataCadastroFormatada: 'Data inválida',
        };
      }
      const hoje = new Date();
      const umDiaEmMs = 1000 * 60 * 60 * 24;
      const diasPassados = Math.floor((hoje - dataCadastro) / umDiaEmMs);
      const dosesConsumidas = diasPassados * dosesPorDia;
      const fatorConversao = mgPorComprimido > 0 && mgPorDose > 0 ? mgPorComprimido / mgPorDose : 0;
      const comprimidosConsumidos = fatorConversao > 0 ? dosesConsumidas / fatorConversao : 0;
      const estoqueAtual = Math.max(estoque - comprimidosConsumidos, 0);
      const comprimidosPorDia = fatorConversao > 0 ? dosesPorDia / fatorConversao : 0;
      const diasRestantes = comprimidosPorDia > 0 ? estoqueAtual / comprimidosPorDia : 0;
      console.log('[DEBUG][MedicationUtils] med.id:', med.id, 'diasPassados:', diasPassados, 'estoqueAtual:', estoqueAtual, 'diasRestantes:', diasRestantes);
      return {
        ...med,
        estoqueAtual: estoqueAtual.toFixed(2),
        diasRestantes: diasRestantes.toFixed(2),
        diasPassados: diasPassados,
        dataCadastroFormatada: dataCadastro.toLocaleDateString('pt-BR'),
      };
    });
  }
} 