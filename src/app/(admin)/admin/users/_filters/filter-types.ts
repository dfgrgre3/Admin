export interface UserListFiltersPanelProps {
  open: boolean;
  onToggle: () => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  canViewFinancial: boolean;

  country: string; setCountry: (v: string) => void;
  city: string; setCity: (v: string) => void;
  gender: string; setGender: (v: string) => void;
  verified: string; setVerified: (v: string) => void;
  subscriptionStatus: string; setSubscriptionStatus: (v: string) => void;
  paymentStatus: string; setPaymentStatus: (v: string) => void;
  online: string; setOnline: (v: string) => void;
  createdFrom: string; setCreatedFrom: (v: string) => void;
  createdTo: string; setCreatedTo: (v: string) => void;
  walletMin: string; setWalletMin: (v: string) => void;
  walletMax: string; setWalletMax: (v: string) => void;
  includeDeleted: boolean; setIncludeDeleted: (v: boolean) => void;
  onFilterChange: () => void;
}