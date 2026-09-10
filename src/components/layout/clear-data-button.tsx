"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clearAllLocalData } from "@/lib/local-storage/storage";

export function ClearDataButton() {
  const [cleared, setCleared] = useState(false);
  return (
    <Button
      variant="danger"
      onClick={() => {
        clearAllLocalData();
        setCleared(true);
      }}
    >
      {cleared ? "Dados apagados ✓" : "Apagar meu estado salvo e minha cola"}
    </Button>
  );
}
