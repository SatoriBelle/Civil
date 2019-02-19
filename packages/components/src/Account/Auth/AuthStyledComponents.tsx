import * as React from "react";
import styled, { StyledComponentClass } from "styled-components";
import { colors, fonts } from "../../styleConstants";
import * as checkEmailImage from "../../images/auth/img-check-email@2x.png";

export const CheckboxContainer = styled.ul`
  list-style: none;
  padding-left: 0;
  margin-top: 0;
`;

export const CheckboxSection = styled.li`
  margin-bottom: 10px;
`;

export const CheckboxLabel = styled.span`
  color: ${colors.primary.CIVIL_GRAY_1};
  font: 400 12px/20px ${fonts.SANS_SERIF};
  padding-left: 7px;
`;

export const ConfirmButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 20px;
`;

export const CheckEmailLetterIcon = styled.div`
  width: 108px;
  height: 108px;
  background-image: url(${checkEmailImage});
  background-size: cover;
  margin: 30px 0;
`;

export const CenterWrapper: React.SFC = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <div>{children}</div>
  </div>
);

export const CheckEmailWrapper = styled.ul``;

export const CheckEmailSection: React.SFC = props => (
  <CenterWrapper>
    <CheckEmailLetterIcon />
  </CenterWrapper>
);

export const CenteredText = styled.div`
  text-align: center;
`;

export const FooterTextCentered = styled.div`
  text-align: center;
`;

export const AuthOuterWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const AuthInnerWrapper = styled.div`
  width: 470px;
  margin-top: 71px;
`;

export const AuthPageFooterLink = styled.div`
  text-align: center;
  font-size: 12px;
  text-decoration: underline;
  padding-top: 60px;
`;
