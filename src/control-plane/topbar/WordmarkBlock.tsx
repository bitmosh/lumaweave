import { t } from "../../i18n";

export function WordmarkBlock() {
  return (
    <div className="lw-wordmark" data-lw-theme-target="topbar.wordmark">
      <div className="lw-wordmark-row">
        <span className="lw-wordmark-name">{t("topbar.brand.name")}</span>
        <span className="lw-wordmark-sub">{t("topbar.brand.subtitle")}</span>
      </div>
      <div className="lw-wordmark-tag">{t("topbar.brand.tagline")}</div>
    </div>
  );
}
