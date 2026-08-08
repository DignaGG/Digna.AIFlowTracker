export interface IAppConfig {
  hasCompletedOnboarding: boolean
  preferredLanguage: 'tr' | 'en'
  defaultWorkflow: 'STRICT' | 'FAST_PASS' | 'ITERATIVE'
  isPhaseStepActive?: boolean
  theme?: 'light' | 'dark'
}
