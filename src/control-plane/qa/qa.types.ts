// SPDX-License-Identifier: Apache-2.0
export type QaStatus = "untested" | "pass" | "fail" | "blocked" | "unverified";

export interface QaCheckDefinition {
  id: string;
  featureId: string;
  featureName: string;
  qaVersion: number;
  qaKey?: string; // Canonical QA key tag (e.g., "v17", "v18")
  title: string;
  expected: string;
  steps: string[];
  required: boolean;
  fallbackAllowed?: boolean;
  active?: boolean;
  archived?: boolean;
}

// Adapter function to derive canonical qaKey from checklist definition
export function getChecklistIdentity(checklist: QaCheckDefinition): {
  qaKey: string;
  featureId: string;
  qaVersion: number;
} {
  const qaKey = checklist.qaKey ?? `v${checklist.qaVersion}`;
  return {
    qaKey,
    featureId: checklist.featureId,
    qaVersion: checklist.qaVersion,
  };
}

export interface QaCheckResult {
  checkId: string;
  status: QaStatus;
  notes: string;
  updatedAt?: string;
}

export interface QaFeatureSubmission {
  featureId: string;
  checklistKey: string;
  submittedAt: string;
  decision: string;
  markdown: string;
}

export interface QaSubmissionHistory {
  submissions: QaFeatureSubmission[];
  lastSubmission: QaFeatureSubmission | null;
}

export type QaItem = {
    id: string;
    label: string;
    category: string;
    featureFlag?: string;
  };

// Bandit Advisory Types

export type BanditQuestionStatus = "unanswered" | "answered" | "deferred" | "dismissed";

export interface BanditQuestion {
  id: string;
  prompt: string;
  context?: string;
  responseType?: "text" | "boolean" | "choice";
  userResponse?: string;
  status: BanditQuestionStatus;
}

export type BanditProposalDecision = "unreviewed" | "accept-for-future" | "defer" | "reject" | "needs-more-detail";

export interface BanditProposal {
  id: string;
  title: string;
  summary: string;
  rationale?: string;
  risk?: "low" | "medium" | "high";
  recommendedNextAction?: string;
  userDecision: BanditProposalDecision;
  userNotes?: string;
}

export type BanditBacklogStatus = "candidate" | "promoted" | "deferred" | "rejected";

export interface BanditBacklogIdea {
  rank: number;
  title: string;
  whyItMatters: string;
  suggestedFutureBite?: string;
  risk?: "low" | "medium" | "high";
  status: BanditBacklogStatus;
}

export interface BanditAdvisorySection {
  questions: BanditQuestion[];
  proposals: BanditProposal[];
  backlog: BanditBacklogIdea[];
}