import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/common/logo";

export default async function NotFound() {
  const t = await getTranslations("states");
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <Logo />
        <p className="font-heading text-6xl font-extrabold text-primary">404</p>
        <div className="space-y-1.5">
          <h1 className="font-heading text-xl font-bold">{t("notFoundTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("notFoundDescription")}</p>
        </div>
        <Button asChild>
          <Link href="/">FOBS SMS</Link>
        </Button>
      </div>
    </div>
  );
}
