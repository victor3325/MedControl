# Changelog - Release

## Resumo das Alterações

### 🎯 Funcionalidades Principais

#### 1. Integração com Google Calendar
- **Novo serviço**: `CalendarService.js` - Gerencia criação, atualização e remoção de eventos no calendário
- **Criação automática**: Eventos são criados automaticamente ao cadastrar medicamentos
- **Atualização automática**: Eventos são atualizados ao editar medicamentos
- **Remoção automática**: Eventos são removidos ao excluir medicamentos
- **Eventos recorrentes**: Criação de eventos diários para 365 dias para cada horário de medicamento
- **Sincronização**: Botão para sincronizar todos os eventos do calendário

#### 2. Tela de Seleção de Calendário
- **Nova tela**: `CalendarSelectionScreen.js`
- **Seleção inicial**: Aparece no primeiro login para escolher o calendário padrão
- **Filtragem inteligente**: Filtra calendários somente leitura e calendários de feriados
- **Persistência**: Salva a escolha do usuário para uso futuro

#### 3. Modais de Carregamento com Progresso
- **Cadastro de medicamentos**: Modal com indicador de progresso mostrando etapas (DB, notificações, calendário)
- **Edição de medicamentos**: Modal com indicador de progresso durante atualização
- **Exclusão de medicamentos**: Modal com indicador de progresso durante remoção
- **Sincronização de calendário**: Modal detalhado com progresso passo a passo

#### 4. Funcionalidades de Sincronização
- **Remoção de eventos órfãos**: Busca e remove eventos que não estão mais no banco de dados
- **Recriação de eventos**: Remove eventos antigos e recria para medicamentos existentes
- **Feedback visual**: Mostra progresso detalhado durante sincronização
- **Relatório**: Exibe resumo de eventos removidos e criados

#### 5. Melhorias na Tela de Suporte
- **Simplificação**: Removido sistema de tickets, mantendo apenas informações de contato
- **Layout limpo**: Interface mais simples e direta com cards informativos
- **Informações**: Email, WhatsApp, responsável e horário de atendimento

#### 6. Correções de Layout
- **Alergias**: Novo layout em chips/badges com botão de remover integrado
- **Organização**: Estilos movidos para arquivo dedicado (`HomeScreen.styles.js`)
- **Consistência**: Correção de nomes de funções e organização de código

### 🔧 Melhorias Técnicas

#### Repositório de Medicamentos
- **Robustez**: Melhorias na criação e verificação de tabelas
- **Transações**: Melhor tratamento de erros em transações
- **Validações**: Verificações adicionais de integridade

#### Navegação
- **Nova rota**: Adicionada `CalendarSelectionScreen` ao navegador
- **Fluxo**: Integração do fluxo de seleção de calendário no login

#### Notificações
- **Melhorias**: Ajustes no serviço de notificações locais
- **Compatibilidade**: Melhor suporte para diferentes versões do Android

### 📦 Dependências

- **Adicionado**: `react-native-calendar-events` (v2.2.0) - Integração com calendário nativo

### 🛠️ Configurações

#### Android
- **Gradle**: Atualizado para versão 8.10.2
- **Build**: Ajustes nas configurações de build para release
- **Permissões**: Configuradas permissões de calendário no AndroidManifest

### 🐛 Correções de Bugs

- **Layout de alergias**: Corrigido problema de botão aparecendo abaixo do texto
- **Nomes de funções**: Corrigida inconsistência em `handleRemoveAlergia`
- **Estilos**: Removidos conflitos entre estilos locais e importados
- **Compatibilidade**: Removida propriedade `gap` não suportada em versões antigas

### 📝 Arquivos Modificados

#### Novos Arquivos
- `src/screens/CalendarSelectionScreen.js`
- `src/services/CalendarService.js`

#### Arquivos Modificados
- `App.js`
- `android/app/build.gradle`
- `android/gradle.properties`
- `android/gradle/wrapper/gradle-wrapper.properties`
- `package.json`
- `package-lock.json`
- `src/navigation/AppNavigator.js`
- `src/repositories/MedicationRepository.js`
- `src/screens/CadastroMedicamentoScreen.js`
- `src/screens/EditarMedicamentoScreen.js`
- `src/screens/HomeScreen.js`
- `src/screens/ListaMedicamentosScreen.js`
- `src/screens/LoginScreen.js`
- `src/screens/SupportScreen.js`
- `src/services/NotificationService.js`
- `src/themes/HomeScreen.styles.js`
- `src/utils/DateUtils.js`

### 📊 Estatísticas

- **Linhas adicionadas**: ~1144
- **Linhas removidas**: ~319
- **Arquivos modificados**: 14
- **Novos arquivos**: 2

---

## Versão da Release

Esta release inclui melhorias significativas na integração com calendário, experiência do usuário e estabilidade geral do aplicativo.
