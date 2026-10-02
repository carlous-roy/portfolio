// Experience: three roles at HCLTech, contracted to Teradyne. `tone` picks the
// text token for the role title (tx, su or mu) and `dot` the bullet opacity.

export const EXPERIENCE = {
  employer: 'HCLTech',
  client: 'Teradyne',
  note: 'Contractor',
  period: 'Jan 2022 – Aug 2024',
}

export const EXP_ROLES = [
  {
    title: 'Senior Software Engineer',
    period: 'Jan 2024 – Aug 2024',
    tone: 'tx',
    dot: 0.3,
    bullets: [
      "Sole escalation point for production-stopping driver issues raised by Teradyne's end customers on UltraFLEX and UltraFLEXplus testers, where a driver defect stops a fab's production line",
      'Triaged the defect backlog across modules ported in the IG-XL .NET migration from C++ to C#/.NET, and profiled memory and runtime of the ported paths against the original build before deployment. Zero production stoppers on the releases I managed',
      'Wrote command-line Python around cdb.exe and dotTrace that pulls call stacks out of Windows dump files and compares profiler reports across nightly IG-XL builds, flagging memory and execution-time regressions',
      'Ran the Power BI defect dashboards in client-facing calls, showing mean time to resolution and defect clusters by platform, module and instrument, to set code-review and staffing priorities with the client manager',
    ],
  },
  {
    title: 'Software Engineer',
    period: 'Aug 2022 – Dec 2023',
    tone: 'su',
    dot: 0.15,
    bullets: [
      'Resolved about 100 defects end to end in the analog instrument driver codebase, a C++ core with a C#/.NET layer over a COM boundary, tracing failures through automated acceptance-test logs and captured measurement data',
      'Ported the C#/.NET tooling layer around the analog drivers off legacy C++ utilities, keeping the driver core in C++',
      'Added IG-XL language nodes for analog instruments, extending automated test coverage to hardware that had needed manual configuration',
      'Wrote and repaired the unit and acceptance suites behind the drivers, and managed branches and merges in VersionVault (ClearCase) across the Analog, Core and Digital codebases on an Agile team spread across the US, Europe and Asia-Pacific',
    ],
  },
  {
    title: 'Graduate Engineer Trainee',
    period: 'Jan 2022 – Jul 2022',
    tone: 'mu',
    dot: 0.1,
    bullets: [
      "Triaged and reproduced about 50 defects reported by Teradyne's end customers on the DC30 and UVI80, writing VBT in IG-XL to recreate the failing voltage and relay sequences, and handed the logs to senior engineers",
      "Built the team's first Power BI dashboard on a SQL Server mirror of Jira, tracking defect velocity and backlog age",
    ],
  },
]
