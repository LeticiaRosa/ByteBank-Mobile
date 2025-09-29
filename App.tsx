import "./global.css";
import { ThemeProvider } from "./src/hooks/useTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthForm } from "./src/components/AuthForm";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/components/ui/ToastConfig";

// Criar instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 15, // 15 segundos (alinhado com o menor staleTime em QUERY_CONFIG)
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
      <Toast config={toastConfig} />
    </QueryClientProvider>
  );
}
