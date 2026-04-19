'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Plus, Trash2, RefreshCw, FileText } from 'lucide-react';
import { FamilyForm } from '@/components/family/FamilyForm';
import { useFamily, useFamilyActions } from '@/hooks/family.hook';
import { usePaymentActions } from '@/hooks/payment.hook';
import { useSeasons } from '@/hooks/season.hook';
import { useInvoice } from '@/hooks/invoice.hook';
import { Button, Card, ErrorMessage, DataTable, Column, StatusBadge, ConfirmModal, ActionsDropdown } from '@/components/ui';
import { ActionBar } from '@/components/ui/ActionBar';
import { UpdateFamilyInput } from '@/lib/schemas/family.input';
import { MemberWithMembershipsAndRegistrationsDTO } from '@/lib/dto/member.dto';
import { PaymentDTO } from '@/lib/dto/payment.dto';
import { FamilyWithFullDetailsDTO } from '@/lib/dto/family.dto';
import { SEASON_STATUS } from '@/lib/domain/enums/season.enum';
import { PAYMENT_STATUS, PAYMENT_TYPE } from '@/lib/domain/enums/payment.enum';
import { computeFinancialStats, FamilyFinancialStats } from '@/lib/domain/finance';
import { FamilyBalanceCard } from '@/components/payment/FamilyBalanceCard';
import { PaymentSlideOver } from '@/components/payment/PaymentSlideOver';
import { CashPaymentModal } from '@/components/payment/CashPaymentModal';
import { MemberSlideOver } from '@/components/member/MemberSlideOver';
import { InvoiceButton } from '@/components/invoice/InvoiceButtons';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';
import { reconcileFamilySeason } from '@/lib/actions/reconcilation.actions';

interface FamilyDetailPageClientProps {
  initialFamily: FamilyWithFullDetailsDTO;
  userRole: UserRole;
}

