const recruitmentAiConsoleItems = [
  { name: "Recruitment Intelligence", note: "Search, qualify, shortlist" },
  { name: "Digital Operations", note: "Systems, dashboards, agents" },
  { name: "Business Discovery", note: "Leads, outreach, meetings" },
] as const;

export function RecruitmentAiConsole() {
  return (
    <div className="hr-console" aria-label="Illustration of AI opportunities for recruitment companies">
      <div className="hr-console-head"><span>AI / RECRUITMENT</span><i>CUSTOM</i></div>
      <div className="hr-console-criteria"><span>Three strategic areas</span><strong>Talent · Operations · Business growth</strong></div>
      {recruitmentAiConsoleItems.map((item) => (
        <div className="hr-candidate" key={item.name}>
          <span className="hr-avatar" />
          <div>
            <strong>{item.name}</strong>
            <small>{item.note}</small>
          </div>
          <b>AI</b>
        </div>
      ))}
      <div className="hr-console-footer"><span>MACRO VIEW</span><strong>Adapted to your process</strong></div>
    </div>
  );
}
