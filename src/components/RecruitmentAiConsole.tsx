import { useTranslation } from "react-i18next";

const recruitmentAiConsoleItemIds = ["01", "02", "03"] as const;

export function RecruitmentAiConsole() {
  const { t } = useTranslation();
  return (
    <div className="hr-console" aria-label={t("hr.console.aria")}>
      <div className="hr-console-head"><span>{t("hr.console.heading")}</span><i>{t("hr.console.custom")}</i></div>
      <div className="hr-console-criteria"><span>{t("hr.console.areas")}</span><strong>{t("hr.console.scope")}</strong></div>
      {recruitmentAiConsoleItemIds.map((itemId) => (
        <div className="hr-candidate" key={itemId}>
          <span className="hr-avatar" />
          <div>
            <strong>{t(`hr.console.items.${itemId}.name`)}</strong>
            <small>{t(`hr.console.items.${itemId}.note`)}</small>
          </div>
          <b>{t("hr.console.ai")}</b>
        </div>
      ))}
      <div className="hr-console-footer"><span>{t("hr.console.footerLabel")}</span><strong>{t("hr.console.footerText")}</strong></div>
    </div>
  );
}
