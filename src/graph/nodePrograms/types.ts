// SPDX-License-Identifier: Apache-2.0
import type { NodeProgramType } from "sigma/rendering";
import type { Attributes } from "graphology-types";

export type NodeProgramId = "sun" | "glass-sphere" | "crystal" | "orb" | "pip";

export type NodeProgramConstructor = NodeProgramType<Attributes, Attributes, Attributes>;
