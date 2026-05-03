import { useState, useEffect, useMemo } from "react";
import { qaCheckDefinitions } from "./qa-registry";
import { useQaStore } from "./qa.store";
import type { BanditProposalDecision, BanditQuestionStatus, QaCheckResult, QaStatus } from "./qa.types";
import { generateContractSummary } from "../contracts";
import { getAdvisoryForQaKey } from "./advisory-registry";
import { getThemeTargetSummary, getThemeTargetsBySurface } from "../../themes";
import type { ThemeTargetContract, ThemeTargetSurface } from "../../themes";
import { THEME_TARGET_PROBE_EVENT, type ThemeTargetProbeResult } from "../../themes/themeTargetHeuristics";
import { THEME_TARGET_PIN_EVENT, type ThemeTargetInspectorEntity } from "../../themes/themeTargetInspectorTypes";
import { ThemeMappingPanel } from "../panels/ThemeMappingPanel";

const ACTIVE_CHECKLIST_STORAGE_KEY = "lumaweave-qa-active-checklist";
const BACKLOG_STORAGE_KEY = "lumaweave-advisory-backlog-order";
const QUESTION_ANSWER_STORAGE_KEY = "lumaweave-advisory-question-answers";
const PROPOSAL_DECISIONS_STORAGE_KEY = "lumaweave-advisory-proposal-decisions";
const DEFAULT_QA_KEY = "v33";
const DEFAULT_FEATURE_ID = "theme-override-storage-contract-v33";
const PROPOSAL_DECISION_OPTIONS: readonly BanditProposalDecision[] = [
  "unreviewed",
  "accept-for-future",
  "defer",
  "reject",
  "needs-more-detail",
] as const;

const isProposalDecision = (value: unknown): value is BanditProposalDecision =>
  typeof value === "string" && PROPOSAL_DECISION_OPTIONS.includes(value as BanditProposalDecision);

const extractQaVersion = (qaKey: string): number | undefined => {
  const match = qaKey.match(/^v(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return undefined;
};

const parseJson = <T,>(value: string | null): T | null => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Failed to parse persisted QA state", error);
    return null;
  }
};

const loadPersistedProposalDecisions = (): Record<string, BanditProposalDecision> =>
  parseJson<Record<string, BanditProposalDecision>>(localStorage.getItem(PROPOSAL_DECISIONS_STORAGE_KEY)) ?? {};

const persistProposalDecisions = (proposals: { id: string; userDecision: BanditProposalDecision }[]) => {
  const decisionsMap = proposals.reduce<Record<string, BanditProposalDecision>>((acc, proposal) => {
    acc[proposal.id] = proposal.userDecision;
    return acc;
  }, {});
  localStorage.setItem(PROPOSAL_DECISIONS_STORAGE_KEY, JSON.stringify(decisionsMap));
};

type PanelView = "checklist" | "last-submission" | "history" | "mapping" | "debug" | "advisory";

interface QaPanelProps {
  themeAccent?: string;
  themeTextMuted?: string;
  themePanelBorder?: string;
  themeInspectorEnabled?: boolean;
  onThemeInspectorToggle?: () => void;
}

