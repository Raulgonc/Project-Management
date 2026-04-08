import prisma from '../config/database';
import { ProjectStatus } from '@prisma/client';

// Define os campos obrigatórios e opcionais para criar um projeto
interface CreateProjectData {
  name: string;
  description?: string;
  clientId: string;    // Todo projeto precisa estar vinculado a um cliente
  managerId?: string;  // O gerente é opcional — pode ser atribuído depois
  budgetPlanned?: number;
  startDate?: Date;
  deadline?: Date;
}

// Todos os campos são opcionais — o PATCH atualiza só o que vier preenchido
interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  managerId?: string;
  budgetPlanned?: number;  // Orçamento planejado (definido no início do projeto)
  budgetActual?: number;   // Orçamento real (atualizado conforme o projeto avança)
  startDate?: Date;
  deadline?: Date;
}

// Filtros disponíveis na listagem — ex: /projects?status=IN_PROGRESS&clientId=abc
interface ProjectFilters {
  status?: ProjectStatus;
  clientId?: string;
}

// Lista todos os projetos, com filtros opcionais
export async function findAll(filters: ProjectFilters = {}) {
  return prisma.project.findMany({
    where: {
      // O spread condicional (...) só adiciona o filtro se o valor foi informado
      // Sem isso, filtros vazios quebrariam a query
      ...(filters.status && { status: filters.status }),
      ...(filters.clientId && { clientId: filters.clientId }),
    },
    include: {
      // Traz dados básicos do cliente (sem trazer tudo)
      client: { select: { id: true, name: true, email: true } },
      // Traz dados básicos do gerente responsável
      manager: { select: { id: true, name: true, email: true } },
      // _count traz apenas a QUANTIDADE de tarefas, sem carregar cada tarefa na memória
      // Útil para exibir "5 tarefas" na listagem sem sobrecarregar a resposta
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' }, // Mais recentes primeiro
  });
}

// Busca um projeto específico pelo ID — traz mais detalhes que o findAll
export async function findById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      manager: { select: { id: true, name: true, email: true } },
      tasks: true, // Na busca individual, traz todas as tarefas completas
    },
  });

  if (!project) {
    throw new Error('Projeto não encontrado');
  }

  return project;
}

export async function create(data: CreateProjectData) {
  // Garante que o cliente existe antes de criar o projeto
  // Evita projetos "órfãos" vinculados a IDs inexistentes
  const client = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!client) {
    throw new Error('Cliente não encontrado');
  }

  return prisma.project.create({
    data,
    include: {
      // Retorna os dados do cliente junto na resposta de criação
      client: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function update(id: string, data: UpdateProjectData) {
  // Verifica se o projeto existe antes de tentar atualizar
  await findById(id);

  // Automaticamente registra quando o projeto foi concluído
  // Se o status mudou para COMPLETED, salva a data e hora atual
  const completedAt = data.status === 'COMPLETED' ? new Date() : undefined;

  return prisma.project.update({
    where: { id },
    // O spread (...) mescla os dados normais com o completedAt (se existir)
    data: { ...data, ...(completedAt && { completedAt }) },
  });
}

export async function remove(id: string) {
  // Verifica se existe antes de deletar — evita erro genérico do banco
  await findById(id);
  await prisma.project.delete({ where: { id } });
}
