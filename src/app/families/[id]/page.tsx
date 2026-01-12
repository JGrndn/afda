'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Plus, Trash2} from 'lucide-react';
import { FamilyForm } from '@/components/family/FamilyForm';
import { useFamily, useFamilyActions } from '@/hooks/family.hook';
import { Button, Card, ErrorMessage, DataTable, Column, StatusBadge, ConfirmModal } from '@/components/ui';
import { UpdateFamilyInput } from '@/lib/schemas/family.input';
import { MemberWithMembershipsAndRegistrationsDTO } from '@/lib/dto/member.dto';
import { PaymentDTO } from '@/lib/dto/payment.dto';
import { usePaymentActions } from '@/hooks/payment.hook';
import { useSeasons } from '@/hooks/season.hook';
import { SEASON_STATUS } from '@/lib/domain/season.enum';
import { FamilyBalanceCard } from '@/components/payment/FamilyBalanceCard';
import { PaymentSlideOver } from '@/components/payment/PaymentSlideOver';
import { CashPaymentModal } from '@/components/payment/CashPaymentModal';
import { PAYMENT_STATUS, PAYMENT_TYPE } from '@/lib/domain/payment.enum';
import { computeFinancialStats, FamilyFinancialStats } from '@/lib/domain/finance';
import { MemberSlideOver } from '@/components/member/MemberSlideOver';
import { ReconcileFamilySeasonButton } from '@/components/membership/ReconcileFamilySeasonButton';

