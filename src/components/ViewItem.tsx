import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { TItemList } from "../types/types";
import { useItemDetailsQuery } from "../query/get/useItemDetailsQuery";
import ViewItemSkeletonLoader from "../loader/ViewItemSkeletonLoader";
import { FaArrowCircleLeft, FaEdit } from "react-icons/fa";
import { IoMdWarning } from "react-icons/io";
import { FaHashtag, FaTools } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { BsCalendar2Date } from "react-icons/bs";
import { MdOutlineDescription } from "react-icons/md";
import { FaBarcode } from "react-icons/fa6";
import { useState } from "react";
import { EditItemForm } from "./EditItemForm";
import { FormattedDateTime } from "./FormatedDateTime";

export default function ViewItem() {
  const { id } = useParams<{ id: string }>();
  const itemId = String(id);
  const [isEditItemFormOpen, setIsEditItemFormOpen] = useState(false);
  const { data, isLoading, error } = useQuery(useItemDetailsQuery(itemId));

  if (isLoading) {
    return <ViewItemSkeletonLoader />;
  }

  if (error || !data) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoMdWarning className="text-red-500 w-8 h-8" />
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
      <div className="relative max-w-6xl mx-auto">
        <div className="absolute top-0 left-0 flex flex-row justify-between w-full gap-2">
          <Link to="/home/inventory-list">
            <FaArrowCircleLeft className="text-blue-600 w-8 h-8 cursor-pointer" />
          </Link>
          <button type="button" onClick={() => setIsEditItemFormOpen(true)}>
            <FaEdit className="text-blue-600 w-8 h-8 cursor-pointer" />
          </button>
        </div>
        {/* Header */}
        <div className="text-center mb-8 mt-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {itemDetails.itemName}
          </h1>
          <p className="text-gray-600 font-bold">{itemDetails.category}</p>
        </div>

        {/* Image Section */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Serial Number */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <FaHashtag className="text-white w-4 h-4" />
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
                <FaCheckCircle className="text-white w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Condition</h3>
            </div>
            <p className="text-gray-600">{itemDetails.condition}</p>
          </div>

          {/* Item Make */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <FaTools className="text-white w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Item Make</h3>
            </div>
            <p className="text-gray-600">{itemDetails.itemMake}</p>
          </div>

          {/* Item Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <FaTools className="text-white w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Item Type</h3>
            </div>
            <p className="text-gray-600">{itemDetails.itemType}</p>
          </div>

          {/* Item Model */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <FaHashtag className="text-white w-4 h-4" />
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
                <BsCalendar2Date className="text-white w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Date Added
              </h3>
            </div>
            <p className="text-gray-600">
              {FormattedDateTime(itemDetails.createdAt)}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-row justify-between gap-4">
          <div className="flex flex-1 bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="mb-3">
              <div className="flex flex-row items-center mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                  <MdOutlineDescription className="text-white w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Description
                </h3>
              </div>
              <p className="text-gray-600">{itemDetails.description}</p>
            </div>
          </div>
          {/* Barcode */}
          <div className="flex flex-1 bg-white rounded-lg shadow-md p-4 mt-6">
            <div className="w-full flex justify-center items-center">
              {itemDetails.barCode ? (
                <img
                  src={itemDetails.barCode}
                  alt="Barcode"
                  className="w-32 h-32"
                />
              ) : (
                <p className="text-gray-600/50">
                  Don't have generated BarCode.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-end mt-6">
          <button
            type="button"
            className="text-lg font-semibold text-gray-900 cursor-pointer float-right bg-white rounded-lg shadow-md p-4 px-8"
          >
            <div className="flex flex-row justify-center items-center gap-2">
              {itemDetails.barCode ? (
                <>
                  <FaBarcode />
                  <p className="text-gray-600/50">
                    You have generated BarCode.
                  </p>
                </>
              ) : (
                <>
                  <FaBarcode />
                  <p className="text-gray-600/50">Generate BarCode ?</p>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
      {isEditItemFormOpen && (
        <EditItemForm
          onClose={() => setIsEditItemFormOpen(false)}
          id={itemId}
        />
      )}
    </div>
  );
}
