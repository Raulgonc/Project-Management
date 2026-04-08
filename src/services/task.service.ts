import prisma from '../config/database';
import { TaskStatus, TaskPriority } from '@prisma/client';

interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;   // Toda tarefa pertence a um projeto
  assigneeId?: string; // Usuário responsável — pode ser atribuído depois
  priority?: TaskPriority;
  deadline?: Date;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  deadline?: Date;
}

// Filtros disponíveis na listagem
// Ex: /tasks?projectId=abc | /tasks?assigneeId=xyz | /tasks?status=IN_PROGRESS
interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

// Lista tarefas com filtros opcionais
export async function findAll(filters: TaskFilters = {}) {
  return prisma.task.findMany({
    where: {
      ...(filters.projectId && { projectId: filters.projectId }),
      ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
    },
    include: {
      // Traz dados básicos do projeto ao qual a tarefa pertence
      project: { select: { id: true, name: true } },
      // Traz dados básicos do usuário responsável pela tarefa
      assignee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Busca uma tarefa específica com todos os detalhes
export async function findById(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  return task;
}

export async function create(data: CreateTaskData) {
  // Verifica se o projeto existe antes de criar a tarefa
  const project = await prisma.project.findUnique({ where: { id: data.projectId } });
  if (!project) {
    throw new Error('Projeto não encontrado');
  }

  // Se um responsável foi informado, verifica se o usuário existe
  if (data.assigneeId) {
    const user = await prisma.user.findUnique({ where: { id: data.assigneeId } });
    if (!user) {
      throw new Error('Usuário responsável não encontrado');
    }
  }

  return prisma.task.create({
    data,
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function update(id: string, data: UpdateTaskData) {
  await findById(id);

  // Se um novo responsável foi informado, verifica se o usuário existe
  if (data.assigneeId) {
    const user = await prisma.user.findUnique({ where: { id: data.assigneeId } });
    if (!user) {
      throw new Error('Usuário responsável não encontrado');
    }
  }

  // Se a tarefa for marcada como DONE, registra a data de conclusão automaticamente
  const completedAt = data.status === 'DONE' ? new Date() : undefined;

  return prisma.task.update({
    where: { id },
    data: { ...data, ...(completedAt && { completedAt }) },
  });
}

export async function remove(id: string) {
  await findById(id);
  await prisma.task.delete({ where: { id } });
}
