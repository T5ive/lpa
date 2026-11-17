import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LotteryDraw } from "../types/lottery";
import {
  LotteryDataError,
  type LotteryRepository,
} from "../services/lotteryRepository";
import { lotteryRepository } from "../services/staticJsonRepository";
import { sortDrawsAsc } from "../utils/compare";

interface LotteryDataContextValue {
  /** งวดทั้งหมด เรียงใหม่สุด → เก่าสุด */
  draws: LotteryDraw[];
  /** งวดทั้งหมด เรียงเก่าสุด → ใหม่สุด */
  drawsAsc: LotteryDraw[];
  loading: boolean;
  /** ปัญหาของไฟล์ข้อมูล (แสดงเป็น Error State ให้ dev แก้) */
  error: string[] | null;
  reload: () => void;
}

const LotteryDataContext = createContext<LotteryDataContextValue | null>(null);

export function LotteryDataProvider({
  children,
  repository = lotteryRepository,
}: {
  children: ReactNode;
  repository?: LotteryRepository;
}) {
  const [draws, setDraws] = useState<LotteryDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string[] | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .getAll()
      .then((result) => {
        if (cancelled) return;
        setDraws(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof LotteryDataError
            ? err.issues
            : [err instanceof Error ? err.message : String(err)],
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [repository, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const value = useMemo<LotteryDataContextValue>(
    () => ({
      draws,
      drawsAsc: sortDrawsAsc(draws),
      loading,
      error,
      reload,
    }),
    [draws, loading, error, reload],
  );

  return (
    <LotteryDataContext.Provider value={value}>
      {children}
    </LotteryDataContext.Provider>
  );
}

export function useLotteryData(): LotteryDataContextValue {
  const context = useContext(LotteryDataContext);
  if (!context) {
    throw new Error("useLotteryData ต้องใช้ภายใต้ LotteryDataProvider เท่านั้น");
  }
  return context;
}
