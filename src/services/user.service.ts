import prisma from '../config/database';

// Campos que retornamos em todas as consultas de usuário
// A senha é excluída intencionalmente — nunca deve aparecer em respostas da API
// Definimos uma vez aqui e reutilizamos em todas as funções para não repetir
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

// Retorna todos os usuários do banco — usado apenas por ADMIN
export async function findAll() {
  // findMany = busca múltiplos registros (equivale a SELECT * FROM users no SQL)
  return prisma.user.findMany({ select: userSelect });
}

// Busca um usuário específico pelo ID
export async function findById(id: string) {
  // findUnique = busca exatamente um registro por campo único (id ou email)
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });

  // Se não encontrar, lança erro — quem chamou essa função será notificado
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  return user;
}

// Atualiza nome e/ou email de um usuário
// Os campos com "?" são opcionais — pode atualizar só um ou os dois
export async function update(id: string, data: { name?: string; email?: string }) {
  // Verifica se o usuário existe antes de tentar atualizar
  await findById(id);

  // Se um novo email foi enviado, verifica se já está em uso por outro usuário
  if (data.email) {
    const emailInUse = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id }, // Exclui o próprio usuário da verificação — sem isso, editar o nome sem mudar o email retornaria erro
      },
    });
    if (emailInUse) {
      throw new Error('Email já está em uso');
    }
  }

  // Atualiza e retorna os dados atualizados (sem senha)
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

// Remove um usuário do banco permanentemente
export async function remove(id: string) {
  // Verifica se existe antes de deletar — evita erro genérico do Prisma
  await findById(id);
  await prisma.user.delete({ where: { id } });
}
