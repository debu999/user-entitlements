export interface BusinessTerm {
  id: string;
  name: string;
  description: string;
  accessType: 'read' | 'write' | 'admin';
}

export interface Ruleset {
  id: string;
  name: string;
  description: string;
  businessTerms: BusinessTerm[];
}

export interface UserEntitlements {
  userId: string;
  userName: string;
  rulesets: Ruleset[];
} 