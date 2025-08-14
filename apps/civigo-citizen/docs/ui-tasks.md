Status legend: [ ] Todo, [~] In progress, [x] Done, [!] Blocker

Overview and brand colors

- primary: #0052A5
- secondary: #009688

Screens checklist (mobile-first, in order)

- [x] Welcome (welcome.png)
- [x] Start (start.png)
- [ ] Login/Signup (login-signup.png) — Sign in path is NIC → password
- [ ] NIC number (NICno.png)
- [ ] Phone (Mobile Number.png) + Verification (verification.png)
- [ ] Email (no PNG; match system)
- [ ] First name (firstname.png)
- [ ] Last name (lastname.png)
- [ ] Create password (create password.png)
- [ ] NIC photos — front (NIC font.png)
- [ ] NIC photos — back (nic backpng)
- [ ] Facial scan (facial scan.png)
- [ ] PIN creation (Pin Creation.png) — visual-only if step not wired
- [ ] Finalize — layout polish only

Components checklist

- [x] Tokens (Tailwind v4 theme, primary #0052A5, secondary #009688)
- [x] ProgressHeader (compact stepper, mobile-optimized)
- [ ] AuthShell (wrapper for margins and bottom CTA placement)
- [ ] FormField (field + error spacing, a11y wiring)

Notes

- UI-only; do not change Server Actions, SSR guards, cookies, RLS, routing, or business logic.
- Keep sign-in as NIC number → password on login-signup.
- Inline Zod error text under fields; pending/disabled on submit; Sonner toasts (no PII).
- Accessibility: labels, aria-describedby for errors, focus rings, keyboard nav; aria-live for OTP status.
- Mobile-first: single-column, safe-area padding, ≥44x44 touch targets, 8–12px rhythm.

Changelog

- chore(onboarding-ui): add ui-tasks.md tracker (seeded with screens/components and brand colors)
- feat(onboarding-ui): tokens + ProgressHeader (mobile-first, primary #0052A5, secondary #009688)
- feat(onboarding-ui): welcome (mobile-first)
- fix(onboarding-ui): welcome colors + logo header
- fix(onboarding-ui): use CSS var() tokens for primary/muted in welcome + ProgressHeader
- fix(onboarding-ui): force light theme on welcome (bg white, dark text) to match design
- fix(onboarding-ui): white background on onboarding layout to remove black edges
- fix(onboarding-ui): add curved blue arc background + improved button styling to match welcome.png
- fix(onboarding-ui): make welcome page responsive (full width) + correct blue curve direction
- fix(onboarding-ui): extend blue curve higher, position buttons over blue area to match welcome.png
- fix(onboarding-ui): redesign welcome page to match exact Figma design (Frame 1 with blue border, no curve)
- fix(onboarding-ui): heavier bottom-only stroke on top frame + drop shadow; removed inner padding
- fix(onboarding-ui): rounded bottom on top frame and added spacing above buttons to avoid touch
- feat(onboarding-ui): start screen (mobile-first) matching Signup.png layout
