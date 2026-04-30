import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "eu-acts-rag-ranalyzer" },
      { name: "description", content: "Chat to Connect creates a chatbot that integrates with webhooks for dynamic data retrieval." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "eu-acts-rag-ranalyzer" },
      { property: "og:description", content: "Chat to Connect creates a chatbot that integrates with webhooks for dynamic data retrieval." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "eu-acts-rag-ranalyzer" },
      { name: "twitter:description", content: "Chat to Connect creates a chatbot that integrates with webhooks for dynamic data retrieval." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a3617c30-45d2-40f1-8268-62608e07bcf6/id-preview-da1cf6b3--93b47184-c4ba-47e8-ac49-289721b96f25.lovable.app-1777492593012.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a3617c30-45d2-40f1-8268-62608e07bcf6/id-preview-da1cf6b3--93b47184-c4ba-47e8-ac49-289721b96f25.lovable.app-1777492593012.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
