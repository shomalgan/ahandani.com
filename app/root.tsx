import { ReactNode, useContext, useMemo } from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "remix";
import type { MetaFunction } from "remix";
import configs from "../configs";
import { useNavigate, useLocation } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { withEmotionCache } from "@emotion/react";
import useSettings from "~/components/Settings/hooks/use-settings-context";
import { unstable_useEnhancedEffect as useEnhancedEffect } from "@mui/material";
import ClientStyleContext from "./lib/client-style-context";
import Settings from "./components/Settings";
import Layout from "./components/Layout";
import theme from "./components/Layout/theme";

interface DocumentProps {
  children: ReactNode;
  title?: string;
}

export const meta: MetaFunction = () => {
  const settings = useSettings();

  const title = settings.configs?.siteTitle;
  const description = settings.configs?.description;
  const keywords = settings.configs?.keywords;
  const socialMediaImage = settings.configs?.socialMediaImage;
  const twitter = settings.configs?.twitter;

  return {
    charset: "utf-8",
    description,
    title: title,
    keywords: keywords,
    "twitter:image": socialMediaImage,
    "twitter:title": title,
    "twitter:description": description,
    "twitter:creator": twitter,
    "twitter:site": twitter,
    "twitter:card": "summary_large_image",

    "og:type": "website",
    "og:title": title,
    "og:description": description,
    "og:image": socialMediaImage,
  };
};

const Document = withEmotionCache(
  ({ children, title }: DocumentProps, emotionCache) => {
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEnhancedEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        // eslint-disable-next-line no-underscore-dangle
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="theme-color" content={theme.palette.primary.main} />
          <Meta />
          {title ? <title>{title}</title> : null}
          <Links />
          <meta
            name="emotion-insertion-point"
            content="emotion-insertion-point"
          />
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          {process.env.NODE_ENV === "development" && <LiveReload />}
        </body>
      </html>
    );
  }
);

const RouteAdapter: React.FC = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adaptedHistory = useMemo(
    () => ({
      replace(location: any) {
        navigate(location, { replace: true, state: location.state });
      },
      push(location: any) {
        navigate(location, { replace: false, state: location.state });
      },
    }),
    [navigate]
  );
  // https://github.com/pbeshai/use-query-params/issues/196
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return children({ history: adaptedHistory, location });
};

export default function App() {
  return (
    <Settings
      defaultSettings={{
        configs: configs,
      }}
    >
      <Document>
        <Layout>
          <QueryParamProvider ReactRouterRoute={RouteAdapter}>
            <Outlet />
          </QueryParamProvider>
        </Layout>
      </Document>
    </Settings>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.log(error);
  return (
    <Document title="Error!">
      <Layout>
        <div>
          <h1>There was an error</h1>
          <p>{error.message}</p>
        </div>
      </Layout>
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </Layout>
    </Document>
  );
}
