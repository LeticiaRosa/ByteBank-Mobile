import "./global.css";
import { ThemeProvider } from "./src/hooks/useTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthForm } from "./src/components/AuthForm";

// Criar instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos de cache (garbage collection time)
      retry: 2,
      refetchOnWindowFocus: false, // Evita refetch desnecessário
      refetchOnMount: false, // Evita refetch no mount se dados estão válidos
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthForm />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
