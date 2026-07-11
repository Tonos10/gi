// app/(modals)/withdraw-money.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ModalTransaccion } from '../../components/ModalTransaccion';

export default function WithdrawMoneyModal() {
  const { t } = useTranslation();
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
      title={t("goals.withdraw_funds")}
    />
  );
}
