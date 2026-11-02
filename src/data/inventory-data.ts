import { useMemo, useState } from "react";
import type { AssetDto } from "../@types/types";
import { useQuery } from "@tanstack/react-query";
import { useAllAssets } from "../hooks/assetHooks";

const EMPTY: AssetDto[] = [];

export const useAllInventoryItems = () => {
    const { data, isPending, isError } = useQuery(useAllAssets());
    const items = Array.isArray(data) ? data.filter((asset) => !asset.deletedAt) : EMPTY;

    return { items, isPending, isError }
}

export const useFilteredItems = (items: AssetDto[]) => {
    const [searchItem, setSearchItem] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedCondition, setSelectedCondition] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    // Search covers name, asset code, serial and tag; chips and dropdowns narrow by category, condition and status
    const filteredItems = useMemo(() => {
        const search = searchItem.trim().toLowerCase();
        return items
            .filter((item) => {
                const matchesSearch =
                    !search ||
                    item.name.toLowerCase().includes(search) ||
                    item.assetCode.toLowerCase().includes(search) ||
                    item.category?.name.toLowerCase().includes(search) ||
                    (item.serialNo ?? "").toLowerCase().includes(search) ||
                    (item.rfidTagUid ?? "").toLowerCase().includes(search);

                const matchesCategory = selectedCategory === "" || item.category?.id === selectedCategory;
                const matchesCondition = selectedCondition === "" || item.condition === selectedCondition;
                const matchesStatus = selectedStatus === "" || item.status === selectedStatus;

                return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [items, searchItem, selectedCategory, selectedCondition, selectedStatus]);

    return { filteredItems, setSearchItem, selectedCategory, setSelectedCategory, selectedCondition, setSelectedCondition, selectedStatus, setSelectedStatus }
}
