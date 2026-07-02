// app/(modals)/withdraw-money.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ModalTransaccion } from '../../components/ModalTransaccion';

export default function WithdrawMoneyModal() {
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const [isVisible, setIsVisible] = useState(true);

  if (!goalId) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => router.back(), 250);
  };

  return (
    <ModalTransaccion
      isVisible={isVisible}
      onClose={handleClose}
      type="withdraw"
      goalId={goalId as string}
      title="Retirar Fondos"
    />
  );
}
