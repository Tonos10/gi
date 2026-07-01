// app/(modals)/add-money.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { TransactionModal } from "../../components/TransactionModal";

export default function AddMoneyModal() {
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const [isVisible, setIsVisible] = useState(true);

  if (!goalId) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => router.back(), 250);
  };

  return (
    <TransactionModal
      isVisible={isVisible}
      onClose={handleClose}
      type="deposit"
      goalId={goalId as string}
      title="Nuevo Depósito"
    />
  );
}
