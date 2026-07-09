// SPDX-License-Identifier: Apache-2.0
import { useMemo } from "react";
import { typographyRegistry, type TypographyEntry } from "../../../themes/typographyRegistry";
import type { TargetDescriptor } from "../inspector.types";
import { t } from "../../../i18n";
import "../styles/type-tab.css";

export interface TypeTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function TypeTab(_props: TypeTabProps) {
  const roles = useMemo(() => typographyRegistry.list(), []);

  if (roles.length === 0) {
    return (
      <div className="lw-type-tab-empty" data-testid="inspector-type-tab">
        <p>{t("inspector.spokes.type.placeholderMessage")}</p>
      </div>
    );
  }

  return (
    <div className="lw-type-tab" data-testid="inspector-type-tab">
      {roles.map((role) => (
        <TypeRoleCard key={role.role} role={role} />
      ))}
    </div>
  );
}

function TypeRoleCard({ role }: { role: TypographyEntry }) {
  const specimenText = t("inspector.spokes.type.specimenText");

  return (
    <div className="lw-type-role-card" data-testid={`type-role-card-${role.role}`}>
      <div className="lw-type-role-label">
        {t(`inspector.spokes.type.${role.role}Role`)}
      </div>
      <div
        className="lw-type-role-specimen"
        style={{ fontFamily: role.fallbackStack }}
      >
        {specimenText}
      </div>
      <div className="lw-type-role-meta">
        <span className="lw-type-role-family">{role.fontFamily}</span>
        <span className="lw-type-role-fallback">
          <span className="lw-type-role-fallback-label">
            {t("inspector.spokes.type.fallbackStackLabel")}:
          </span>{" "}
          <span className="lw-type-role-fallback-value">{role.fallbackStack}</span>
        </span>
      </div>
    </div>
  );
}
