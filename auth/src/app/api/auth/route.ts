import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Usuário admin padrão
const DEFAULT_ADMIN = {
  email: 'admin@admin.com',
  password: 'admin123', // Será hasheada antes de salvar
  name: 'Administrador',
  role: 'ADMIN'
};

// Função para garantir que o usuário admin existe
async function ensureAdminExists() {
  const admin = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN.email }
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    await prisma.user.create({
      data: {
        ...DEFAULT_ADMIN,
        password: hashedPassword
      }
    });
    console.log('Usuário admin criado com sucesso');
  }
}

// Criar admin na inicialização
ensureAdminExists().catch(console.error);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
