import * as React from "react";
import styled from "styled-components";
import {
  StyledListingDetailPhaseCardSection,
  StyledListingDetailPhaseCardSectionHeader,
  FormCopy,
} from "./styledComponents";
import { buttonSizes, Button } from "../Button";
import { Collapsable } from "../Collapsable";

export interface AppealDecisionDetailProps {
  appealGranted: boolean;
  collapsable?: boolean;
  open?: boolean;
}

const StyledInner = styled.div`
  padding-top: 14px;
`;

const AppealDecisionDetailInner: React.SFC<AppealDecisionDetailProps> = props => {
  const decisionText = props.appealGranted ? "granted" : "not granted";
  return (
    <StyledInner>
      <FormCopy>
        The Civil Council has {decisionText} the appeal.{" "}
        {props.appealGranted && "Read more about their methodology and how they’ve come to this decision."}
      </FormCopy>

      {props.appealGranted && <Button size={buttonSizes.MEDIUM_WIDE}>Read about this decision</Button>}
    </StyledInner>
  );
};

export const AppealDecisionDetail: React.SFC<AppealDecisionDetailProps> = props => {
  const headerElement = (
    <StyledListingDetailPhaseCardSectionHeader>Civil Council Decision</StyledListingDetailPhaseCardSectionHeader>
  );
  if (props.collapsable) {
    const open = props.open !== undefined ? props.open : true;
    return (
      <StyledListingDetailPhaseCardSection>
        <Collapsable header={headerElement} open={open}>
          <AppealDecisionDetailInner {...props} />
        </Collapsable>
      </StyledListingDetailPhaseCardSection>
    );
  }
  return (
    <StyledListingDetailPhaseCardSection>
      {headerElement}
      <AppealDecisionDetailInner {...props} />
    </StyledListingDetailPhaseCardSection>
  );
};
