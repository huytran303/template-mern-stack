interface AppEmptyStateProps {
  message: string;
}

export function AppEmptyState({ message }: AppEmptyStateProps) {
  return <p className="text-sm text-gray-500">{message}</p>;
}
