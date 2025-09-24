export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Primer:
formatDateTime("2222-12-12T14:02");
// "December 12, 2222, 2:02 PM"
