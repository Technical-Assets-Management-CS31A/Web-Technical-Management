// API times are ISO 8601 UTC; TAMS shows them in Asia/Manila.
export const FormattedDateTime = (datetime: string) => {
  if (!datetime) return;
  const formattedDateTime = new Date(datetime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: "Asia/Manila",
  });
  return formattedDateTime;
};
