import { PrismaClient, Role, LeadStatus, LeadSource, ProjectStatus, TaskStatus, TaskPriority, InvoiceStatus, BillingType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pmapp.com' },
    update: {},
    create: { name: 'Admin Silva', email: 'admin@pmapp.com', password: passwordHash, role: Role.ADMIN },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'joao.manager@pmapp.com' },
    update: {},
    create: { name: 'João Manager', email: 'joao.manager@pmapp.com', password: passwordHash, role: Role.USER },
  });

  const dev = await prisma.user.upsert({
    where: { email: 'ana.dev@pmapp.com' },
    update: {},
    create: { name: 'Ana Dev', email: 'ana.dev@pmapp.com', password: passwordHash, role: Role.USER },
  });

  const designer = await prisma.user.upsert({
    where: { email: 'carlos.design@pmapp.com' },
    update: {},
    create: { name: 'Carlos Designer', email: 'carlos.design@pmapp.com', password: passwordHash, role: Role.USER },
  });

  console.log('✓ Users created');

  // Leads
  const lead1 = await prisma.lead.upsert({
    where: { id: 'lead-001' },
    update: {},
    create: {
      id: 'lead-001',
      name: 'Empresa Alpha Ltda',
      email: 'contato@alpha.com.br',
      phone: '(11) 98765-4321',
      company: 'Alpha Ltda',
      source: LeadSource.REFERRAL,
      status: LeadStatus.CONVERTED,
      notes: 'Indicação do cliente Beta.',
      convertedAt: new Date('2026-01-15'),
    },
  });

  const lead2 = await prisma.lead.upsert({
    where: { id: 'lead-002' },
    update: {},
    create: {
      id: 'lead-002',
      name: 'StartupX',
      email: 'hello@startupx.io',
      phone: '(21) 91234-5678',
      company: 'StartupX',
      source: LeadSource.WEBSITE,
      status: LeadStatus.QUALIFIED,
      notes: 'Interessado em sistema de gestão completo.',
    },
  });

  const lead3 = await prisma.lead.upsert({
    where: { id: 'lead-003' },
    update: {},
    create: {
      id: 'lead-003',
      name: 'Comércio Beta',
      email: 'ti@comerciobeta.com',
      phone: '(31) 3333-4444',
      company: 'Comércio Beta',
      source: LeadSource.EMAIL,
      status: LeadStatus.CONVERTED,
      notes: 'Respondeu campanha de email.',
      convertedAt: new Date('2026-02-01'),
    },
  });

  console.log('✓ Leads created');

  // Clients
  const clientAlpha = await prisma.client.upsert({
    where: { email: 'contato@alpha.com.br' },
    update: {},
    create: {
      name: 'Empresa Alpha Ltda',
      email: 'contato@alpha.com.br',
      phone: '(11) 98765-4321',
      company: 'Alpha Ltda',
      contractInfo: 'Contrato anual - R$ 120.000,00',
      notes: 'Cliente premium, atendimento prioritário.',
      leadId: lead1.id,
    },
  });

  const clientBeta = await prisma.client.upsert({
    where: { email: 'ti@comerciobeta.com' },
    update: {},
    create: {
      name: 'Comércio Beta',
      email: 'ti@comerciobeta.com',
      phone: '(31) 3333-4444',
      company: 'Comércio Beta',
      contractInfo: 'Contrato por projeto - R$ 45.000,00',
      notes: 'Prefere reuniões às sextas-feiras.',
      leadId: lead3.id,
    },
  });

  console.log('✓ Clients created');

  // Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Portal Web Alpha',
      description: 'Desenvolvimento do portal corporativo com área do cliente e relatórios.',
      status: ProjectStatus.IN_PROGRESS,
      budgetPlanned: 80000,
      budgetActual: 35000,
      startDate: new Date('2026-02-01'),
      deadline: new Date('2026-06-30'),
      clientId: clientAlpha.id,
      managerId: manager.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'App Mobile Beta',
      description: 'Aplicativo mobile para gestão de pedidos do Comércio Beta.',
      status: ProjectStatus.PLANNING,
      budgetPlanned: 45000,
      budgetActual: 0,
      startDate: new Date('2026-05-01'),
      deadline: new Date('2026-09-30'),
      clientId: clientBeta.id,
      managerId: manager.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Redesign Dashboard Alpha',
      description: 'Redesign completo do dashboard administrativo.',
      status: ProjectStatus.COMPLETED,
      budgetPlanned: 20000,
      budgetActual: 19500,
      startDate: new Date('2026-01-05'),
      deadline: new Date('2026-02-28'),
      completedAt: new Date('2026-02-25'),
      clientId: clientAlpha.id,
      managerId: admin.id,
    },
  });

  console.log('✓ Projects created');

  // Tasks - Project 1
  await prisma.task.createMany({
    data: [
      {
        title: 'Levantamento de requisitos',
        description: 'Reunião com stakeholders para mapear todas as funcionalidades.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        deadline: new Date('2026-02-10'),
        completedAt: new Date('2026-02-08'),
        projectId: project1.id,
        assigneeId: manager.id,
      },
      {
        title: 'Configurar ambiente de desenvolvimento',
        description: 'Setup do repositório, CI/CD e ambientes dev/staging.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        deadline: new Date('2026-02-15'),
        completedAt: new Date('2026-02-14'),
        projectId: project1.id,
        assigneeId: dev.id,
      },
      {
        title: 'Desenvolver módulo de autenticação',
        description: 'Login, registro, recuperação de senha e 2FA.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.CRITICAL,
        deadline: new Date('2026-04-30'),
        projectId: project1.id,
        assigneeId: dev.id,
      },
      {
        title: 'Criar protótipo de telas',
        description: 'Wireframes e protótipo navegável no Figma.',
        status: TaskStatus.REVIEW,
        priority: TaskPriority.MEDIUM,
        deadline: new Date('2026-04-20'),
        projectId: project1.id,
        assigneeId: designer.id,
      },
      {
        title: 'Desenvolver API de relatórios',
        description: 'Endpoints para geração de relatórios em PDF e Excel.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        deadline: new Date('2026-05-30'),
        projectId: project1.id,
        assigneeId: dev.id,
      },
      {
        title: 'Testes de integração',
        description: 'Cobrir todos os fluxos críticos com testes automatizados.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        deadline: new Date('2026-06-15'),
        projectId: project1.id,
        assigneeId: dev.id,
      },
    ],
  });

  // Tasks - Project 2
  await prisma.task.createMany({
    data: [
      {
        title: 'Definir arquitetura do app',
        description: 'Escolha de tecnologias: React Native ou Flutter.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        deadline: new Date('2026-05-10'),
        projectId: project2.id,
        assigneeId: manager.id,
      },
      {
        title: 'Design do sistema de pedidos',
        description: 'UX/UI para fluxo de criação e acompanhamento de pedidos.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        deadline: new Date('2026-05-25'),
        projectId: project2.id,
        assigneeId: designer.id,
      },
    ],
  });

  console.log('✓ Tasks created');

  // Invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      number: 'INV-2026-001',
      status: InvoiceStatus.PAID,
      billingType: BillingType.MILESTONE,
      issueDate: new Date('2026-02-28'),
      dueDate: new Date('2026-03-14'),
      paidAt: new Date('2026-03-10'),
      notes: 'Pagamento do marco 1: Entrega do protótipo.',
      clientId: clientAlpha.id,
      projectId: project3.id,
      items: {
        create: [
          { description: 'Redesign Dashboard - Fase 1', quantity: 1, unitPrice: 10000, total: 10000 },
          { description: 'Testes e ajustes', quantity: 1, unitPrice: 9500, total: 9500 },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      number: 'INV-2026-002',
      status: InvoiceStatus.SENT,
      billingType: BillingType.MILESTONE,
      issueDate: new Date('2026-04-01'),
      dueDate: new Date('2026-04-15'),
      notes: 'Pagamento do marco 1: Autenticação e setup.',
      clientId: clientAlpha.id,
      projectId: project1.id,
      items: {
        create: [
          { description: 'Módulo de Autenticação', quantity: 1, unitPrice: 15000, total: 15000 },
          { description: 'Configuração de infraestrutura', quantity: 1, unitPrice: 8000, total: 8000 },
          { description: 'Documentação técnica', quantity: 1, unitPrice: 2000, total: 2000 },
        ],
      },
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      number: 'INV-2026-003',
      status: InvoiceStatus.DRAFT,
      billingType: BillingType.FIXED,
      issueDate: new Date('2026-04-17'),
      dueDate: new Date('2026-05-01'),
      notes: 'Proposta inicial para o App Mobile.',
      clientId: clientBeta.id,
      projectId: project2.id,
      items: {
        create: [
          { description: 'Desenvolvimento App Mobile - Fase 1', quantity: 1, unitPrice: 22500, total: 22500 },
        ],
      },
    },
  });

  console.log('✓ Invoices created');

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\nDados criados:');
  console.log('  Usuários: admin@pmapp.com, joao.manager@pmapp.com, ana.dev@pmapp.com, carlos.design@pmapp.com');
  console.log('  Senha de todos: password123');
  console.log('  Leads: 3 (2 convertidos, 1 qualificado)');
  console.log('  Clientes: 2 (Alpha, Beta)');
  console.log('  Projetos: 3 (1 concluído, 1 em andamento, 1 planejamento)');
  console.log('  Tarefas: 8');
  console.log('  Faturas: 3 (1 paga, 1 enviada, 1 rascunho)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