export function QaPanel({
  themeAccent = "#a855f7",
  themeTextMuted = "#94a3b8",
  themePanelBorder = "rgba(148, 163, 184, 0.2)",
  themeInspectorEnabled = false,
  onThemeInspectorToggle = () => {},
}: QaPanelProps) {
  // Use canonical qaKey as primary selector
  const [activeQaKey, setActiveQaKey] = useState<string>(() => {
    const persisted = localStorage.getItem(ACTIVE_CHECKLIST_STORAGE_KEY);
    if (persisted) {
      const qaKeyMatch = persisted.match(/^v\d+[a-z]?$/);
      if (qaKeyMatch) return qaKeyMatch[0];
      const versionMatch = persisted.match(/:v(\d+)$/);
      if (versionMatch) return `v${versionMatch[1]}`;
      localStorage.removeItem(ACTIVE_CHECKLIST_STORAGE_KEY);
    }
    return DEFAULT_QA_KEY;
  });

  const [activeFeatureId, setActiveFeatureId] = useState<string>(() => {
    // Load persisted featureId, default to checklist-identity-validation
    const persisted = localStorage.getItem(ACTIVE_CHECKLIST_STORAGE_KEY);
    if (persisted) {
      const featureIdMatch = persisted.match(/^([^:]+):/);
      if (featureIdMatch) {
        return featureIdMatch[1];
      }
    }
    return DEFAULT_FEATURE_ID; // Default feature
  });

  const [activeQaVersion, setActiveQaVersion] = useState<number>(() => extractQaVersion(activeQaKey) ?? 27);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [localNotes, setLocalNotes] = useState<string>("");
  const [panelView, setPanelView] = useState<PanelView>("checklist");
  const [identityError, setIdentityError] = useState<string>("");
  const [probeResult, setProbeResult] = useState<ThemeTargetProbeResult | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.__lwLastThemeTargetProbeResult ?? null;
  });
  const [pinnedInspectorEntity, setPinnedInspectorEntity] = useState<ThemeTargetInspectorEntity | null>(() =>
    typeof window === "undefined" ? null : window.__lwPinnedInspectorEntity ?? null,
  );
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleProbe = (event: Event) => {
      const { detail } = event as CustomEvent<ThemeTargetProbeResult>;
      setProbeResult(detail);
    };
    window.addEventListener(THEME_TARGET_PROBE_EVENT, handleProbe);
    return () => window.removeEventListener(THEME_TARGET_PROBE_EVENT, handleProbe);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handlePinnedChange = (event: Event) => {
      const { detail } = event as CustomEvent<ThemeTargetInspectorEntity | null>;
      setPinnedInspectorEntity(detail ?? null);
    };
    window.addEventListener(THEME_TARGET_PIN_EVENT, handlePinnedChange as EventListener);
    return () => window.removeEventListener(THEME_TARGET_PIN_EVENT, handlePinnedChange as EventListener);
  }, []);

  const contractSummary = useMemo(() => generateContractSummary(), []);
  const themeTargetSummary = useMemo(() => getThemeTargetSummary(), []);
  const THEME_SURFACES: ThemeTargetSurface[] = [
    "shell",
    "topbar",
    "panel",
    "mission-control",
    "control",
    "settings",
    "graph",
  ];
  const themeTargetsBySurface = useMemo(() => {
    const initial: Record<ThemeTargetSurface, ThemeTargetContract[]> = {
      shell: [],
      topbar: [],
      panel: [],
      "mission-control": [],
      control: [],
      settings: [],
      graph: [],
    };

    THEME_SURFACES.forEach((surface) => {
      initial[surface] = getThemeTargetsBySurface(surface);
    });

    return initial;
  }, []);

  const resultsByChecklist = useQaStore((state) => state.resultsByChecklist);
  const setCheckResult = useQaStore((state) => state.setCheckResult);
  const setFeatureSubmission = useQaStore((state) => state.setFeatureSubmission);
  const resetChecklistResults = useQaStore((state) => state.resetChecklistResults);
  const getLastSubmission = useQaStore((state) => state.getLastSubmission);
  const getSubmissionsByFeatureId = useQaStore((state) => state.getSubmissionsByFeatureId);

  const lastSubmission = getLastSubmission();
  const submissionHistory = getSubmissionsByFeatureId(activeFeatureId);

  // Advisory state - load appropriate advisory based on active qaKey
  const [advisoryContent, setAdvisoryContent] = useState(() => {
    // Get the appropriate advisory for the current qaKey
    const defaultAdvisory = getAdvisoryForQaKey(activeQaKey);
    
    // Load persisted backlog order, answers, and proposal decisions from localStorage
    const persistedBacklog = parseJson(defaultAdvisory.backlog.length ? localStorage.getItem(BACKLOG_STORAGE_KEY) : null);
    const persistedQuestionAnswers = parseJson<Record<string, string>>(localStorage.getItem(QUESTION_ANSWER_STORAGE_KEY));
    const persistedProposalDecisions = loadPersistedProposalDecisions();
    
    let mergedAdvisory = { ...defaultAdvisory };
    
    if (Array.isArray(persistedBacklog) && persistedBacklog.length === defaultAdvisory.backlog.length) {
      mergedAdvisory.backlog = persistedBacklog.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
    }
    
    if (persistedQuestionAnswers) {
      mergedAdvisory.questions = defaultAdvisory.questions.map((question) => {
        const persistedAnswer = persistedQuestionAnswers[question.id];
        if (persistedAnswer && typeof persistedAnswer === "string") {
          return { ...question, userResponse: persistedAnswer };
        }
        return question;
      });
    }

    mergedAdvisory.proposals = defaultAdvisory.proposals.map((proposal) => {
      const persistedDecision = persistedProposalDecisions[proposal.id];
      if (isProposalDecision(persistedDecision)) {
        return { ...proposal, userDecision: persistedDecision };
      }
      return proposal;
    });
    
    persistProposalDecisions(mergedAdvisory.proposals);
    return mergedAdvisory;
  });

  const copyLastSubmission = () => {
    if (lastSubmission) {
      navigator.clipboard.writeText(lastSubmission.markdown)
        .then(() => {
          setSubmitMessage("✓ Copied to clipboard");
          setTimeout(() => setSubmitMessage(""), 3000);
        })
        .catch((err) => {
          console.error("Failed to copy to clipboard:", err);
          setSubmitMessage("✗ Copy failed - clipboard unavailable");
          setTimeout(() => setSubmitMessage(""), 3000);
        });
    } else {
      setSubmitMessage("✗ No submission to copy");
      setTimeout(() => setSubmitMessage(""), 3000);
    }
  };

  // Derive checklist key from qaKey (canonical format: v17)
  const activeChecklistKey = activeQaKey;

  // Identity validation function
  const validateChecklistIdentity = (): { valid: boolean; error?: string } => {
    // All identity surfaces should agree on the canonical identity: qaKey
    const canonicalIdentity = activeQaKey;

    // Get dropdown value (should match qaKey)
    const dropdownValue = activeQaKey;

    // Get header badge version (should match qaKey)
    const headerBadgeVersion = activeQaKey;

    // Validate dropdown matches canonical identity
    if (dropdownValue !== canonicalIdentity) {
      return {
        valid: false,
        error: `Checklist identity mismatch: dropdown (${dropdownValue}) does not match active qaKey (${canonicalIdentity})`,
      };
    }

    // Validate header badge matches canonical identity
    if (headerBadgeVersion !== canonicalIdentity) {
      return {
        valid: false,
        error: `Checklist identity mismatch: header badge (${headerBadgeVersion}) does not match active qaKey (${canonicalIdentity})`,
      };
    }

    // All identities agree
    return { valid: true };
  };

  const activeChecks = qaCheckDefinitions.filter(
    (check) => check.featureId === activeFeatureId && check.qaVersion === activeQaVersion && check.active !== false
  );

  // Fallback: if current checklist has no active checks, auto-select newest active checklist
  useEffect(() => {
    if (activeChecks.length === 0) {
      // Find all active checklists using qaKey
      const allActiveChecklists = Array.from(
        new Set(
          qaCheckDefinitions
            .filter((check) => check.active !== false)
            .map((check) => check.qaKey ?? `v${check.qaVersion}`)
        )
      ).map((qaKey) => {
        const qaVersion = parseInt(qaKey.replace(/^v/, ''), 10);
        const check = qaCheckDefinitions.find(
          (c) => (c.qaKey ?? `v${c.qaVersion}`) === qaKey && c.active !== false
        );
        return { qaKey, qaVersion, featureId: check?.featureId || "unknown" };
      });

      // Sort by version descending to get newest
      allActiveChecklists.sort((a, b) => b.qaVersion - a.qaVersion);

      if (allActiveChecklists.length > 0) {
        const newest = allActiveChecklists[0];
        setActiveQaKey(newest.qaKey);
        setActiveQaVersion(newest.qaVersion);
        setActiveFeatureId(newest.featureId);
        setCurrentIndex(0);
      }
    }
  }, [activeFeatureId, activeQaVersion, activeQaKey]);

  const activeFeatureName = activeChecks[0]?.featureName || "Unknown Feature";
  const currentCheck = activeChecks[currentIndex];

  // Extract unique active checklists from qaCheckDefinitions for dropdown
  const uniqueChecklists = Array.from(
    new Set(
      qaCheckDefinitions
        .filter((check) => check.active !== false)
        .map((check) => check.qaKey ?? `v${check.qaVersion}`)
    )
  ).map((qaKey) => {
    // Find a check with this qaKey to get feature info
    const check = qaCheckDefinitions.find(
      (c) => (c.qaKey ?? `v${c.qaVersion}`) === qaKey && c.active !== false
    );
    const qaVersion = parseInt(qaKey.replace(/^v/, ''), 10);
    return {
      checklistKey: qaKey, // Use qaKey as the value
      featureId: check?.featureId || "unknown",
      qaVersion,
      featureName: check?.featureName || qaKey,
    };
  });

  // Get results for the current checklist
  const currentChecklistResults = resultsByChecklist[activeChecklistKey] || {};
  const currentStoredResult = currentCheck ? currentChecklistResults[currentCheck.id] : undefined;

  // Sync local notes when activeChecklistKey or currentCheck.id changes
  useEffect(() => {
    if (currentCheck) {
      setLocalNotes(currentStoredResult?.notes ?? "");
    }
  }, [activeChecklistKey, currentCheck?.id]);

  // Compute summary counts
  const summary = {
    pass: 0,
    fail: 0,
    blocked: 0,
    unverified: 0,
    untested: 0,
  };

  activeChecks.forEach((check) => {
    const result = currentChecklistResults[check.id];
    if (result) {
      summary[result.status]++;
    } else {
      summary.untested++;
    }
  });

  // Compute acceptance decision
  const computeAcceptanceDecision = (): string => {
    const requiredChecks = activeChecks.filter((check) => check.required);
    const requiredResults = requiredChecks.map((check) => currentChecklistResults[check.id]);

    if (requiredResults.some((r) => !r)) {
      return "INCOMPLETE";
    }

    const hasBlocked = requiredResults.some((r) => r?.status === "blocked" || r?.status === "unverified");
    if (hasBlocked) {
      return "BLOCKED";
    }

    const hasFail = requiredResults.some((r) => r?.status === "fail");
    if (hasFail) {
      // Check if fails are only on fallback-allowed checks with notes
      const fallbackFails = requiredChecks
        .filter((check) => check.fallbackAllowed && currentChecklistResults[check.id]?.status === "fail")
        .filter((check) => currentChecklistResults[check.id]?.notes.trim().length > 0);

      const nonFallbackFails = requiredChecks.filter(
        (check) => !check.fallbackAllowed && currentChecklistResults[check.id]?.status === "fail"
      );

      if (nonFallbackFails.length > 0) {
        return "DO NOT ACCEPT";
      }

      if (fallbackFails.length > 0) {
        return "ACCEPT WITH FALLBACK REQUIRED";
      }

      return "DO NOT ACCEPT";
    }

    return "ACCEPT";
  };

  const acceptanceDecision = computeAcceptanceDecision();

  const updateStatus = (checkId: string, status: QaStatus) => {
    setCheckResult(activeChecklistKey, checkId, {
      checkId,
      status,
      notes: currentChecklistResults[checkId]?.notes || "",
      updatedAt: new Date().toISOString(),
    });
  };

  const updateNotes = (checkId: string, notes: string) => {
    setLocalNotes(notes);
    setCheckResult(activeChecklistKey, checkId, {
      checkId,
      status: currentChecklistResults[checkId]?.status || "untested",
      notes,
      updatedAt: new Date().toISOString(),
    });
  };

  const copyQaReport = () => {
    // Sync current localNotes to store before generating report
    if (currentCheck && localNotes !== (currentChecklistResults[currentCheck.id]?.notes ?? "")) {
      setCheckResult(activeChecklistKey, currentCheck.id, {
        checkId: currentCheck.id,
        status: currentChecklistResults[currentCheck.id]?.status || "untested",
        notes: localNotes,
        updatedAt: new Date().toISOString(),
      });
    }
    const report = generateMarkdownReport(activeFeatureName, activeChecklistKey, acceptanceDecision, summary, activeChecks, currentChecklistResults, advisoryContent);
    navigator.clipboard.writeText(report)
      .then(() => {
        setSubmitMessage("✓ Report copied to clipboard");
        setTimeout(() => setSubmitMessage(""), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy report to clipboard:", err);
        setSubmitMessage("✗ Copy failed - clipboard unavailable");
        setTimeout(() => setSubmitMessage(""), 3000);
      });
  };

  const submitQaReport = () => {
    // Validate checklist identity before submit
    const identityValidation = validateChecklistIdentity();
    if (!identityValidation.valid) {
      setIdentityError(identityValidation.error || "Checklist identity mismatch detected. Submission blocked.");
      setSubmitMessage("Submission blocked: identity mismatch");
      setTimeout(() => {
        setIdentityError("");
        setSubmitMessage("");
      }, 5000);
      return; // Block submission
    }

    // Clear any previous identity error
    setIdentityError("");

    // Sync current localNotes to store before generating report
    if (currentCheck && localNotes !== (currentChecklistResults[currentCheck.id]?.notes ?? "")) {
      setCheckResult(activeChecklistKey, currentCheck.id, {
        checkId: currentCheck.id,
        status: currentChecklistResults[currentCheck.id]?.status || "untested",
        notes: localNotes,
        updatedAt: new Date().toISOString(),
      });
    }
    const report = generateMarkdownReport(activeFeatureName, activeChecklistKey, acceptanceDecision, summary, activeChecks, currentChecklistResults, advisoryContent);
    setFeatureSubmission({
      featureId: activeFeatureId,
      checklistKey: activeChecklistKey,
      submittedAt: new Date().toISOString(),
      decision: acceptanceDecision,
      markdown: report,
    });

    // Try to copy to clipboard
    try {
      navigator.clipboard.writeText(report);
      setSubmitMessage("Submitted and copied to clipboard");
    } catch (err) {
      setSubmitMessage("Submitted (clipboard unavailable)");
    }

    // Clear active checklist working results for current checklistKey
    resetChecklistResults(activeChecklistKey);
    
    // Reset local state
    setCurrentIndex(0);
    setLocalNotes("");
    
    // Reset per-run advisory fields (question answers, proposal notes)
    // Preserve backlog order and proposal decisions
    // 
    // Reset after submit:
    // - checklist statuses (via resetChecklistResults above)
    // - checklist notes (via setLocalNotes above)
    // - Bandit Question answer notes (userResponse)
    // - question status (status)
    // - proposal notes (userNotes) if report-specific
    //
    // Preserve after submit:
    // - backlog order (not reset)
    // - proposal decisions (userDecision)
    // - proposal statuses
    setAdvisoryContent((prev) => {
      const resetQuestions = prev.questions.map((q) => ({
        ...q,
        userResponse: "",
        status: "unanswered" as BanditQuestionStatus,
      }));
      const resetProposals = prev.proposals.map((p) => ({
        ...p,
        userNotes: "",
      }));
      persistProposalDecisions(resetProposals);
      return {
        ...prev,
        questions: resetQuestions,
        proposals: resetProposals,
      };
    });
    
    // Clear persisted question answers from localStorage
    localStorage.removeItem(QUESTION_ANSWER_STORAGE_KEY);
    
    setTimeout(() => setSubmitMessage(""), 3000);
  };

  const generateMarkdownReport = (
    featureName: string,
    checklistKey: string,
    decision: string,
    counts: typeof summary,
    checks: typeof activeChecks,
    results: Record<string, QaCheckResult>,
    advisory?: typeof advisoryContent
  ): string => {
    let report = `# QA Report — ${featureName}\n\n`;
    report += `**Checklist Key:** ${checklistKey}\n`;
    report += `**Advisory Set Key:** ${checklistKey}\n`;
    report += `**Submitted At:** ${new Date().toISOString()}\n\n`;
    report += `## Acceptance Decision\n\n**${decision}**\n\n`;
    report += `## Summary\n\n`;
    report += `- Pass: ${counts.pass}\n`;
    report += `- Fail: ${counts.fail}\n`;
    report += `- Blocked: ${counts.blocked}\n`;
    report += `- Unverified: ${counts.unverified}\n`;
    report += `- Untested: ${counts.untested}\n\n`;
    report += `## Check Results\n\n`;

    checks.forEach((check) => {
      const result = results[check.id];
      report += `### ${check.title}\n\n`;
      report += `**Status:** ${result?.status || "untested"}\n\n`;
      report += `**Expected:** ${check.expected}\n\n`;
      report += `**Steps:**\n`;
      check.steps.forEach((step, i) => {
        report += `${i + 1}. ${step}\n`;
      });
      report += `\n`;
      if (result?.notes) {
        report += `**Notes:** ${result.notes}\n\n`;
      }
      report += `---\n\n`;
    });

    // Add advisory section if available
    if (advisory) {
      // Bandit Questions
      if (advisory.questions.length > 0) {
        report += `## Bandit Questions\n\n`;
        advisory.questions.forEach((question) => {
          report += `### ${question.prompt}\n\n`;
          report += `**Status:** ${question.status}\n\n`;
          if (question.context) {
            report += `**Context:** ${question.context}\n\n`;
          }
          if (question.userResponse) {
            report += `**Answer / Notes:** ${question.userResponse}\n\n`;
          }
          report += `---\n\n`;
        });
      }

      // Bandit Proposals
      if (advisory.proposals.length > 0) {
        report += `## Bandit Proposals\n\n`;
        advisory.proposals.forEach((proposal) => {
          report += `### ${proposal.title}\n\n`;
          report += `**Decision:** ${proposal.userDecision}\n\n`;
          if (proposal.userNotes) {
            report += `**User Notes:** ${proposal.userNotes}\n\n`;
          }
          if (proposal.summary) {
            report += `**Summary:** ${proposal.summary}\n\n`;
          }
          if (proposal.rationale) {
            report += `**Rationale:** ${proposal.rationale}\n\n`;
          }
          if (proposal.risk) {
            report += `**Risk:** ${proposal.risk}\n\n`;
          }
          report += `---\n\n`;
        });
      }

      // Bandit Backlog Top 10
      if (advisory.backlog.length > 0) {
        report += `## Bandit Backlog Top 10\n\n`;
        advisory.backlog.forEach((item) => {
          report += `${item.rank}. ${item.title} — ${item.status}`;
          if (item.risk) {
            report += ` (risk: ${item.risk})`;
          }
          report += `\n`;
        });
        report += `\n`;
      }
    }

    return report;
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < activeChecks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleChecklistChange = (qaKey: string) => {
    const qaVersion = extractQaVersion(qaKey);
    const matchingChecklist = qaCheckDefinitions.find(
      (check) => (check.qaKey ?? `v${check.qaVersion}`) === qaKey && check.active !== false
    );

    setActiveQaKey(qaKey);
    if (qaVersion) {
      setActiveQaVersion(qaVersion);
    }
    if (matchingChecklist?.featureId) {
      setActiveFeatureId(matchingChecklist.featureId);
    }
    setCurrentIndex(0);
    localStorage.setItem(ACTIVE_CHECKLIST_STORAGE_KEY, qaKey);
  };

  const moveBacklogItemUp = (index: number) => {
    if (index === 0) return;
    const newBacklog = [...advisoryContent.backlog];
    [newBacklog[index - 1], newBacklog[index]] = [newBacklog[index], newBacklog[index - 1]];
    const updatedBacklog = newBacklog.map((item, idx) => ({ ...item, rank: idx + 1 }));
    setAdvisoryContent({ ...advisoryContent, backlog: updatedBacklog });
    localStorage.setItem(BACKLOG_STORAGE_KEY, JSON.stringify(updatedBacklog));
  };

  const moveBacklogItemDown = (index: number) => {
    if (index === advisoryContent.backlog.length - 1) return;
    const newBacklog = [...advisoryContent.backlog];
    [newBacklog[index], newBacklog[index + 1]] = [newBacklog[index + 1], newBacklog[index]];
    const updatedBacklog = newBacklog.map((item, idx) => ({ ...item, rank: idx + 1 }));
    setAdvisoryContent({ ...advisoryContent, backlog: updatedBacklog });
    localStorage.setItem(BACKLOG_STORAGE_KEY, JSON.stringify(updatedBacklog));
  };

  const handleProposalDecisionUpdate = (proposalId: string, decision: BanditProposalDecision) => {
    setAdvisoryContent((prev) => {
      const updatedProposals = prev.proposals.map((p) =>
        p.id === proposalId ? { ...p, userDecision: decision } : p
      );
      persistProposalDecisions(updatedProposals);
      return { ...prev, proposals: updatedProposals };
    });
  };

  if (!currentCheck) {
    return (
      <div className="flex flex-col h-full text-sm p-3 text-slate-400">
        No QA checks found for this feature.
      </div>
    );
  }

  const currentResult = currentStoredResult;

  return (
    <div
      className="lw-panel flex flex-col h-full text-sm"
      data-testid="qa-panel"
      data-lw-theme-target="mission-control.panel"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-3" style={{ borderBottom: `1px solid ${themePanelBorder}` } as React.CSSProperties}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: themeTextMuted } as React.CSSProperties}>QA Panel</h2>
          <div className="flex items-center gap-2">
            <span
              className="lw-badge text-xs"
              style={{
                backgroundColor: `${themeAccent}20`,
                color: themeAccent
              } as React.CSSProperties}
            >
              {activeQaKey}
            </span>
            <span
              className="lw-badge text-xs font-semibold"
              style={{
                backgroundColor:
                  acceptanceDecision === "ACCEPT" ? "rgba(74, 222, 128, 0.2)" :
                  acceptanceDecision === "DO NOT ACCEPT" ? "rgba(248, 113, 113, 0.2)" :
                  acceptanceDecision === "BLOCKED" ? "rgba(250, 204, 21, 0.2)" :
                  acceptanceDecision === "INCOMPLETE" ? "rgba(148, 163, 184, 0.2)" :
                  "rgba(148, 163, 184, 0.2)",
                color:
                  acceptanceDecision === "ACCEPT" ? "#4ade80" :
                  acceptanceDecision === "DO NOT ACCEPT" ? "#f87171" :
                  acceptanceDecision === "BLOCKED" ? "#facc15" :
                  acceptanceDecision === "INCOMPLETE" ? "#94a3b8" :
                  "#94a3b8"
              } as React.CSSProperties}
            >
              {acceptanceDecision}
            </span>
          </div>
        </div>
        {uniqueChecklists.length > 1 ? (
          <div className="mt-2">
            <select
              value={activeChecklistKey}
              onChange={(e) => handleChecklistChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs"
              data-testid="qa-checklist-selector"
            >
              {uniqueChecklists.map((checklist) => (
                <option key={checklist.checklistKey} value={checklist.checklistKey}>
                  {checklist.featureName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mt-2 text-xs text-slate-400">
            {activeFeatureName}
          </div>
        )}
      </div>

      {/* Panel View Tabs */}
      <div className="lw-control-grid flex-shrink-0 p-2" style={{ borderBottom: `1px solid ${themePanelBorder}` } as React.CSSProperties}>
        <button
          onClick={() => setPanelView("checklist")}
          className={`px-2 py-1 text-xs rounded`}
          data-testid="qa-tab-checklist"
          style={{
            backgroundColor: panelView === "checklist" ? `${themeAccent}20` : "rgba(30, 41, 59, 0.8)",
            color: panelView === "checklist" ? themeAccent : themeTextMuted,
          } as React.CSSProperties}
        >
          Checklist
        </button>
        <button
          onClick={() => setPanelView("last-submission")}
          className={`px-2 py-1 text-xs rounded`}
          data-testid="qa-tab-last-submission"
          style={{
            backgroundColor: panelView === "last-submission" ? `${themeAccent}20` : "rgba(30, 41, 59, 0.8)",
            color: panelView === "last-submission" ? themeAccent : themeTextMuted,
          } as React.CSSProperties}
        >
          Last Report
        </button>
        <button
          onClick={() => setPanelView("history")}
          className={`px-2 py-1 text-xs rounded`}
          data-testid="qa-tab-history"
          style={{
            backgroundColor: panelView === "history" ? `${themeAccent}20` : "rgba(30, 41, 59, 0.8)",
            color: panelView === "history" ? themeAccent : themeTextMuted,
          } as React.CSSProperties}
        >
          History
        </button>
        <button
          onClick={() => setPanelView("mapping")}
          className={`px-2 py-1 text-xs rounded`}
          data-testid="qa-tab-mapping"
          style={{
            backgroundColor: panelView === "mapping" ? `${themeAccent}20` : "rgba(30, 41, 59, 0.8)",
            color: panelView === "mapping" ? themeAccent : themeTextMuted,
          } as React.CSSProperties}
        >
          Mapping
        </button>
        <button
          onClick={() => setPanelView("debug")}
          className={`px-2 py-1 text-xs rounded`}
          data-testid="qa-tab-debug"
          style={{
            backgroundColor: panelView === "debug" ? `${themeAccent}20` : "rgba(30, 41, 59, 0.8)",
            color: panelView === "debug" ? themeAccent : themeTextMuted,
          } as React.CSSProperties}
        >
          Debug
        </button>
        <button
          onClick={() => setPanelView("advisory")}
          className={`col-span-2 px-2 py-1 text-xs rounded`}
          data-testid="qa-tab-advisory"
          style={{
            backgroundColor: panelView === "advisory" ? `${themeAccent}20` : "rgba(30, 41, 59, 0.8)",
            color: panelView === "advisory" ? themeAccent : themeTextMuted,
          } as React.CSSProperties}
        >
          Advisory
        </button>
      </div>

      {/* Panel Content */}
      {panelView === "checklist" && (
        <>
      {/* Summary */}
      <div 
        className="flex-shrink-0 p-3 bg-slate-900/50"
        style={{ borderBottom: `1px solid ${themePanelBorder}` } as React.CSSProperties}
      >
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div>
            <div className="font-semibold text-green-400">{summary.pass}</div>
            <div className="text-slate-500">Pass</div>
          </div>
          <div>
            <div className="font-semibold text-red-400">{summary.fail}</div>
            <div className="text-slate-500">Fail</div>
          </div>
          <div>
            <div className="font-semibold text-yellow-400">{summary.blocked}</div>
            <div className="text-slate-500">Blocked</div>
          </div>
          <div>
            <div className="font-semibold text-purple-400">{summary.unverified}</div>
            <div className="text-slate-500">Unverified</div>
          </div>
          <div>
            <div className="font-semibold text-slate-400">{summary.untested}</div>
            <div className="text-slate-500">Untested</div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs font-semibold text-slate-300">Decision: </span>
          <span className={`text-xs font-semibold ${
            acceptanceDecision === "ACCEPT" ? "text-green-400" :
            acceptanceDecision === "DO NOT ACCEPT" ? "text-red-400" :
            acceptanceDecision === "BLOCKED" ? "text-yellow-400" :
            acceptanceDecision === "INCOMPLETE" ? "text-slate-400" :
            "text-slate-400"
          }`}>
            {acceptanceDecision}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 p-2 border-b border-slate-700 flex gap-2">
        <button
          onClick={copyQaReport}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded px-2 py-1 text-xs"
        >
          Copy Report
        </button>
        <button
          onClick={submitQaReport}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded px-2 py-1 text-xs"
        >
          Submit Report
        </button>
      </div>

      {/* Submit message */}
      {submitMessage && (
        <div className="flex-shrink-0 p-2 bg-slate-900/50 text-xs text-center text-slate-300 border-b border-slate-700">
          {submitMessage}
        </div>
      )}

      {/* Identity error */}
      {identityError && (
        <div className="flex-shrink-0 p-2 bg-red-900/30 text-xs text-center text-red-300 border-b border-red-700">
          {identityError}
        </div>
      )}

      {/* Question counter */}
      <div
        className="flex-shrink-0 p-2 border-b border-slate-700 text-center text-xs text-slate-400"
        data-testid="qa-question-counter"
      >
        Question {currentIndex + 1} / {activeChecks.length}
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 p-2 border-b border-slate-700 flex gap-2">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded px-2 py-1 text-xs"
          data-testid="qa-check-previous"
        >
          Previous
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === activeChecks.length - 1}
          className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded px-2 py-1 text-xs"
          data-testid="qa-check-next"
        >
          Next
        </button>
      </div>

      {/* Current check */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-800">
          <div className="flex items-start gap-2 mb-3">
            <select
              value={currentResult?.status || "untested"}
              onChange={(e) => updateStatus(currentCheck.id, e.target.value as QaStatus)}
              className={`flex-shrink-0 mt-0.5 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs ${
                currentResult?.status === "pass" ? "text-green-400" :
                currentResult?.status === "fail" ? "text-red-400" :
                currentResult?.status === "blocked" ? "text-yellow-400" :
                currentResult?.status === "unverified" ? "text-purple-400" :
                "text-slate-400"
              }`}
              data-testid="qa-status-selector"
            >
              <option value="untested">Untested</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="blocked">Blocked</option>
              <option value="unverified">Unverified</option>
            </select>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-300 text-sm" data-testid="qa-check-title">{currentCheck.title}</div>
            </div>
          </div>
          
          <div className="mb-3 text-xs text-slate-400">
            <div className="mb-2">
              <span className="text-slate-500 font-semibold">Expected:</span> {currentCheck.expected}
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Steps:</span>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                {currentCheck.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <textarea
            value={localNotes}
            onChange={(e) => updateNotes(currentCheck.id, e.target.value)}
            placeholder="Add notes..."
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 placeholder-slate-600 resize-none"
            rows={4}
          />
        </div>
      </div>

      {/* Persistence note */}
      <div className="flex-shrink-0 p-2 border-t border-slate-700 text-xs text-slate-600">
        <em>Persistence: localStorage (Zustand persist middleware)</em>
      </div>
        </>
      )}

      {panelView === "last-submission" && (
        <div className="flex-1 overflow-y-auto p-3">
          {lastSubmission ? (
            <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-800">
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Feature</div>
                <div className="text-sm text-slate-300">{lastSubmission.featureId}</div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Checklist</div>
                <div className="text-sm text-slate-300">{lastSubmission.checklistKey}</div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Submitted At</div>
                <div className="text-sm text-slate-300">{new Date(lastSubmission.submittedAt).toLocaleString()}</div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Decision</div>
                <div className={`text-sm font-semibold ${
                  lastSubmission.decision === "ACCEPT" ? "text-green-400" :
                  lastSubmission.decision === "ACCEPT WITH FALLBACK REQUIRED" ? "text-yellow-400" :
                  "text-red-400"
                }`}>
                  {lastSubmission.decision}
                </div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Report</div>
                <pre className="text-xs text-slate-400 whitespace-pre-wrap bg-slate-800 rounded p-2 max-h-64 overflow-y-auto">
                  {lastSubmission.markdown}
                </pre>
              </div>
              <button
                onClick={copyLastSubmission}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded px-2 py-1 text-xs"
                data-testid="qa-copy-last-submission"
              >
                Copy Last Submission
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-500 text-xs py-8">
              No submissions yet
            </div>
          )}
        </div>
      )}

      {panelView === "history" && (
        <div className="flex-1 overflow-y-auto p-3">
          {submissionHistory.length > 0 ? (
            <div className="space-y-2">
              {[...submissionHistory].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map((submission, index) => (
                <div key={index} className="bg-slate-900/70 rounded-lg p-3 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-slate-500">{new Date(submission.submittedAt).toLocaleString()}</div>
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      submission.decision === "ACCEPT" ? "bg-green-900/50 text-green-400" :
                      submission.decision === "ACCEPT WITH FALLBACK REQUIRED" ? "bg-yellow-900/50 text-yellow-400" :
                      "bg-red-900/50 text-red-400"
                    }`}>
                      {submission.decision}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">{submission.checklistKey}</div>
                  <div className="text-xs text-slate-500">
                    {summary.pass} pass / {summary.fail} fail / {summary.untested} untested
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 text-xs py-8">
              No history for this feature
            </div>
          )}
        </div>
      )}

      {panelView === "mapping" && (
        <div className="flex-1 overflow-y-auto p-3" data-testid="qa-theme-mapping-tab">
          <ThemeMappingPanel pinnedEntity={pinnedInspectorEntity} />
        </div>
      )}

      {panelView === "debug" && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 mb-3">Debug Checkpoint Summary</div>
            
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Active Checklist</div>
              <div className="text-sm text-slate-300">{activeChecklistKey}</div>
            </div>
            
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Active Feature</div>
              <div className="text-sm text-slate-300">{activeFeatureId}</div>
            </div>
            
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">QA Version</div>
              <div className="text-sm text-slate-300">v{activeQaVersion}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">UI Inspector Toggle</div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  data-testid="theme-inspector-toggle-state"
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: themeInspectorEnabled ? "rgba(34, 197, 94, 0.15)" : "rgba(51, 65, 85, 0.8)",
                    color: themeInspectorEnabled ? "#4ade80" : themeTextMuted,
                    border: `1px solid ${themeInspectorEnabled ? "rgba(34, 197, 94, 0.5)" : themePanelBorder}`,
                  } as React.CSSProperties}
                >
                  UI Inspector {themeInspectorEnabled ? "ON" : "OFF"}
                </span>
                <button
                  type="button"
                  data-testid="theme-inspector-toggle-button"
                  onClick={onThemeInspectorToggle}
                  className="text-xs font-semibold px-3 py-1 rounded"
                  style={{
                    backgroundColor: themeInspectorEnabled ? "rgba(248, 113, 113, 0.15)" : `${themeAccent}20`,
                    color: themeInspectorEnabled ? "#f87171" : themeAccent,
                    border: `1px solid ${themeInspectorEnabled ? "rgba(248, 113, 113, 0.4)" : `${themeAccent}40`}`,
                  } as React.CSSProperties}
                >
                  {themeInspectorEnabled ? "Turn OFF" : "Turn ON"}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Hotkey {""}
                <span className="font-semibold text-slate-300">Alt+Shift+I</span> remains available.
              </p>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Runtime Probe Snapshot (v27a)</div>
              {probeResult ? (
                <div className="text-xs text-slate-400 space-y-0.5" data-testid="theme-target-probe-summary">
                  <div>Candidates: {probeResult.candidateCount}</div>
                  <div>Unknown: {probeResult.unknownCount}</div>
                  <div>Last Run: {new Date(probeResult.timestamp).toLocaleTimeString()}</div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">No runtime probe captured yet</div>
              )}
            </div>
            
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Check Progress</div>
              <div className="text-sm text-slate-300">{summary.pass + summary.fail + summary.blocked + summary.unverified} / {activeChecks.length} completed</div>
            </div>
            
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Acceptance Decision</div>
              <div className={`text-sm font-semibold ${
                acceptanceDecision === "ACCEPT" ? "text-green-400" :
                acceptanceDecision === "ACCEPT WITH FALLBACK REQUIRED" ? "text-yellow-400" :
                "text-red-400"
              }`}>
                {acceptanceDecision}
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Total Submissions</div>
              <div className="text-sm text-slate-300">{submissionHistory.length}</div>
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-3 mt-6">Baseline Status</div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Accepted Baseline</div>
              <div className="text-sm text-green-400">Baseline B: Complete with documented limitations</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Latest Submission Decision</div>
              <div className={`text-sm font-semibold ${
                lastSubmission?.decision === "ACCEPT" ? "text-green-400" :
                lastSubmission?.decision === "ACCEPT WITH FALLBACK REQUIRED" ? "text-yellow-400" :
                lastSubmission ? "text-red-400" : "text-slate-500"
              }`}>
                {lastSubmission?.decision ?? "No submissions yet"}
              </div>
            </div>

            {lastSubmission && (
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Last Submitted</div>
                <div className="text-sm text-slate-300">{new Date(lastSubmission.submittedAt).toLocaleString()}</div>
              </div>
            )}

            <div className="text-xs font-semibold text-slate-400 mb-3 mt-6">Checklist Identity Diagnostics</div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Active Checklist</div>
              <div className="text-sm text-slate-300">{activeChecklistKey}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Dropdown Selection</div>
              <div className="text-sm text-slate-300">{activeChecklistKey}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Report Key</div>
              <div className="text-sm text-slate-300">{activeChecklistKey}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Advisory Set Key</div>
              <div className="text-sm text-slate-300">{activeChecklistKey}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Identity Valid</div>
              <div className={`text-sm font-semibold ${validateChecklistIdentity().valid ? "text-green-400" : "text-red-400"}`}>
                {validateChecklistIdentity().valid ? "yes" : "no"}
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-3 mt-6" data-testid="theme-target-summary">
              Theme Target Registry Summary
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div data-testid="theme-target-summary-total">
                <div className="text-slate-500 mb-1">Total Targets</div>
                <div>{themeTargetSummary.totalTargets}</div>
              </div>
              <div data-testid="theme-target-summary-active">
                <div className="text-slate-500 mb-1">Active Targets</div>
                <div className="text-green-400">{themeTargetSummary.activeTargets}</div>
              </div>
              <div data-testid="theme-target-summary-planned">
                <div className="text-slate-500 mb-1">Planned Targets</div>
                <div>{themeTargetSummary.plannedTargets}</div>
              </div>
              <div data-testid="theme-target-summary-token-bindings">
                <div className="text-slate-500 mb-1">With Token Bindings</div>
                <div>{themeTargetSummary.targetsWithTokenBindings}</div>
              </div>
              <div data-testid="theme-target-summary-missing-token-bindings">
                <div className="text-slate-500 mb-1">Active Missing Bindings</div>
                <div className={themeTargetSummary.targetsMissingTokenBindings ? "text-yellow-400" : "text-slate-300"}>
                  {themeTargetSummary.targetsMissingTokenBindings}
                </div>
              </div>
              <div data-testid="theme-target-summary-visual-handles">
                <div className="text-slate-500 mb-1">With Visual Handle</div>
                <div>{themeTargetSummary.targetsWithVisualHandles}</div>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-2 mt-4">Targets by Surface</div>
            <div className="space-y-2 text-xs text-slate-300" data-testid="theme-target-surface-list">
              {THEME_SURFACES.map((surface) => (
                <div key={surface} className="bg-slate-900/40 rounded border border-slate-800 p-2">
                  <div className="text-slate-500 mb-1 capitalize">{surface}</div>
                  {themeTargetsBySurface[surface].length ? (
                    <ul className="list-disc list-inside space-y-1">
                      {themeTargetsBySurface[surface].map((target: ThemeTargetContract) => (
                        <li key={target.themeTargetId}>{target.themeTargetId} ({target.status})</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-slate-600">No targets registered</div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-3 mt-6" data-testid="contract-summary-section">Control Surface Contract Summary</div>

            <div className="grid grid-cols-2 gap-3">
              <div className="mb-3" data-testid="contract-total-active">
                <div className="text-xs text-slate-500 mb-1">Total Active Controls</div>
                <div className="text-sm text-slate-300">{contractSummary.totalActive}</div>
              </div>
              <div className="mb-3" data-testid="contract-with-qa">
                <div className="text-xs text-slate-500 mb-1">With QA Coverage</div>
                <div className="text-sm text-green-400">{contractSummary.withQaCoverage}</div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Handle IDs</div>
                <div className="text-sm text-slate-300">{contractSummary.withHandleId} ok / {contractSummary.missingHandleId} missing</div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Runtime Binding</div>
                <div className="text-sm text-slate-300">{contractSummary.withRuntimeBinding} ok / {contractSummary.missingRuntimeBinding} missing</div>
              </div>
              <div className="mb-3" data-testid="contract-with-playwright">
                <div className="text-xs text-slate-500 mb-1">With Playwright Coverage</div>
                <div className="text-sm text-green-400">{contractSummary.withPlaywrightCoverage}</div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Missing Playwright</div>
                <div className={`text-sm ${contractSummary.missingPlaywright > 0 ? "text-yellow-400" : "text-green-400"}`}>{contractSummary.missingPlaywright}</div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Settings Keys</div>
                <div className="text-sm text-slate-300">{contractSummary.withSettingsKey} keyed / {contractSummary.settingsKeyNull} stateless / {contractSummary.missingSettingsKey} missing</div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Missing Docs</div>
                <div className={`text-sm ${contractSummary.missingDocs > 0 ? "text-yellow-400" : "text-green-400"}`}>{contractSummary.missingDocs}</div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Missing QA</div>
                <div className={`text-sm ${contractSummary.missingQa > 0 ? "text-yellow-400" : "text-green-400"}`}>{contractSummary.missingQa}</div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">High Risk</div>
                <div className={`text-sm ${contractSummary.highRisk > 0 ? "text-red-400" : "text-green-400"}`}>{contractSummary.highRisk}</div>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-3 mt-6">By Surface</div>

            <div className="mb-3" data-testid="contract-surface-grouping">
              <div className="text-xs text-slate-500 mb-1">Top Bar</div>
              <div className="text-sm text-slate-300">{contractSummary.bySurface.topbar}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Graph</div>
              <div className="text-sm text-slate-300">{contractSummary.bySurface.graph}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Mission Control</div>
              <div className="text-sm text-slate-300">{contractSummary.bySurface.missionControl}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Settings Panel</div>
              <div className="text-sm text-slate-300">{contractSummary.bySurface.settings}</div>
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-3 mt-6">Missing Playwright Coverage</div>
            <div className="space-y-2">
              {Object.entries(contractSummary.missingPlaywrightBySurface).map(([surface, contracts]) => (
                <div key={surface} className="bg-slate-900/40 rounded border border-slate-800 p-2" data-testid={`missing-playwright-${surface}`}>
                  <div className="text-xs text-slate-500 mb-1 capitalize">{surface}</div>
                  {contracts.length === 0 ? (
                    <div className="text-xs text-green-400">Fully covered</div>
                  ) : (
                    <ul className="list-disc list-inside text-xs text-yellow-300 space-y-1">
                      {contracts.map((contract) => (
                        <li key={contract.id}>{contract.label}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="lw-divider text-xs text-slate-600 mt-4 pt-3 border-t border-slate-700">
              <em>Contract registry v0.1.0 • Source: src/control-plane/contracts/controlSurfaceContract.registry.ts</em>
            </div>
          </div>
        </div>
      )}

      {panelView === "advisory" && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 mb-3">Bandit Questions</div>
            <div className="text-xs text-slate-500 mb-4">
              Advisory questions from Bandit for design decisions and direction.
            </div>
            {advisoryContent.questions.length > 0 ? (
              <div className="space-y-3 mb-6">
                {advisoryContent.questions.map((question) => (
                  <div
                    key={question.id}
                    data-testid={`bandit-question-card-${question.id}`}
                    className="lw-card bg-slate-800/50 rounded p-2 border border-slate-700"
                    data-lw-theme-target="mission-control.question-card"
                  >
                    <div className="text-xs font-medium text-slate-300 mb-1">{question.prompt}</div>
                    {question.context && (
                      <div className="text-xs text-slate-500 mb-2">{question.context}</div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <select
                        value={question.status}
                        data-testid={`bandit-question-status-${question.id}`}
                        onChange={(e) => {
                          const updatedQuestions = advisoryContent.questions.map((q) =>
                            q.id === question.id ? { ...q, status: e.target.value as any } : q
                          );
                          setAdvisoryContent({ ...advisoryContent, questions: updatedQuestions });
                        }}
                        className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300"
                      >
                        <option value="unanswered">Unanswered</option>
                        <option value="answered">Answered</option>
                        <option value="deferred">Deferred</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                      <div className="text-xs text-slate-500">
                        {question.status === "unanswered" && "Not answered yet"}
                        {question.status === "answered" && "Answered"}
                        {question.status === "deferred" && "Deferred"}
                        {question.status === "dismissed" && "Dismissed"}
                      </div>
                    </div>
                    <textarea
                      value={question.userResponse || ""}
                      data-testid={`bandit-question-notes-${question.id}`}
                      onChange={(e) => {
                        const updatedQuestions = advisoryContent.questions.map((q) =>
                          q.id === question.id ? { ...q, userResponse: e.target.value } : q
                        );
                        setAdvisoryContent({ ...advisoryContent, questions: updatedQuestions });
                        // Persist question answers
                        const answersMap: Record<string, string> = {};
                        updatedQuestions.forEach((q) => {
                          if (q.userResponse) {
                            answersMap[q.id] = q.userResponse;
                          }
                        });
                        localStorage.setItem(QUESTION_ANSWER_STORAGE_KEY, JSON.stringify(answersMap));
                      }}
                      placeholder="Enter your answer or notes..."
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded p-2 text-slate-300 resize-y min-h-[60px]"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-600 italic mb-6">No advisory questions loaded.</div>
            )}

            <div className="text-xs font-semibold text-slate-400 mb-3">Bandit Proposals</div>
            <div className="text-xs text-slate-500 mb-4">
              Feature proposals and improvement suggestions from Bandit.
            </div>
            {advisoryContent.proposals.length > 0 ? (
              <div className="space-y-3 mb-6">
                {advisoryContent.proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    data-testid={`bandit-proposal-card-${proposal.id}`}
                    className="lw-card bg-slate-800/50 rounded p-2 border border-slate-700"
                    data-lw-theme-target="mission-control.proposal-card"
                  >
                    <div className="text-xs font-medium text-slate-300 mb-1">{proposal.title}</div>
                    <div className="text-xs text-slate-400 mb-1">{proposal.summary}</div>
                    {proposal.rationale && (
                      <div className="text-xs text-slate-500 mb-2">{proposal.rationale}</div>
                    )}
                    {proposal.risk && (
                      <div className="text-xs text-slate-500 mb-2">
                        Risk: <span className={
                          proposal.risk === "low" ? "text-green-400" :
                          proposal.risk === "medium" ? "text-yellow-400" :
                          "text-red-400"
                        }>{proposal.risk}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <select
                        value={proposal.userDecision}
                        data-testid={`bandit-proposal-decision-${proposal.id}`}
                        onChange={(e) => handleProposalDecisionUpdate(proposal.id, e.target.value as BanditProposalDecision)}
                        className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300"
                      >
                        <option value="unreviewed">Unreviewed</option>
                        <option value="accept-for-future">Accept for Future</option>
                        <option value="defer">Defer</option>
                        <option value="reject">Reject</option>
                        <option value="needs-more-detail">Needs More Detail</option>
                      </select>
                    </div>
                    <textarea
                      value={proposal.userNotes || ""}
                      data-testid={`bandit-proposal-notes-${proposal.id}`}
                      onChange={(e) => {
                        const updatedProposals = advisoryContent.proposals.map((p) =>
                          p.id === proposal.id ? { ...p, userNotes: e.target.value } : p
                        );
                        setAdvisoryContent({ ...advisoryContent, proposals: updatedProposals });
                      }}
                      placeholder="Add notes..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-600 italic mb-6">No advisory proposals loaded.</div>
            )}

            <div className="text-xs font-semibold text-slate-400 mb-3">Bandit Top 10 Backlog</div>
            <div className="text-xs text-slate-500 mb-4">
              Ranked backlog ideas for future development bites. Reorder to set priority.
            </div>
            {advisoryContent.backlog.length > 0 ? (
              <div className="space-y-2">
                {advisoryContent.backlog.map((item, index) => (
                  <div
                    key={item.rank}
                    className="lw-card flex items-start gap-2 bg-slate-800/50 rounded p-2 border border-slate-700"
                    data-testid={`bandit-backlog-item-${item.rank}`}
                    data-lw-theme-target="mission-control.backlog-card"
                  >
                    <div className="text-xs font-mono text-slate-500 mt-0.5">#{item.rank}</div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-300" data-testid="bandit-backlog-title">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.whyItMatters}</div>
                      {item.risk && (
                        <div className="text-xs text-slate-500 mt-1">
                          Risk: <span className={
                            item.risk === "low" ? "text-green-400" :
                            item.risk === "medium" ? "text-yellow-400" :
                            "text-red-400"
                          }>{item.risk}</span>
                        </div>
                      )}
                      <div className="text-xs text-slate-600 mt-1">
                        Status: <span className={
                          item.status === "candidate" ? "text-blue-400" :
                          item.status === "promoted" ? "text-green-400" :
                          item.status === "deferred" ? "text-yellow-400" :
                          "text-slate-500"
                        }>{item.status}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveBacklogItemUp(index)}
                        disabled={index === 0}
                        className="text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded px-2 py-0.5"
                        data-testid={`bandit-backlog-move-up-${item.rank}`}
                        title="Move up in priority"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveBacklogItemDown(index)}
                        disabled={index === advisoryContent.backlog.length - 1}
                        className="text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded px-2 py-0.5"
                        data-testid={`bandit-backlog-move-down-${item.rank}`}
                        title="Move down in priority"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-600 italic">No backlog items loaded.</div>
            )}

            <div className="lw-divider text-xs text-slate-600 mt-4 pt-3 border-t border-slate-700">
              <em>Advisory channel v0 • Proposals are advisory only and do not trigger implementation</em>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}