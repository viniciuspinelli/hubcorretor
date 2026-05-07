import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  cpfOrCnpj: z.string().optional(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  planAnniversary: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

// Garante que o cliente pertence ao corretor logado
async function getOwnedClient(clientId: string, userId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, userId },
  });
}

// GET /api/clients/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
    include: { dependents: true, documents: true },
  });

  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  return NextResponse.json(client);
}

// PUT /api/clients/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const owned = await getOwnedClient(id, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { name, cpfOrCnpj, phone, birthDate, planAnniversary } = parsed.data;

  const updated = await prisma.client.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(cpfOrCnpj !== undefined && { cpfOrCnpj }),
      ...(phone !== undefined && { phone }),
      ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
      ...(planAnniversary !== undefined && {
        planAnniversary: planAnniversary ? new Date(planAnniversary) : null,
      }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/clients/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const owned = await getOwnedClient(id, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  await prisma.client.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
