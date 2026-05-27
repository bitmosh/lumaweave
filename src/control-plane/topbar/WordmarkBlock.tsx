import { t } from "../../i18n";

export function WordmarkBlock() {
  return (
    <div className="lw-wordmark" data-lw-theme-target="topbar.wordmark">
      <span className="lw-wordmark-name">{t("topbar.brand.name")}</span>
    </div>
  );
}
