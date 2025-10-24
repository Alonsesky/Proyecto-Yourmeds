import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";

export function useAsyncStorageDump() {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      const obj: Record<string, any> = {};
      for (const [k, v] of pairs) {
        try { obj[k] = v ? JSON.parse(v) : v; } catch { obj[k] = v; }
      }
      setData(obj);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAll = useCallback(async () => {
    await AsyncStorage.clear();
    setData({});
  }, []);

  return { data, loading, refresh, clearAll };
}