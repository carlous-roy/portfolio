// Experience: three roles at HCLTech, contracted to Teradyne. `tone` picks the
// text token for the role title (tx, su or mu) and `dot` the bullet opacity.

export const EXPERIENCE = {
  employer: 'HCLTech',
  client: 'Teradyne',
  note: 'Contractor',
  period: 'Jan 2022 — Aug 2024',
}

export const EXP_ROLES = [
  {
    title: 'Senior Software Engineer',
    period: 'Jan 2024 — Aug 2024',
    tone: 'tx',
    dot: 0.3,
    bullets: [
      "Owned C++ and C#/.NET instrument driver development for Teradyne's IG-XL automated test equipment platform (UltraFLEX, UltraFLEXplus), controlling and measuring analog instruments in real time, where a driver defect stops a production line",
      'Was the sole escalation point for critical ATE stopper issues affecting end customers, and built the Power BI dashboards that tracked issue trends across both tester platforms. Scattered escalation records became a view of where defects clustered by platform, module and instrument, which cut mean time to resolution on the recurring classes',
      'Cut root-cause time on memory leaks and performance regressions by moving legacy diagnostic workflows onto an AI-assisted debugging framework (WinDbg, JetBrains Timeline Profiler, automated flagging of regressions between builds), which reduced repeat escalations on defects that had kept coming back',
      'Worked across teams migrating the IG.NET framework from C++ to a modern C#/.NET architecture: triaged the defect backlog across the ported modules and profiled runtime performance against the original to catch bottlenecks before deployment. Zero production stoppers on the releases managed',
    ],
  },
  {
    title: 'Software Engineer',
    period: 'Aug 2022 — Dec 2023',
    tone: 'su',
    dot: 0.15,
    bullets: [
      'Resolved 150+ defects across three analog instrument driver codebases (DC30, DC70, DC75) by tracing failures through automated acceptance-test logs and captured measurement data, bringing all three product lines to regression-free release status',
      'Introduced new language nodes for analog instruments in the IG-XL environment, extending automated test coverage to next-generation hardware that had previously required manual configuration',
      'Extended C++ and C#/.NET driver architectures for new instrument capabilities in an Agile team spanning the US, Europe and Asia-Pacific, and wrote the unit and acceptance suites behind them, including repairing defective legacy tests against evolving IG-XL requirements',
      'Managed source code integrity through VersionVault (ClearCase) with branching and merge strategies across the Analog, Core and Digital codebases',
    ],
  },
  {
    title: 'Graduate Engineer Trainee',
    period: 'Jan 2022 — Jul 2022',
    tone: 'mu',
    dot: 0.1,
    bullets: [
      'Completed technical training in C++, C#/.NET and OOP/OOD principles, working alongside driver engineers to build a working understanding of analog instrument architecture and its driver code',
      'Gained hands-on exposure to semiconductor test equipment, including the chip docking process on live testers, tracking delivery through JIRA',
    ],
  },
]
