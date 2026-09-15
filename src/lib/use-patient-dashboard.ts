"use client";

import { useCallback, useEffect, useState } from "react";
import type { PatientDashboardSnapshot } from "./patient-dashboard-types";

export function usePatientDashboard() {
  const [snapshot, setSnapshot] = useState<PatientDashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    void fetch("/api/dashboard", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          setError("Could not load your dashboard");
          return;
        }
        setSnapshot((await res.json()) as PatientDashboardSnapshot);
        setError(null);
      })
      .catch(() => setError("Could not load your dashboard"));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { snapshot, error, loading: !snapshot && !error, reload };
}
