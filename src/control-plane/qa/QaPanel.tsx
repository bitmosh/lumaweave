import { useState, useEffect } from "react";
import { qaCheckDefinitions } from "./qa-registry";
import { useQaStore } from "./qa.store";
import type { QaCheckResult, QaStatus } from "./qa.types";
import { generateContractSummary } from "../contracts";
import { defaultAdvisoryV13 } from "./advisory-registry";

type PanelView = "checklist" | "last-submission" | "history" | "debug" | "advisory";

interface QaPanelProps {
  themeAccent?: string;
  themeTextMuted?: string;
  themePanelBorder?: string;
}

export function QaPanel({ themeAccent = "#a855f7", themeTextMuted = "#94a3b8", themePanelBorder = "rgba(148, 163, 184, 0.2)" }: QaPanelProps) {
  const [activeFeatureId, setActiveFeatureId] = useState<string>(() => {
    // Load persisted checklist selection, but clear v11/v13 selections
    const persisted = localStorage.getItem("lumaweave-qa-active-checklist");
    if (persisted && (persisted.includes("v11") || persisted.includes("v13"))) {
      localStorage.removeItem("lumaweave-qa-active-checklist");
      return "mission-control-advisory-channel";
    }
    if (persisted) {
      const [featureId] = persisted.split(":v");
      return featureId || "mission-control-advisory-channel";
    }
    return "mission-control-advisory-channel";
  });
  const [activeQaVersion, setActiveQaVersion] = useState<number>(() => {
    // Load persisted version, but clear v11/v13/v14 selections
    const persisted = localStorage.getItem("lumaweave-qa-active-checklist");
    if (persisted && (persisted.includes("v11") || persisted.includes("v13") || persisted.includes("v14"))) {
      return 15;
    }
    if (persisted) {
      const [, versionStr] = persisted.split(":v");
      const version = parseInt(versionStr, 10);
      return isNaN(version) ? 15 : version;
    }
    return 15;
  });
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [localNotes, setLocalNotes] = useState<string>("");
  const [panelView, setPanelView] = useState<PanelView>("checklist");

  const resultsByChecklist = useQaStore((state) => state.resultsByChecklist);
  const setCheckResult = useQaStore((state) => state.setCheckResult);
  const setFeatureSubmission = useQaStore((state) => state.setFeatureSubmission);
  const resetChecklistResults = useQaStore((state) => state.resetChecklistResults);
  const getLastSubmission = useQaStore((state) => state.getLastSubmission);
  const getSubmissionsByFeatureId = useQaStore((state) => state.getSubmissionsByFeatureId);

  const lastSubmission = getLastSubmission();
  const submissionHistory = getSubmissionsByFeatureId(activeFeatureId);

  // Advisory state - use default advisory for v13, empty for others
  const [advisoryContent, setAdvisoryContent] = useState(() => {
    // Load persisted backlog order from localStorage
    const persistedBacklog = localStorage.getItem("lumaweave-advisory-backlog-order");
    // Load persisted question answers from localStorage
    const persistedQuestionAnswers = localStorage.getItem("lumaweave-advisory-question-answers");
    const defaultAdvisory = defaultAdvisoryV13;
    
    let mergedAdvisory = { ...defaultAdvisory };
    
    // Apply persisted backlog order
    if (persistedBacklog) {
      try {
        const parsedBacklog = JSON.parse(persistedBacklog);
        // Validate and apply persisted order
        if (Array.isArray(parsedBacklog) && parsedBacklog.length === defaultAdvisory.backlog.length) {
          mergedAdvisory.backlog = parsedBacklog.map((item, index) => ({
            ...item,
            rank: index + 1
          }));
        }
      } catch (e) {
        console.error("Failed to parse persisted backlog order:", e);
      }
    }
    
    // Apply persisted question answers with defensive merge
    if (persistedQuestionAnswers) {
      try {
        const parsedAnswers = JSON.parse(persistedQuestionAnswers);
        // Merge answers into questions by ID, preserving all other question fields
        mergedAdvisory.questions = defaultAdvisory.questions.map((question) => {
          const persistedAnswer = parsedAnswers[question.id];
          if (persistedAnswer && typeof persistedAnswer === 'string') {
            return { ...question, userResponse: persistedAnswer };
          }
          return question;
        });
      } catch (e) {
        console.error("Failed to parse persisted question answers:", e);
      }
    }
    
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

  // Derive checklist key from featureId and qaVersion
  const activeChecklistKey = `${activeFeatureId}:v${activeQaVersion}`;

  const activeChecks = qaCheckDefinitions.filter(
    (check) => check.featureId === activeFeatureId && check.qaVersion === activeQaVersion && check.active !== false
  );

  // Fallback: if current checklist has no active checks, auto-select newest active checklist
  useEffect(() => {
    if (activeChecks.length === 0) {
      // Find all active checklists
      const allActiveChecklists = Array.from(
        new Set(
          qaCheckDefinitions
            .filter((check) => check.active !== false)
            .map((check) => `${check.featureId}:v${check.qaVersion}`)
        )
      ).map((checklistKey) => {
        const [featureId, versionStr] = checklistKey.split(":v");
        const qaVersion = parseInt(versionStr, 10);
        return { featureId, qaVersion, checklistKey };
      });

      // Sort by version descending to get newest
      allActiveChecklists.sort((a, b) => b.qaVersion - a.qaVersion);

      if (allActiveChecklists.length > 0) {
        const newest = allActiveChecklists[0];
        setActiveFeatureId(newest.featureId);
        setActiveQaVersion(newest.qaVersion);
        setCurrentIndex(0);
      }
    }
  }, [activeFeatureId, activeQaVersion]);

  const activeFeatureName = activeChecks[0]?.featureName || "Unknown Feature";
  const currentCheck = activeChecks[currentIndex];

  // Extract unique active checklists from qaCheckDefinitions for dropdown
  const uniqueChecklists = Array.from(
    new Set(
      qaCheckDefinitions
        .filter((check) => check.active !== false)
        .map((check) => `${check.featureId}:${check.qaVersion}`)
    )
  ).map((checklistKey) => {
    const [featureId, versionStr] = checklistKey.split(":v");
    const qaVersion = parseInt(versionStr, 10);
    const check = qaCheckDefinitions.find(
      (c) => c.featureId === featureId && c.qaVersion === qaVersion
    );
    return {
      checklistKey,
      featureId,
      qaVersion,
      featureName: check?.featureName || featureId,
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

  const handleChecklistChange = (checklistKey: string) => {
    const [featureId, versionStr] = checklistKey.split(":v");
    const qaVersion = parseInt(versionStr, 10);
    setActiveFeatureId(featureId);
    setActiveQaVersion(qaVersion);
    setCurrentIndex(0);
    // Persist the selected checklist to localStorage
    localStorage.setItem("lumaweave-qa-active-checklist", checklistKey);
  };

  const moveBacklogItemUp = (index: number) => {
    if (index === 0) return;
    const newBacklog = [...advisoryContent.backlog];
    [newBacklog[index - 1], newBacklog[index]] = [newBacklog[index], newBacklog[index - 1]];
    const updatedBacklog = newBacklog.map((item, idx) => ({ ...item, rank: idx + 1 }));
    setAdvisoryContent({ ...advisoryContent, backlog: updatedBacklog });
    localStorage.setItem("lumaweave-advisory-backlog-order", JSON.stringify(updatedBacklog));
  };

  const moveBacklogItemDown = (index: number) => {
    if (index === advisoryContent.backlog.length - 1) return;
    const newBacklog = [...advisoryContent.backlog];
    [newBacklog[index], newBacklog[index + 1]] = [newBacklog[index + 1], newBacklog[index]];
    const updatedBacklog = newBacklog.map((item, idx) => ({ ...item, rank: idx + 1 }));
    setAdvisoryContent({ ...advisoryContent, backlog: updatedBacklog });
    localStorage.setItem("lumaweave-advisory-backlog-order", JSON.stringify(updatedBacklog));
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
    <div className="flex flex-col h-full text-sm" data-testid="qa-panel">
      {/* Header */}
      <div className="flex-shrink-0 p-3" style={{ borderBottom: `1px solid ${themePanelBorder}` } as React.CSSProperties}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: themeTextMuted } as React.CSSProperties}>QA Panel</h2>
          <div className="flex items-center gap-2">
            <span 
              className="text-xs px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: `${themeAccent}20`,
                color: themeAccent 
              } as React.CSSProperties}
            >
              v{activeQaVersion}
            </span>
            <span 
              className="text-xs px-2 py-0.5 rounded font-semibold"
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
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs"
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
      <div className="flex-shrink-0 p-2 grid grid-cols-2 gap-1" style={{ borderBottom: `1px solid ${themePanelBorder}` } as React.CSSProperties}>
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
            acceptanceDecision === "ACCEPT WITH FALLBACK REQUIRED" ? "text-yellow-400" :
            acceptanceDecision === "DO NOT ACCEPT" ? "text-red-400" :
            acceptanceDecision === "BLOCKED" ? "text-yellow-400" :
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

      {/* Question counter */}
      <div className="flex-shrink-0 p-2 border-b border-slate-700 text-center text-xs text-slate-400">
        Question {currentIndex + 1} / {activeChecks.length}
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 p-2 border-b border-slate-700 flex gap-2">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded px-2 py-1 text-xs"
        >
          Previous
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === activeChecks.length - 1}
          className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded px-2 py-1 text-xs"
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
              <div className="font-medium text-slate-300 text-sm">{currentCheck.title}</div>
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

            <div className="text-xs font-semibold text-slate-400 mb-3 mt-6" data-testid="contract-summary-section">Control Surface Contract Summary</div>

            <div className="mb-3" data-testid="contract-total-active">
              <div className="text-xs text-slate-500 mb-1">Total Active Controls</div>
              <div className="text-sm text-slate-300">{(() => {
                const summary = generateContractSummary();
                return summary.totalActive;
              })()}</div>
            </div>

            <div className="mb-3" data-testid="contract-with-qa">
              <div className="text-xs text-slate-500 mb-1">With QA Coverage</div>
              <div className="text-sm text-green-400">{(() => {
                const summary = generateContractSummary();
                return summary.withQaCoverage;
              })()}</div>
            </div>

            <div className="mb-3" data-testid="contract-with-playwright">
              <div className="text-xs text-slate-500 mb-1">With Playwright Coverage</div>
              <div className="text-sm text-green-400">{(() => {
                const summary = generateContractSummary();
                return summary.withPlaywrightCoverage;
              })()}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Missing Docs</div>
              <div className={`text-sm ${(() => {
                const summary = generateContractSummary();
                return summary.missingDocs > 0 ? "text-yellow-400" : "text-green-400";
              })()}`}>{(() => {
                const summary = generateContractSummary();
                return summary.missingDocs;
              })()}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Missing QA</div>
              <div className={`text-sm ${(() => {
                const summary = generateContractSummary();
                return summary.missingQa > 0 ? "text-yellow-400" : "text-green-400";
              })()}`}>{(() => {
                const summary = generateContractSummary();
                return summary.missingQa;
              })()}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Missing Playwright</div>
              <div className={`text-sm ${(() => {
                const summary = generateContractSummary();
                return summary.missingPlaywright > 0 ? "text-yellow-400" : "text-green-400";
              })()}`}>{(() => {
                const summary = generateContractSummary();
                return summary.missingPlaywright;
              })()}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">High Risk</div>
              <div className={`text-sm ${(() => {
                const summary = generateContractSummary();
                return summary.highRisk > 0 ? "text-red-400" : "text-green-400";
              })()}`}>{(() => {
                const summary = generateContractSummary();
                return summary.highRisk;
              })()}</div>
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-3 mt-6">By Surface</div>

            <div className="mb-3" data-testid="contract-surface-grouping">
              <div className="text-xs text-slate-500 mb-1">Top Bar</div>
              <div className="text-sm text-slate-300">{(() => {
                const summary = generateContractSummary();
                return summary.bySurface.topbar;
              })()}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Graph</div>
              <div className="text-sm text-slate-300">{(() => {
                const summary = generateContractSummary();
                return summary.bySurface.graph;
              })()}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Mission Control</div>
              <div className="text-sm text-slate-300">{(() => {
                const summary = generateContractSummary();
                return summary.bySurface.missionControl;
              })()}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Settings</div>
              <div className="text-sm text-slate-300">{(() => {
                const summary = generateContractSummary();
                return summary.bySurface.settings;
              })()}</div>
            </div>

            <div className="text-xs text-slate-600 mt-4 pt-3 border-t border-slate-700">
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
                  <div key={question.id} data-testid={`bandit-question-card-${question.id}`} className="bg-slate-800/50 rounded p-2 border border-slate-700">
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
                        localStorage.setItem("lumaweave-advisory-question-answers", JSON.stringify(answersMap));
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
                  <div key={proposal.id} data-testid={`bandit-proposal-card-${proposal.id}`} className="bg-slate-800/50 rounded p-2 border border-slate-700">
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
                        onChange={(e) => {
                          const updatedProposals = advisoryContent.proposals.map((p) =>
                            p.id === proposal.id ? { ...p, userDecision: e.target.value as any } : p
                          );
                          setAdvisoryContent({ ...advisoryContent, proposals: updatedProposals });
                        }}
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
                  <div key={item.rank} className="flex items-start gap-2 bg-slate-800/50 rounded p-2 border border-slate-700">
                    <div className="text-xs font-mono text-slate-500 mt-0.5">#{item.rank}</div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-300">{item.title}</div>
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
                        title="Move up in priority"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveBacklogItemDown(index)}
                        disabled={index === advisoryContent.backlog.length - 1}
                        className="text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded px-2 py-0.5"
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

            <div className="text-xs text-slate-600 mt-4 pt-3 border-t border-slate-700">
              <em>Advisory channel v0 • Proposals are advisory only and do not trigger implementation</em>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}