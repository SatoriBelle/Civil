export * from "./Auth/VerifyToken";
export * from "./Auth/EmailAuth";
export * from "./Auth/EmailSent";
export * from "./Auth/EthAuth";
export * from "./LoadUser";

export {
  AuthOuterWrapper,
  AuthInnerWrapper,
  AuthPageFooterLink,
  AuthFooterTerms,
  AuthWrapper,
} from "./Auth/AuthStyledComponents";

export * from "./Auth/AuthTextComponents";

export enum AuthApplicationEnum {
  DEFAULT = "DEFAULT",
  NEWSROOM = "NEWSROOM",
  STOREFRONT = "STOREFRONT",
}

export interface AuthLoginResponse {
  token: string;
  refreshToken: string;
  uid: string;
}
