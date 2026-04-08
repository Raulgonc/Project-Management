import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';

export async function register(name: string, email: string, password: string) {
  // Verifica se já existe um usuário com esse email
  // findUnique retorna null se não encontrar — se retornar algo, o email já está em uso
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email já cadastrado');
  }

  // Criptografa a senha usando bcrypt antes de salvar no banco
  // O "10" é o número de rounds — quanto mais alto, mais seguro e mais lento
  // Nunca salvamos a senha original, apenas o hash resultante
  const hashedPassword = await bcrypt.hash(password, 10);

  // Salva o novo usuário no banco de dados
  // O "select" define quais campos voltam na resposta — a senha é excluída intencionalmente
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // Gera o token JWT para o usuário já ficar logado após o registro
  // SignOptions garante que o TypeScript aceita o tipo do expiresIn
  const signOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  const token = jwt.sign(
    { userId: user.id, role: user.role }, // Payload: dados que ficam "dentro" do token
    env.JWT_SECRET,                        // Chave secreta para assinar
    signOptions                            // Opções: tempo de expiração
  );

  return { user, token };
}

export async function login(email: string, password: string) {
  // Busca o usuário pelo email — findUnique retorna null se não existir
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Mensagem genérica intencional — não revelamos se o email existe ou não
    throw new Error('Email ou senha inválidos');
  }

  // Compara a senha enviada com o hash salvo no banco
  // bcrypt consegue fazer essa comparação sem "descriptografar" o hash
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Email ou senha inválidos');
  }

  // Gera o token JWT
  const signOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    signOptions
  );

  // Remove a senha do objeto antes de retornar
  // Desestruturação: separa "password" do resto e descarta com "_"
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}
