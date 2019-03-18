import * as React from "react";
import {
  LoadUser,
  OBSectionHeader,
  OBSectionDescription,
  fonts,
  colors,
  CivilTutorialIcon,
} from "@joincivil/components";
import { TutorialModal, LaunchTutorialBtn } from "./TutorialModal";
import styled from "styled-components";

const SectionWrap = styled.div`
  border-bottom: 1px solid #d8d8d8;
  margin-bottom: 35px;
  padding: 0 50px 40px;
`;

const TutorialSectionStyled = styled.div`
  font-family: ${fonts.SANS_SERIF};
  padding-left: 60px;
  position: relative;

  h2 {
    font-size: 20px;
    font-weight: bold;
    line-height: 1;
    margin-top: 0;
  }

  p {
    color: #23282d;
    font-size: 14px;
    line-height: 20px;
    max-width: 600px;
  }
`;

const IconStyled = styled.div`
  align-items: center;
  border: 1px solid #d8d8d8;
  border-radius: 50%;
  display: flex;
  height: 48px;
  justify-content: center;
  left: 0;
  position: absolute;
  top: -11px;
  width: 48px;
`;

export class Tutorial extends React.Component {
  public render(): JSX.Element {
    return (
      <>
        <SectionWrap>
          <OBSectionHeader>Take the Civil Tutorial</OBSectionHeader>
          <OBSectionDescription>
            Before you can use Civil tokens, you must complete a tutorial to ensure you understand how to use Civil
            tokens and how the Registry works.
          </OBSectionDescription>
        </SectionWrap>
        <TutorialSectionStyled>
          <IconStyled>
            <CivilTutorialIcon color={colors.accent.CIVIL_GRAY_2} />
          </IconStyled>
          <h2>Civil Tutorial</h2>
          <p>
            You’ll be completing a completing a series of questions about Civil and how to use Civil tokens (CVL). This
            is a standard procedure to help inform you of best practices with purchasing and using tokens.
          </p>
          <p>
            It will take about 30 minutes to complete. If at any point you answer incorrectly, don’t worry. You will be
            able to answer the questions again.
          </p>
          <LoadUser>
            {({ loading, user }) => {
              if (loading) {
                return <LaunchTutorialBtn disabled={true}>Open the Tutorial</LaunchTutorialBtn>;
              }

              return <TutorialModal user={user} />;
            }}
          </LoadUser>
        </TutorialSectionStyled>
      </>
    );
  }
}