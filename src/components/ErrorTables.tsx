export default function ErrorTable() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-red-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-red-700 mb-2">
        Oops! Something went wrong
      </h2>
      <p className="text-red-600 text-center mb-4">
        We were unable to load your data. Please check your internet connection
        or try again later.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Retry
      </button>
    </div>
  );
}
