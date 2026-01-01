'use client'

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SeasonForm } from "@/components/season/SeasonForm";
import { useSeason, useSeasonActions } from "@/hooks/season";
import { Button, Card, ErrorMessage, StatusBadge } from "@/components/ui";
import { UpdateSeasonInput } from "@/lib/schemas/season.input";

export default function SeasonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const seasonId = parseInt(resolvedParams.id);
  const { season, isLoading: seasonLoading, mutate } = useSeason(seasonId);

  const { update, remove, isLoading: mutationLoading, error } = useSeasonActions();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: UpdateSeasonInput) => {
    await update(seasonId, data);
    setIsEditing(false);
    mutate();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this season? This will also delete all related registrations.')) {
      await remove(seasonId);
      router.push('/seasons');
    }
  };

  if (seasonLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Saison introuvable</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href="/seasons"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Saison {season.startYear} - {season.endYear}
              <StatusBadge type="season" status={season.status} />
          </h1>
          <p className="text-gray-600 mt-1">
            
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button onClick={() => setIsEditing(true)}>Modifier</Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      {isEditing ? (
        <SeasonForm
          initialData={season}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Season Information">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Period</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {season.startYear} - {season.endYear}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Montant Adhésion</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  {Number(season.membershipAmount)} €
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Réduction</dt>
                <dd className="mt-1">
                  {season.discountPercent} %
                </dd>
              </div>
            </dl>
          </Card>

        </div>
      )}
    </div>
  );
}