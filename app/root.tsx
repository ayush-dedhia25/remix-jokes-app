import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useCatch,
} from "@remix-run/react";
import globalLargeStylesUrl from "~/styles/global-large.css";
import globalMediumStylesUrl from "~/styles/global-medium.css";
import globalStylesUrl from "~/styles/global.css";

export const meta: MetaFunction = () => {
  const description = "Learn Remix and laugh at the same time";
  return {
    charset: "utf-8",
    description,
    title: "Remix is cool",
    viewport: "width=device-width,initial-scale=1",
    keywords: "Remix,joke",
    "twitter:image": "https://remix-jokes.lol/social.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": "Remix Jokes",
    "twitter:description": description,
  };
};

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    { rel: "stylesheet", href: globalStylesUrl },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
    },
    {
      rel: "stylesheet",
      href: globalMediumStylesUrl,
      media: "print, (min-width: 640px)",
    },
    {
      rel: "stylesheet",
      href: globalLargeStylesUrl,
      media: "screen and (min-width: 1024px)",
    },
  ];
};

function Document({
  children,
  title = "So great, its funny",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export default App;

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} - ${caught.statusText}`}>
      <div className="error-container">
        <h1>
          {caught.status} - {caught.statusText}
        </h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.log(error);

  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
