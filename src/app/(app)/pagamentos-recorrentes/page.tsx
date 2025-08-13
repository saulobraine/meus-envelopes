import { Suspense } from "react";
import { RecurringPaymentsManager } from "@/components/recurring/RecurringPaymentsManager";
import { RecurringPaymentsSkeleton } from "@/components/ui/skeletons";

export default function PagamentosRecorrentesPage() {
  return (
    <Suspense fallback={<RecurringPaymentsSkeleton />}>
      <PagamentosRecorrentesPageContent />
    </Suspense>
  );
}

function PagamentosRecorrentesPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Pagamentos Recorrentes
        </h1>
        <p className="text-muted-foreground">
          Gerencie seus pagamentos automáticos
        </p>
      </div>
      <RecurringPaymentsManager />
    </div>
  );
}
