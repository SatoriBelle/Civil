import * as React from "react";
import {
  StyledUserInfo,
  StyledUserInfoSection,
  StyledUserInfoSectionLabel,
  StyledUserInfoSectionValue,
  StyledUserAddress,
} from "./DashboardStyledComponents";
import {
  YourPublicAddressLabelText,
  BalanceLabelText,
  VotingBalanceLabelText,
  ChallengesWonLabelText,
  RewardsClaimedLabelText,
} from "./DashboardTextComponents";
import { Button, buttonSizes } from "../Button";

export interface DashboardUserInfoSummaryProps {
  userAccount: string;
  balance: string;
  votingBalance: string;
  challengesWonTotalCvl: string;
  rewardsEarned: string;
  buyCVLURL: string;
}

export const DashboardUserInfoSummary: React.StatelessComponent<DashboardUserInfoSummaryProps> = props => {
  return (
    <StyledUserInfo>
      <StyledUserInfoSectionLabel>
        <YourPublicAddressLabelText />
      </StyledUserInfoSectionLabel>
      <StyledUserAddress>{props.userAccount}</StyledUserAddress>

      <StyledUserInfoSection>
        <StyledUserInfoSectionLabel>
          <BalanceLabelText />
        </StyledUserInfoSectionLabel>
        <StyledUserInfoSectionValue>
          <strong>{props.balance}</strong>
        </StyledUserInfoSectionValue>
      </StyledUserInfoSection>

      <StyledUserInfoSection>
        <StyledUserInfoSectionLabel>
          <VotingBalanceLabelText />
        </StyledUserInfoSectionLabel>
        <StyledUserInfoSectionValue>
          <strong>{props.votingBalance}</strong>
        </StyledUserInfoSectionValue>
      </StyledUserInfoSection>

      <StyledUserInfoSection>
        <StyledUserInfoSectionLabel>
          <ChallengesWonLabelText />
        </StyledUserInfoSectionLabel>
        <StyledUserInfoSectionValue>
          <strong>{props.challengesWonTotalCvl}</strong>
        </StyledUserInfoSectionValue>
      </StyledUserInfoSection>

      <StyledUserInfoSection>
        <StyledUserInfoSectionLabel>
          <RewardsClaimedLabelText />
        </StyledUserInfoSectionLabel>
        <StyledUserInfoSectionValue>
          <strong>{props.rewardsEarned}</strong>
        </StyledUserInfoSectionValue>
      </StyledUserInfoSection>

      <StyledUserInfoSection>
        <Button size={buttonSizes.MEDIUM_WIDE} to={props.buyCVLURL} target="_blank">
          Buy or Sell CVL
        </Button>
      </StyledUserInfoSection>
    </StyledUserInfo>
  );
};
