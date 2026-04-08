import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as projectService from '../services/project.service';
import { ProjectStatus } from '@prisma/client';

// Lista todos os projetos — aceita filtros via query params na URL
// Exemplos: GET /projects | GET /projects?status=IN_PROGRESS | GET /projects?clientId=abc
export async function getAllProjects(req: AuthRequest, res: Response): Promise<void> {
  try {
    // req.query lê os parâmetros que vêm depois do "?" na URL
    const { status, clientId } = req.query;

    const projects = await projectService.findAll({
      status: status as ProjectStatus,
      clientId: clientId as string,
    });

    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Busca um projeto pelo ID — retorna projeto + tarefas + cliente + gerente
// Exemplo: GET /projects/abc-123
export async function getProjectById(req: AuthRequest, res: Response): Promise<void> {
  try {
    // req.params.id lê o :id que vem direto na URL
    const project = await projectService.findById(req.params.id);
    res.json(project);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

// Cria um novo projeto vinculado a um cliente
// POST /projects — body: { name, clientId, description?, managerId?, budgetPlanned?, startDate?, deadline? }
export async function createProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, clientId, managerId, budgetPlanned, startDate, deadline } = req.body;

    // name e clientId são obrigatórios — todo projeto precisa de um nome e um cliente
    if (!name || !clientId) {
      res.status(400).json({ error: 'Nome e cliente são obrigatórios' });
      return;
    }

    const project = await projectService.create({
      name,
      description,
      clientId,
      managerId,
      budgetPlanned,
      // Datas chegam como string no JSON — precisamos converter para objeto Date
      // O "?" verifica se o valor existe antes de converter, evitando erros
      startDate: startDate ? new Date(startDate) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    res.status(201).json(project); // 201 = criado com sucesso
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// Atualiza parcialmente um projeto — só os campos enviados serão alterados
// PATCH /projects/:id — body com qualquer campo de UpdateProjectData
export async function updateProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const project = await projectService.update(req.params.id, req.body);
    res.json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// Remove um projeto permanentemente — restrito a ADMIN (definido nas rotas)
// DELETE /projects/:id
export async function deleteProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    await projectService.remove(req.params.id);
    res.status(204).send(); // 204 = sucesso sem conteúdo para retornar
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}
