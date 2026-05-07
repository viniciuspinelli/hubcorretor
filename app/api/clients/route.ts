import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createClientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  cpfOrCnpj: z.string().optional(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  planAnniversary: z.string().optional(),
});

// GET /api/clients — lista clientes do corretor logado
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";

  const clients = await prisma.client.findMany({
    where: {
      userId: session.user.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { cpfOrCnpj: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { dependents: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

// POST /api/clients — cria cliente vinculado ao corretor logado
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { name, cpfOrCnpj, phone, birthDate, planAnniversary } = parsed.data;

  const client = await prisma.client.create({
    data: {
      userId: session.user.id,
      name,
      cpfOrCnpj,
      phone,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      planAnniversary: planAnniversary ? new Date(planAnniversary) : undefined,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
