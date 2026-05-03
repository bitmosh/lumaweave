# Theme and Mission Control Handles

## Overview

This document documents future handles for theme customization and Mission Control / Agent Chat features. All handles in this document are classified as PLANNED.

## v31 Note

As of v31, visual handles in 09_VISUAL_HANDLE_LIBRARY.md now cite canonical token paths from THEME_TOKEN_PATH_MAP.md. This document remains focused on planned settings handles for future Theme Mapping controls.

## Theme Handles

### appearance.theme
- **Handle Path:** appearance.theme
- **Label:** Theme Preset
- **Category:** Appearance
- **Default Value:** "solar-plasma"
- **UI Control Type:** select (theme preset dropdown)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Theme store (activeThemePresetId)
- **Live Update Behavior:** Yes - theme changes apply immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Selects active theme preset from built-in or custom presets. Located in top bar.

### appearance.customThemePresets
- **Handle Path:** appearance.customThemePresets
- **Label:** Custom Theme Presets
- **Category:** Appearance
- **Default Value:** []
- **UI Control Type:** array (managed by theme editor)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Theme store (customThemePresets)
- **Live Update Behavior:** Yes - custom presets update immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Array of user-created theme presets. Managed by theme editor, not directly exposed in settings panel.

### appearance.activeThemePresetId
- **Handle Path:** appearance.activeThemePresetId
- **Label:** Active Theme Preset ID
- **Category:** Appearance
- **Default Value:** "solar-plasma"
- **UI Control Type:** string (internal state)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Theme store (activeThemePresetId)
- **Live Update Behavior:** Yes - active preset updates immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Internal state tracking the currently active theme preset ID. Updated by theme preset dropdown.

## Mission Control Handles

### missionControl.enabled
- **Handle Path:** missionControl.enabled
- **Label:** Mission Control Enabled
- **Category:** Mission Control
- **Default Value:** true
- **UI Control Type:** boolean (toggle)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Mission Control panel visibility
- **Live Update Behavior:** Yes - panel visibility changes immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Mission Control v0 (future)
- **Notes:** Toggle to show/hide Mission Control panel. Replaces current QA panel visibility toggle.

### missionControl.mode
- **Handle Path:** missionControl.mode
- **Label:** Mission Control Mode
- **Category:** Mission Control
- **Default Value:** "checklist"
- **UI Control Type:** select (checklist | history | debug | agent-chat)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Mission Control active tab
- **Live Update Behavior:** Yes - tab changes immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Mission Control v0 (future)
- **Notes:** Controls which Mission Control tab is active. Checklist mode is current QA panel.

### missionControl.activeChecklistId
- **Handle Path:** missionControl.activeChecklistId
- **Label:** Active Checklist ID
- **Category:** Mission Control
- **Default Value:** "baseline-b-consolidation-followup-v0"
- **UI Control Type:** string (select)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** QA registry (active checklist)
- **Live Update Behavior:** Yes - checklist changes immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Mission Control v0 (future)
- **Notes:** Selects active QA checklist. Replaces current featureId/qaVersion pattern.

### missionControl.lastSubmittedReport
- **Handle Path:** missionControl.lastSubmittedReport
- **Label:** Last Submitted Report
- **Category:** Mission Control
- **Default Value:** null
- **UI Control Type:** object (internal state)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** QA store (last submission)
- **Live Update Behavior:** Yes - updates on submit
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Mission Control v0 (future)
- **Notes:** Internal state storing the most recently submitted QA report. Displayed in Last Submitted Report panel.

### missionControl.agentChatEnabled
- **Handle Path:** missionControl.agentChatEnabled
- **Label:** Agent Chat Enabled
- **Category:** Mission Control
- **Default Value:** false
- **UI Control Type:** boolean (toggle)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Agent Chat tab visibility
- **Live Update Behavior:** Yes - tab visibility changes immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Mission Control v0 (future)
- **Notes:** Toggle to enable/disable Agent Chat tab. Disabled by default until AI infrastructure is ready.

## Layout Handles

### layout.leftRailMode
- **Handle Path:** layout.leftRailMode
- **Label:** Left Rail Mode
- **Category:** Layout
- **Default Value:** "expanded"
- **UI Control Type:** select (expanded | collapsed | hidden)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Left rail panel state
- **Live Update Behavior:** Yes - rail mode changes immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Layout v0 (future)
- **Notes:** Controls left rail visibility state. Expanded shows full panel, collapsed shows icon bar, hidden shows nothing.

### layout.rightRailMode
- **Handle Path:** layout.rightRailMode
- **Label:** Right Rail Mode
- **Category:** Layout
- **Default Value:** "expanded"
- **UI Control Type:** select (expanded | collapsed | hidden)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Right rail panel state
- **Live Update Behavior:** Yes - rail mode changes immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Layout v0 (future)
- **Notes:** Controls right rail visibility state. Expanded shows full panel, collapsed shows icon bar, hidden shows nothing.

### layout.topBarThemeSelector
- **Handle Path:** layout.topBarThemeSelector
- **Label:** Top Bar Theme Selector
- **Category:** Layout
- **Default Value:** "solar-plasma"
- **UI Control Type:** select (theme preset dropdown)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Top bar theme dropdown
- **Live Update Behavior:** Yes - theme changes immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Theme preset dropdown in top bar. Duplicates appearance.theme for layout control purposes.

## Handleset Relationship

### Theme Presets Modify Token Values
- Theme presets contain graph visual token values
- Applying a preset updates all tokens
- Token changes are live-updating
- No need to restart app

### Mission Control Replaces QA Panel
- Mission Control is the evolution of QA panel
- QA panel functionality preserved in Checklist tab
- Additional tabs added for History, Debug, Agent Chat
- No breaking changes to existing QA workflow

### Layout Controls Panel Visibility
- Left/right rail modes control panel visibility
- Layout presets set rail modes
- User can manually override layout preset
- Panel sizes persisted (when resizable panels implemented)

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- All handles in this document are PLANNED
- No source settings added yet
- Do not add source settings unless explicitly requested