export default function FamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const familyId = parseInt(resolvedParams.id);
  
  const { family, isLoading: familyLoading, mutate } = useFamily(familyId);
  const { data:seasons, isLoading: seasonsLoading } = useSeasons();
  const { update, remove, isLoading: mutationLoading, error } = useFamilyActions();
  const { remove: removePayment } = usePaymentActions();

  const [isEditing, setIsEditing] = useState(false);
  const [isPaymentSlideOverOpen, setIsPaymentSlideOverOpen] = useState(false);
  const [isMemberSlideOverOpen, setIsMemberSlideOverOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDTO | null>(null);
  const [isConfirmModalDeleteFamilyOpen, setIsConfirmModalDeleteFamilyOpen] = useState(false);
  const [isConfirmModalDeletePaymentOpen, setIsConfirmModalDeletePaymentOpen] = useState(false);

  const [isEditingPayment, setIsEditingPayment] = useState(false);
  
  // Récupérer la saison active et les paiements de cette saison
  const activeSeason = seasons.find(s=> s.status === SEASON_STATUS.ACTIVE);
  const payments = family?.payments?.filter(p => p.seasonId === activeSeason?.id)
  
  const financialStats: FamilyFinancialStats = useMemo(() => {
    if (!family || !family.payments || !family.members || !activeSeason){
      return {
        totalPaid: 0,
        totalDue: 0,
        balance: 0,
      }
    }
    return computeFinancialStats(family.members, family.payments, activeSeason.id);
  }, [family?.members, family?.payments]);

  const handleUpdate = async (data: UpdateFamilyInput) => {
    await update(familyId, data);
    setIsEditing(false);
    mutate();
  };

  const handleRefreshSuccess = () => {
    mutate();
  }

  const handleDeleteRequest = async() => {
    setIsConfirmModalDeleteFamilyOpen(true);
  }
  
  const handleDelete = async () => {
    await remove(familyId);
    router.push('/families');
  };

  const handleAddMemberSuccess = ()=>{
    mutate();
  }

  const handleCash = (payment: PaymentDTO) => {
    setSelectedPayment(payment);
    setIsCashModalOpen(true);
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;
    try{
      await removePayment(selectedPayment.id);
      mutate();
    } catch(error){
      console.log(error);
    } finally{
      setSelectedPayment(null);
    }
  }

  const handleDeletePaymentClick = async (payment: PaymentDTO) => {
    setIsConfirmModalDeletePaymentOpen(true);
    setSelectedPayment(payment);
  }

  const handlePaymentSucess = () => {
    mutate();
  };

  if (familyLoading || seasonsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Famille introuvable</p>
        </Card>
      </div>
    );
  }

  const memberColumns: Column<MemberWithMembershipsAndRegistrationsDTO>[] = [
    {
      type: 'computed',
      label: 'Nom',
      render: (member) => `${member.firstName} ${member.lastName}`,
    },
    {
      type: 'computed',
      label: activeSeason ? `Adhérent saison ${activeSeason.startYear}/${activeSeason.endYear}` : '',
      render: (member) => {
        const ms = member.memberships?.find(o => o.seasonId === activeSeason?.id);
        return ms ? <StatusBadge type='membership' status={ms.status} /> : '-';
      },
    }
  ];

  const paymentColumns: Column<PaymentDTO>[] = [
    {
      type: 'field',
      key: 'amount',
      label: 'Montant',
      render: (payment) => `${payment.amount.toFixed(2)} €`,
    },
    {
      type: 'field',
      key: 'paymentType',
      label: 'Type',
      render: (payment) => {
        const types: Record<string, string> = {
          cash: 'Espèces',
          check: 'Chèque',
          transfer: 'Virement',
          card: 'Carte',
        };
        return types[payment.paymentType] || payment.paymentType;
      },
    },
    {
      type: 'field',
      key: 'paymentDate',
      label: 'Date paiement',
      render: (payment) => new Date(payment.paymentDate).toLocaleDateString('fr-FR'),
    },
    {
      type: 'field',
      key: 'cashingDate',
      label: 'Date encaissement',
      render: (payment) =>
        payment.cashingDate ? new Date(payment.cashingDate).toLocaleDateString('fr-FR') : '-',
    },
    {
      type: 'field',
      key: 'status',
      label: 'Statut',
      render: (payment) => <StatusBadge type="payment" status={payment.status}/>,
    },
    {
      type: 'field',
      key: 'reference',
      label: 'Référence',
      render: (payment) => payment.reference || '-',
    },
    {
      type: 'action',
      label: 'Actions',
      render: (payment) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {payment.status === PAYMENT_STATUS.PENDING && payment.paymentType === PAYMENT_TYPE.CHECK && (
            <Button size="sm" onClick={() => handleCash(payment)}>
              Encaisser
            </Button>
          )}
          {<Button
            size="sm"
            variant="danger"
            onClick={() => {
              return handleDeletePaymentClick(payment);
            }}
            disabled={selectedPayment?.id === payment.id}
            Icon={Trash2}
          >
            {selectedPayment?.id === payment.id ? 'Suppression...' : ''}
          </Button>}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href="/families"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Famille : {family.name}</h1>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              {activeSeason && 
                <ReconcileFamilySeasonButton familyId={family.id} seasonId={activeSeason.id} onSuccess={handleRefreshSuccess} />
              }
              <Button onClick={() => setIsEditing(true)} Icon={Pencil} />
              <Button variant="danger" onClick={handleDeleteRequest} Icon={Trash2} />
            </>
          )}
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      {isEditing ? (
        <FamilyForm
          initialData={family}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Informations">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{family.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd className="mt-1 text-sm text-gray-900">{family.phone || '-'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                <dd className="mt-1 text-sm text-gray-900">{family.address || '-'}</dd>
              </div>
            </dl>
          </Card>

          {activeSeason && (/* situation financière */
            <FamilyBalanceCard financialStats={financialStats} />
          )}

          <Card 
            title="Membres de la famille"
            actions={
              <Button size="sm" onClick={() => setIsMemberSlideOverOpen(true)}>
                Ajouter un membre
              </Button>
              // ajouter le composant plutôt que la redirection vers la page
            }
          >
            <DataTable<MemberWithMembershipsAndRegistrationsDTO>
              data={family.members}
              columns={memberColumns}
              onRowClick={(member) => router.push(`/members/${member.id}`)}
              emptyMessage="Aucun membre dans cette famille"
            />
            {isMemberSlideOverOpen && 
              <MemberSlideOver
                isOpen={isMemberSlideOverOpen}
                onClose={()=> setIsMemberSlideOverOpen(false)}
                onSuccess={handleAddMemberSuccess}
                familyId={family.id}
              />
            }
          </Card>
              
          {/* Paiements */}
          {activeSeason && (
            <Card
              title={`Paiements - ${activeSeason.startYear}-${activeSeason.endYear}`}
              actions={
                !isEditingPayment && (
                  <Button size="sm" onClick={() => setIsPaymentSlideOverOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Nouveau paiement
                  </Button>
                )
              }
            >
              <DataTable<PaymentDTO>
                data={payments}
                columns={paymentColumns}
                emptyMessage="Aucun paiement enregistré"
              />
              
            </Card>
          )}
          {activeSeason &&(
            <PaymentSlideOver 
              isOpen={isPaymentSlideOverOpen}
              onClose={() => setIsPaymentSlideOverOpen(false)} 
              familyId={familyId}
              seasonId={activeSeason.id}
              onSuccess={handlePaymentSucess}        
            />
          )}
          {selectedPayment && (
          <CashPaymentModal
            isOpen={isCashModalOpen}
            onClose={() => {
              setIsCashModalOpen(false);
              setSelectedPayment(null);
            }}
            payment={selectedPayment} 
            onSuccess={handlePaymentSucess}
          />
          )}
        </div>
      )}
      <ConfirmModal
        isOpen={isConfirmModalDeletePaymentOpen}
        title={'Supprimer le paiement'}
        content={'Etes-vous sûr de vouloir supprimer ce paiement ?'}
        onClose={() => {
          setIsConfirmModalDeletePaymentOpen(false);
          setSelectedPayment(null);
        }}
        onConfirm={handleDeletePayment}
      />
      <ConfirmModal
        isOpen={isConfirmModalDeleteFamilyOpen}
        title={'Supprimer la famille'}
        content={'Etes-vous sûr de vouloir supprimer cette famille ?'}
        onClose={() => {
          setIsConfirmModalDeleteFamilyOpen(false);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}