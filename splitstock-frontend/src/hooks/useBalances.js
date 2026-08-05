import { useCallback, useEffect, useState } from "react";

import { readError } from "../api/client";
import { households } from "../api/endpoints";

/** Loads the corkboard payload for a household and exposes a settle-up action. */
export default function useBalances(householdId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(householdId));
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!householdId) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      setError("");
      const payload = await households.balances(householdId);
      setData(payload);
    } catch (err) {
      setError(readError(err, "Couldn't load the balance sheet."));
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const settle = useCallback(
    async ({ creditorId, amount, note }) => {
      const result = await households.settle(householdId, {
        creditor_id: creditorId,
        ...(amount != null ? { amount } : {}),
        ...(note ? { note } : {}),
      });
      await reload();
      return result;
    },
    [householdId, reload]
  );

  return { data, loading, error, reload, settle };
}
