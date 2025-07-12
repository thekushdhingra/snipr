import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type InfoboxProps = {
  query: string;
};

type InfoboxData = Record<string, string | string[]>;

const isLink = (val: string) => {
  return (
    val.startsWith("http") || val.startsWith("/") || /^[\w-]+\.\w{2,}/.test(val)
  );
};

const formatDate = (val: string) => {
  const [datePart, timeAgoPart] = val.split(/\s*\(/);
  const cleanDate = datePart.trim();
  const relative = timeAgoPart?.replace(/\)$/, "").trim();

  return (
    <div className="flex flex-col">
      <span>{cleanDate}</span>
      {relative && (
        <span className="text-xs text-muted-foreground ml-1">({relative})</span>
      )}
    </div>
  );
};

export default function Infobox({ query }: InfoboxProps) {
  const [data, setData] = useState<InfoboxData | null>(null);
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

        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError((err as Error).message || "Failed to load infobox");
        setData(null);
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

  if (!data) return null;

  const { Title: rawTitle, Image: rawImage, ...rest } = data;
  const Title = Array.isArray(rawTitle) ? rawTitle[0] : rawTitle;
  const Image = Array.isArray(rawImage) ? rawImage[0] : rawImage;

  const renderValue = (val: string) => {
    if (/\d{4}/.test(val) && /\([^)]+\)/.test(val)) {
      return formatDate(val);
    }

    if (isLink(val)) {
      let href = val.startsWith("http")
        ? val
        : val.startsWith("/")
        ? `https://neopedia.kushs.dev${val}`
        : `https://${val}`;

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline break-words"
        >
          {val}
        </a>
      );
    }

    return <span>{val}</span>;
  };

  return (
    <Card className="max-w-md bg-[#ffffff30] dark:bg-[#00000030] backdrop-blur-3xl rounded-2xl p-4 shadow-md">
      <CardContent className="space-y-4 flex flex-col">
        {Title && (
          <h2 className="text-2xl font-bold text-center text-primary">
            {Title}
          </h2>
        )}

        {Image && (
          <div className="flex justify-center bg-white">
            <img
              src={Image}
              alt={Title ?? "Infobox image"}
              className="w-28 h-28 object-contain rounded-md border"
            />
          </div>
        )}

        <div className="space-y-2 text-md">
          {Object.entries(rest).map(([key, value]) => (
            <div key={key} className="flex flex-row gap-2">
              <span className="font-medium text-muted-foreground w-1/3">
                {key}:
              </span>
              <div className="w-2/3">
                {Array.isArray(value) ? (
                  <ul className="list-disc list-inside">
                    {value.map((item, i) => (
                      <li key={i}>{renderValue(item)}</li>
                    ))}
                  </ul>
                ) : (
                  renderValue(value)
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
