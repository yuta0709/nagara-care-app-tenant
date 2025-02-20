import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

import type { Route } from "./+types/root";
import "./app.css";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background/50 to-background/95">
      <Card className="w-full max-w-2xl border-none shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <CardHeader className="space-y-1 text-center pb-2">
          <CardTitle className="text-4xl font-bold tracking-tight">
            {message}
          </CardTitle>
          <p className="text-sm text-muted-foreground">エラーが発生しました</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert
            variant="destructive"
            className="border-destructive/50 bg-destructive/10"
          >
            <AlertTitle className="text-destructive font-medium">
              問題が発生しました
            </AlertTitle>
            <AlertDescription className="text-destructive/90 mt-2">
              {details}
            </AlertDescription>
          </Alert>

          {stack && (
            <Card className="bg-muted/50 border-none shadow-inner">
              <CardContent className="p-4">
                <pre className="w-full overflow-x-auto text-sm text-muted-foreground">
                  <code>{stack}</code>
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
