export const formatRM = (amount: number): string => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
