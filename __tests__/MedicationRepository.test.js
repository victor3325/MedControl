import MedicationRepository from '../src/repositories/MedicationRepository';

describe('MedicationRepository utilitários de manutenção', () => {
  it('deve exportar todos os medicamentos sem lançar erro', async () => {
    await expect(MedicationRepository.exportarTodosMedicamentos()).resolves.toBeInstanceOf(Array);
  });

  it('deve deletar a tabela de medicamentos sem lançar erro', async () => {
    await expect(MedicationRepository.deletarTabelaMedicamentos()).resolves.toBe(true);
  });

  it('deve criar a tabela de medicamentos sem lançar erro', async () => {
    expect(() => MedicationRepository.criarTabelaMedicamentos()).not.toThrow();
  });

  it('deve inserir medicamentos em lote sem lançar erro', async () => {
    const medicamentos = [
      {
        userId: 1,
        nome: 'TesteMed',
        mgPorComprimido: 500,
        mgPorDose: 1000,
        dosesPorDia: 2,
        estoque: 20,
        dataCadastro: new Date().toISOString(),
        horarios: ['08:00', '20:00'],
      },
    ];
    await expect(MedicationRepository.inserirMedicamentosEmLote(medicamentos)).resolves.toBeUndefined();
  });
}); 