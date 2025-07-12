import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type InfoboxProps = {
  query: string;
};

export default function Infobox({ query }: InfoboxProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchInfobox = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://neopedia.kushs.dev/api/infobox?query=${encodeURIComponent(
            query
          )}`
        );
        if (!res.ok) throw new Error("Infobox not found");

        const htmlText = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");

        const anchors = doc.querySelectorAll("a");
        anchors.forEach((a) => {
          const href = a.getAttribute("href") || "";
          const text = a.textContent || "";

          const isInternal =
            href.startsWith("/") ||
            href.startsWith("#") ||
            href.startsWith("javascript:") ||
            !href.startsWith("http");

          if (isInternal) {
            const span = document.createElement("span");
            span.textContent = text;
            a.replaceWith(span);
          }
        });

        setHtml(doc.body.innerHTML);
        console.log(html);
        setError(null);
      } catch (err) {
        setError((err as Error).message || "Failed to load infobox");
        setHtml(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInfobox();
  }, [query]);

  if (loading) return null;

  if (error && error.toLowerCase() !== "infobox not found") {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    html && (
      <Card className="max-w-md h-fit bg-[#ffffff30] dark:bg-[#00000030] backdrop-blur-3xl rounded-lg p-4">
        <CardContent>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html! }}
          />
        </CardContent>
      </Card>
    )
  );
}
