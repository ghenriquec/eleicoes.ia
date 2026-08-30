"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clearAllLocalData } from "@/lib/quiz/storage";

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
      {cleared ? "Dados apagados ✓" : "Apagar minhas respostas e minha cola"}
    </Button>
  );
}
