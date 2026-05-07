"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  FileText,
  Calendar,
  UserPlus,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";

interface Dependent {
  id: string;
  name: string;
  relationship: string;
  birthDate: string | null;
}

interface Client {
  id: string;
  name: string;
  cpfOrCnpj: string | null;
  phone: string | null;
  birthDate: string | null;
  planAnniversary: string | null;
  dependents: Dependent[];
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);

  // Add dependent form
  const [showDepForm, setShowDepForm] = useState(false);
  const [depName, setDepName] = useState("");
  const [depRelationship, setDepRelationship] = useState("");
  const [depBirthDate, setDepBirthDate] = useState("");
  const [addingDep, setAddingDep] = useState(false);
  const [removingDep, setRemovingDep] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/clients/${id}`);
    if (!res.ok) {
      router.push("/clients");
      return;
    }
    const data = await res.json();
    setClient(data);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  async function handleSaveEdit() {
    if (!client) return;
    setSaving(true);
    const res = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      const updated = await res.json();
      setClient((prev) => prev ? { ...prev, ...updated } : prev);
      setEditing(false);
    }
    setSaving(false);
  }

  async function handleAddDependent(e: React.FormEvent) {
    e.preventDefault();
    if (!depName || !depRelationship) return;
    setAddingDep(true);

    const res = await fetch(`/api/clients/${id}/dependents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: depName,
        relationship: depRelationship,
        birthDate: depBirthDate || undefined,
      }),
    });

    if (res.ok) {
      const dep = await res.json();
      setClient((prev) =>
        prev ? { ...prev, dependents: [...prev.dependents, dep] } : prev
      );
      setDepName("");
      setDepRelationship("");
      setDepBirthDate("");
      setShowDepForm(false);
    }
    setAddingDep(false);
  }

  async function handleRemoveDependent(depId: string) {
    setRemovingDep(depId);
    await fetch(`/api/clients/${id}/dependents?dependentId=${depId}`, {
      method: "DELETE",
    });
    setClient((prev) =>
      prev
        ? { ...prev, dependents: prev.dependents.filter((d) => d.id !== depId) }
        : prev
    );
    setRemovingDep(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Carregando...
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/clients"
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-blue-50 rounded-xl shrink-0">
            <User size={20} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{client.name}</h1>
            <p className="text-sm text-gray-500">Detalhes do cliente</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(true);
            setEditData({
              name: client.name,
              cpfOrCnpj: client.cpfOrCnpj ?? "",
              phone: client.phone ?? "",
              birthDate: client.birthDate ? client.birthDate.split("T")[0] : "",
              planAnniversary: client.planAnniversary
                ? client.planAnniversary.split("T")[0]
                : "",
            });
          }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
        >
          <Edit2 size={15} />
          Editar
        </button>
      </div>

      {/* Dados do cliente */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Informações</h2>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                value={editData.name ?? ""}
                onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
                <input
                  value={editData.cpfOrCnpj ?? ""}
                  onChange={(e) => setEditData((p) => ({ ...p, cpfOrCnpj: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  value={editData.phone ?? ""}
                  onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={editData.birthDate ?? ""}
                  onChange={(e) => setEditData((p) => ({ ...p, birthDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aniversário do Plano</label>
                <input
                  type="date"
                  value={editData.planAnniversary ?? ""}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, planAnniversary: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                <Check size={14} />
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={14} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <User size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-gray-500 text-xs">Nome</dt>
                <dd className="font-medium text-gray-900">{client.name}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-gray-500 text-xs">CPF / CNPJ</dt>
                <dd className="font-medium text-gray-900">{client.cpfOrCnpj ?? "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-gray-500 text-xs">Telefone</dt>
                <dd className="font-medium text-gray-900">{client.phone ?? "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-gray-500 text-xs">Data de Nascimento</dt>
                <dd className="font-medium text-gray-900">{formatDate(client.birthDate)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-gray-500 text-xs">Aniversário do Plano</dt>
                <dd className="font-medium text-gray-900">{formatDate(client.planAnniversary)}</dd>
              </div>
            </div>
          </dl>
        )}
      </div>

      {/* Dependentes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Dependentes{" "}
            <span className="text-gray-400 font-normal">({client.dependents.length})</span>
          </h2>
          <button
            onClick={() => setShowDepForm((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <UserPlus size={15} />
            Adicionar
          </button>
        </div>

        {/* Formulário de dependente */}
        {showDepForm && (
          <form
            onSubmit={handleAddDependent}
            className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
                <input
                  required
                  value={depName}
                  onChange={(e) => setDepName(e.target.value)}
                  placeholder="Nome do dependente"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Parentesco *</label>
                <input
                  required
                  value={depRelationship}
                  onChange={(e) => setDepRelationship(e.target.value)}
                  placeholder="Ex: Cônjuge, Filho"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={depBirthDate}
                  onChange={(e) => setDepBirthDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addingDep}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                {addingDep ? "Adicionando..." : "Adicionar"}
              </button>
              <button
                type="button"
                onClick={() => setShowDepForm(false)}
                className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de dependentes */}
        {client.dependents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Nenhum dependente cadastrado.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {client.dependents.map((dep) => (
              <li key={dep.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{dep.name}</p>
                  <p className="text-xs text-gray-500">
                    {dep.relationship}
                    {dep.birthDate ? ` · ${formatDate(dep.birthDate)}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveDependent(dep.id)}
                  disabled={removingDep === dep.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                  title="Remover dependente"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
