/** Domain user attached to HTTP requests — no provider-specific fields. */
export interface AuthenticatedUser {
  id: string;
  email: string | null;
  roles: string[];
}
