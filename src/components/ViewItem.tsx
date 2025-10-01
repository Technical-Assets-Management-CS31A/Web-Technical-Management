import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { TItemList } from "../types/types";
import { useItemDetailsQuery } from "../query/get/useItemDetailsQuery";
// import { useState } from "react";

export default function ViewItem() {
  const { id } = useParams<{ id: string }>();
  const itemId = String(id);
  // const [item, setItem] = useState<TItemList[]>([]);

  const { data, isLoading, error } = useQuery(useItemDetailsQuery(itemId));

  if (data) {
    // setItem(data);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="absolute top-16 left-1/2 transform -translate-x-1/2 text-sm text-slate-600 font-medium">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Unable to Load
          </h3>
          <p className="text-slate-600">
            Failed to load item details. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const itemDetails: TItemList = data;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {itemDetails.itemName}
          </h1>
          <p className="text-gray-600 font-bold">{itemDetails.category}</p>
          {/* Status */}
          {/*<div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 font-medium">
                Active Item
              </span>
            </div>
          </div>*/}
        </div>

        {/* Image Section - Full Width */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-center">
            {itemDetails.image ? (
              <img
                src={
                  typeof itemDetails.image === "string" ? itemDetails.image : ""
                }
                alt={itemDetails.itemName}
                className="w-64 h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <svg
                  className="w-12 h-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-500 text-sm">
                  No Image Available
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Serial Number */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Serial Number
              </h3>
            </div>
            <p className="text-gray-600">{itemDetails.serialNumber}</p>
          </div>

          {/* Condition */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Condition</h3>
            </div>
            <p className="text-gray-600">{itemDetails.condition}</p>
          </div>

          {/* Item Make */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Item Make</h3>
            </div>
            <p className="text-gray-600">{itemDetails.itemMake}</p>
          </div>

          {/* Item Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Item Type</h3>
            </div>
            <p className="text-gray-600">{itemDetails.itemType}</p>
          </div>

          {/* Item Model */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Item Model
              </h3>
            </div>
            <p className="text-gray-600">{itemDetails.itemModel}</p>
          </div>

          {/* Date Added */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Date Added
              </h3>
            </div>
            <p className="text-gray-600">{itemDetails.createdAt}</p>
          </div>
        </div>

        {/* Description - Full Width */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Description
          </h3>
          <p className="text-gray-600">{itemDetails.description}</p>
        </div>
      </div>
    </div>
  );
}
