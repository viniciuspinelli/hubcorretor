import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createDependentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  relationship: z.string().min(1, "Parentesco é obrigatório."),
  birthDate: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

// POST /api/clients/[id]/dependents
export async function POST(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: clientId } = await params;

  // Garante que o cliente pertence ao corretor logado
  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.user.id },
  });

  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createDependentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { name, relationship, birthDate } = parsed.data;

  const dependent = await prisma.dependent.create({
    data: {
      clientId,
      name,
      relationship,
      birthDate: birthDate ? new Date(birthDate) : undefined,
    },
  });

  return NextResponse.json(dependent, { status: 201 });
}

// DELETE /api/clients/[id]/dependents?dependentId=...
export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: clientId } = await params;
  const { searchParams } = new URL(request.url);
  const dependentId = searchParams.get("dependentId");

  if (!dependentId) {
    return NextResponse.json({ error: "dependentId é obrigatório." }, { status: 400 });
  }

  // Garante que o cliente pertence ao corretor logado
  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.user.id },
  });

  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  await prisma.dependent.delete({ where: { id: dependentId } });

  return new NextResponse(null, { status: 204 });
}
