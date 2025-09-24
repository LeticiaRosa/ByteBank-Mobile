import "./global.css";
import { ThemeProvider } from "./src/hooks/useTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthForm } from "./src/components/AuthForm";

// Criar instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 1 minuto
      gcTime: 1000 * 60 * 30, // 30 minutos de cache (garbage collection time)
      retry: 2,
      refetchOnWindowFocus: true, // Atualiza quando o app volta ao foco
      refetchOnMount: true, // Atualiza quando componentes são montados
      refetchOnReconnect: true, // Atualiza quando reconecta à internet
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