export function FamilyDetailPageClient({ initialFamily, userRole }: FamilyDetailPageClientProps) {
  const router = useRouter();
  const familyId = initialFamily.id;

  const { family, isLoading: familyLoading, mutate } = useFamily(familyId);
  const { data: seasons } = useSeasons();
  const { update, remove, isLoading: mutationLoading, error } = useFamilyActions();
  const { remove: removePayment } = usePaymentActions();

  const activeSeason = seasons?.find(s => s.status === SEASON_STATUS.ACTIVE);
  const { invoice } = useInvoice(familyId, activeSeason?.id);

  const [isEditing, setIsEditing] = useState(false);
  const [isPaymentSlideOverOpen, setIsPaymentSlideOverOpen] = useState(false);
  const [isMemberSlideOverOpen, setIsMemberSlideOverOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDTO | null>(null);
  const [isConfirmDeleteFamilyOpen, setIsConfirmDeleteFamilyOpen] = useState(false);
  const [isConfirmDeletePaymentOpen, setIsConfirmDeletePaymentOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  const canUpdate = UserRolePermissions.canEdit(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);

  const payments = family?.payments?.filter(p => p.seasonId === activeSeason?.id);

  const financialStats: FamilyFinancialStats = useMemo(() => {
    if (!family?.payments || !family?.members || !activeSeason)
      return { totalPaid: 0, totalDue: 0, balance: 0 };
    return computeFinancialStats(family.members, family.payments, activeSeason.id);
  }, [family?.members, family?.payments, activeSeason]);

  const handleReconcile = async () => {
    if (!activeSeason) return;
    setIsReconciling(true);
    try { await reconcileFamilySeason(familyId, activeSeason.id); await mutate(); }
    finally { setIsReconciling(false); }
  };

  const handleUpdate = async (data: UpdateFamilyInput) => {
    await update(familyId, data);
    setIsEditing(false);
    mutate();
  };

  const handleDelete = async () => {
    await remove(familyId);
    router.push('/families');
  };

  const handleCash = (payment: PaymentDTO) => { setSelectedPayment(payment); setIsCashModalOpen(true); };
  const handleDeletePaymentClick = (payment: PaymentDTO) => { setSelectedPayment(payment); setIsConfirmDeletePaymentOpen(true); };
  const handleDeletePayment = async () => {
    if (!selectedPayment) return;
    try { await removePayment(selectedPayment.id); mutate(); }
    finally { setSelectedPayment(null); }
  };

  const memberColumns: Column<MemberWithMembershipsAndRegistrationsDTO>[] = useMemo(() => [
    { type: 'computed', label: 'Nom', render: (m) => `${m.firstName} ${m.lastName}` },
    {
      type: 'computed',
      label: activeSeason ? `Adhésion ${activeSeason.startYear}/${activeSeason.endYear}` : '',
      render: (m) => {
        const ms = m.memberships?.find(o => o.seasonId === activeSeason?.id);
        return ms ? <StatusBadge type="membership" status={ms.status} /> : '-';
      },
    },
  ], [activeSeason]);

  const paymentColumns: Column<PaymentDTO>[] = useMemo(() => [
    { type: 'field', key: 'amount', label: 'Montant', render: (p) => `${p.amount.toFixed(2)} €` },
    {
      type: 'field', key: 'paymentType', label: 'Type',
      render: (p) => ({ cash: 'Espèces', check: 'Chèque', transfer: 'Virement', card: 'Carte' }[p.paymentType] ?? p.paymentType),
    },
    { type: 'field', key: 'paymentDate', label: 'Date paiement', render: (p) => new Date(p.paymentDate).toLocaleDateString('fr-FR') },
    { type: 'field', key: 'cashingDate', label: 'Date encaissement', render: (p) => p.cashingDate ? new Date(p.cashingDate).toLocaleDateString('fr-FR') : '-' },
    { type: 'field', key: 'status', label: 'Statut', render: (p) => <StatusBadge type="payment" status={p.status} /> },
    { type: 'field', key: 'reference', label: 'Référence', render: (p) => p.reference || '-' },
    ...(canUpdate || canDelete ? [{
      type: 'action' as const, label: 'Actions',
      render: (p: PaymentDTO) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {canUpdate && p.status === PAYMENT_STATUS.PENDING && p.paymentType === PAYMENT_TYPE.CHECK && (
            <Button size="sm" onClick={() => handleCash(p)}>Encaisser</Button>
          )}
          {canDelete && <Button size="sm" variant="danger" onClick={() => handleDeletePaymentClick(p)} Icon={Trash2} />}
        </div>
      ),
    }] : []),
  ], [canUpdate, canDelete, selectedPayment]);

  // Actions partagées entre ActionBar (mobile) et ActionsDropdown (desktop)
  const actions = [
    { label: 'Sync', icon: RefreshCw, onClick: handleReconcile, isLoading: isReconciling, hidden: !canUpdate || !activeSeason || isEditing },
    { label: 'Modifier', icon: Pencil, onClick: () => setIsEditing(true), hidden: !canUpdate || isEditing },
    { label: 'Supprimer', icon: Trash2, onClick: () => setIsConfirmDeleteFamilyOpen(true), variant: 'danger' as const, hidden: !canDelete || isEditing },
  ];

  if (familyLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (!family) return <div className="container mx-auto p-6"><Card><p>Famille introuvable</p></Card></div>;

  return (
    <div className="container mx-auto p-6 max-w-6xl pb-24 sm:pb-6">
      <Link href="/families" className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Famille : {family.name}</h1>
        <div className="flex items-center gap-2">
          {/* Facture visible partout */}
          {invoice && <InvoiceButton invoice={invoice} />}
          {/* Dropdown ⋮ desktop uniquement */}
          {!isEditing && <ActionsDropdown items={actions} />}
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      {isEditing ? (
        <FamilyForm initialData={family} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} isLoading={mutationLoading} />
      ) : (
        <div className="space-y-6">
          <Card title="Informations">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><dt className="text-sm font-medium text-gray-500">Email</dt><dd className="mt-1 text-sm text-gray-900">{family.email || '-'}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500">Téléphone</dt><dd className="mt-1 text-sm text-gray-900">{family.phone || '-'}</dd></div>
              <div className="md:col-span-2"><dt className="text-sm font-medium text-gray-500">Adresse</dt><dd className="mt-1 text-sm text-gray-900">{family.address || '-'}</dd></div>
            </dl>
          </Card>

          {activeSeason && <FamilyBalanceCard financialStats={financialStats} />}

          <Card
            title="Membres de la famille"
            actions={canUpdate && <Button size="sm" onClick={() => setIsMemberSlideOverOpen(true)}>Ajouter un membre</Button>}
          >
            <DataTable<MemberWithMembershipsAndRegistrationsDTO>
              data={family.members}
              columns={memberColumns}
              onRowClick={(m) => router.push(`/members/${m.id}`)}
              emptyMessage="Aucun membre dans cette famille"
            />
            {isMemberSlideOverOpen && (
              <MemberSlideOver isOpen={isMemberSlideOverOpen} onClose={() => setIsMemberSlideOverOpen(false)} onSuccess={() => mutate()} familyId={family.id} />
            )}
          </Card>

          {activeSeason && (
            <Card
              title={`Paiements - ${activeSeason.startYear}-${activeSeason.endYear}`}
              actions={canUpdate && <Button size="sm" onClick={() => setIsPaymentSlideOverOpen(true)}><Plus className="w-4 h-4 mr-1" />Nouveau paiement</Button>}
            >
              <DataTable<PaymentDTO> data={payments || []} columns={paymentColumns} emptyMessage="Aucun paiement enregistré" />
            </Card>
          )}

          {activeSeason && (
            <PaymentSlideOver isOpen={isPaymentSlideOverOpen} onClose={() => setIsPaymentSlideOverOpen(false)} familyId={familyId} seasonId={activeSeason.id} onSuccess={() => mutate()} />
          )}
          {selectedPayment && (
            <CashPaymentModal isOpen={isCashModalOpen} onClose={() => { setIsCashModalOpen(false); setSelectedPayment(null); }} payment={selectedPayment} onSuccess={() => mutate()} />
          )}
        </div>
      )}

      {/* Mobile uniquement */}
      <ActionBar items={actions} />

      <ConfirmModal isOpen={isConfirmDeletePaymentOpen} title="Supprimer le paiement" content="Êtes-vous sûr de vouloir supprimer ce paiement ?" onClose={() => { setIsConfirmDeletePaymentOpen(false); setSelectedPayment(null); }} onConfirm={handleDeletePayment} />
      <ConfirmModal isOpen={isConfirmDeleteFamilyOpen} title="Supprimer la famille" content="Êtes-vous sûr de vouloir supprimer cette famille ?" onClose={() => setIsConfirmDeleteFamilyOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}