import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as taskService from '../services/task.service';
import { TaskStatus, TaskPriority } from '@prisma/client';

// Lista tarefas com filtros opcionais via query params
// Exemplos: GET /tasks?projectId=abc | GET /tasks?status=TODO | GET /tasks?assigneeId=xyz
export async function getAllTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { projectId, assigneeId, status, priority } = req.query;

    const tasks = await taskService.findAll({
      projectId: projectId as string,
      assigneeId: assigneeId as string,
      status: status as TaskStatus,
      priority: priority as TaskPriority,
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// GET /tasks/:id
export async function getTaskById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = await taskService.findById(req.params.id);
    res.json(task);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

// POST /tasks — body: { title, projectId, description?, assigneeId?, priority?, deadline? }
export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, description, projectId, assigneeId, priority, deadline } = req.body;

    // title e projectId são obrigatórios — toda tarefa precisa de um nome e pertencer a um projeto
    if (!title || !projectId) {
      res.status(400).json({ error: 'Título e projeto são obrigatórios' });
      return;
    }

    const task = await taskService.create({
      title,
      description,
      projectId,
      assigneeId,
      priority,
      // Datas chegam como string no JSON — convertemos para objeto Date
      deadline: deadline ? new Date(deadline) : undefined,
    });

    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// PATCH /tasks/:id — atualiza parcialmente a tarefa
// Usado para mover entre status (TODO → IN_PROGRESS → REVIEW → DONE), atribuir responsável, etc.
export async function updateTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = await taskService.update(req.params.id, req.body);
    res.json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// DELETE /tasks/:id — restrito a ADMIN (definido nas rotas)
export async function deleteTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    await taskService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}
