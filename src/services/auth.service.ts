import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';

export async function register(name: string, email: string, password: string) {
  // Verifica se já existe um usuário com esse email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email já cadastrado');
  }

  // Criptografa a senha antes de salvar (nunca salvamos senha pura)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Salva o usuário no banco
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // Gera o token JWT para o usuário já ficar logado após o registro
  const signOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    signOptions
  );

  return { user, token };
}

export async function login(email: string, password: string) {
  // Busca o usuário pelo email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Email ou senha inválidos');
  }

  // Compara a senha enviada com o hash salvo no banco
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

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}
