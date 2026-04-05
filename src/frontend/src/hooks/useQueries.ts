import { useQuery } from "@tanstack/react-query";
import { InventoryCategory, type InventoryItem } from "../backend.d";
import { useActor } from "./useActor";

export function useInventoryItems() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ["inventoryItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInventoryItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export { InventoryCategory };
