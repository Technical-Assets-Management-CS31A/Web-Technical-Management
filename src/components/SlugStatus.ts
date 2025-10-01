export const SlugStatus = (status: string) => {
  if (!status) return;
  if (status === "returned") return "bg-green-100 text-green-700";
  if (status === "borrowed") return "bg-blue-100 text-blue-700";
  if (status === "overdue") return "bg-yellow-100 text-yellow-700";
  if (status === "lost") return "bg-red-100 text-red-700";

  return status;
};
