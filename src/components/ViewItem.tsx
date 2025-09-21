import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { TItemList } from "../types/types";
import { useItemDetailsQuery } from "../query/get/useItemDetailsQuery";

export default function ViewItem() {
    const { id } = useParams<{ id: string }>();
    const itemId = Number(id);

    const { data, isLoading, error } = useQuery(useItemDetailsQuery(itemId))

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <span className="text-lg text-[#2563eb] font-semibold">Loading...</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="w-full h-screen flex justify-center items-center">
                <span className="text-lg text-red-500 font-semibold">Failed to load item details.</span>
            </div>
        );
    }

    const itemDetails: TItemList = data;

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl mx-auto mt-8">
            <h2 className="text-3xl font-extrabold text-[#1e293b] mb-4">Item Details</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div>
                    {itemDetails.image ? (
                        <img
                            src={typeof itemDetails.image === "string" ? itemDetails.image : ""}
                            alt={itemDetails.ItemName}
                            className="w-40 h-40 object-cover rounded-xl shadow-lg border"
                        />
                    ) : (
                        <div className="w-40 h-40 flex items-center justify-center bg-gray-200 rounded-xl text-gray-500">
                            No Image
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="mb-2">
                        <span className="font-semibold text-[#2563eb]">Name:</span> {itemDetails.ItemName}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-[#2563eb]">Serial Number:</span> {itemDetails.SerialNumber}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-[#2563eb]">Category:</span> {itemDetails.Category}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-[#2563eb]">Condition:</span> {itemDetails.Condition}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-[#2563eb]">Date Added:</span> {itemDetails.datetime}
                    </div>
                </div>
            </div>
        </div>
    );
}

