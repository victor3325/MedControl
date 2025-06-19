export default class DateUtils {
  static safeParseHorarios(horarios) {
    if (!horarios) return [];
    if (Array.isArray(horarios)) return horarios;
    if (typeof horarios === 'object') return Object.values(horarios);
    if (typeof horarios === 'string') {
      try {
        return JSON.parse(horarios);
      } catch (e) {
        if (horarios.includes(',')) {
          return horarios.split(',').map(h => h.trim());
        }
        console.warn('JSON inválido para horários:', horarios, e);
        return [];
      }
    }
    return [];
  }

  static formatDateToISO(dateStr) {
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [dia, mes, ano] = dateStr.split('/');
      return `${ano}-${mes}-${dia}`;
    }
    return new Date(dateStr).toISOString().split('T')[0];
  }

  static formatDateBR(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
} 