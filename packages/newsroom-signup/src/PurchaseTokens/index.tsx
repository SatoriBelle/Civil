import * as React from "react";
import styled from "styled-components";
import { BigNumber } from "bignumber.js";
import { connect } from "react-redux";
import { Parameters, getFormattedTokenBalance } from "@joincivil/utils";
import {
  colors,
  BorderlessButton,
  Button,
  buttonSizes,
  OBSectionHeader,
  OBSectionDescription,
  OBNoteText,
  OBCollapsable,
  OBCollapsableHeader,
  OBSmallParagraph,
  OBNoteHeading,
  HollowGreenCheck,
} from "@joincivil/components";
import { NextBackButtonContainer, FormTitle, FormSection, FormRow, FormRowItem } from "../styledComponents";

export interface PurchaseTokensExternalProps {
  navigate(go: 1 | -1): void;
}
export interface PurchaseTokensProps extends PurchaseTokensExternalProps {
  userCvlBalance: BigNumber;
  minDeposit: BigNumber;
  hasMinDeposit: boolean;
}

const BUY_TOKENS_URL = "/tokens?redirect=%2Fapply-to-registry";

const Border = styled.div`
  border-top: 1px solid ${colors.accent.CIVIL_GRAY_4};
  margin: 28px 0;
`;

const OBSectionSubHeader = styled(OBSectionDescription)`
  color: ${colors.primary.BLACK};
  font-weight: bold;
  text-align: left;
`;

const YouHaveEnough = styled(OBSectionSubHeader)`
  border-bottom: 1px solid ${colors.accent.CIVIL_GRAY_4};
  margin: 36px 0 -12px;
  padding-bottom: 36px;
  text-align: center;
`;

const CvlBalance = styled(FormTitle)`
  color: ${colors.accent.CIVIL_GRAY_0};
  margin-bottom: -4px;
`;
const CvlLabel = styled.span`
  color: ${colors.accent.CIVIL_GRAY_0};
  font-size: 12px;
`;
const BuyCvlTextLink = styled(OBNoteHeading)`
  color: ${colors.accent.CIVIL_BLUE};
  display: block;
  font-weight: bold;
  margin-top: 18px;
`;

const BuyButtonContainer = styled.div`
  display: inline-block;
  margin: 8px 0 36px;
  text-align: center;
`;

export class PurchaseTokensComponent extends React.Component<PurchaseTokensProps> {
  public renderButtons(): JSX.Element | void {
    return (
      <NextBackButtonContainer style={{ marginTop: 64 }}>
        <BorderlessButton size={buttonSizes.MEDIUM_WIDE} onClick={() => this.props.navigate(-1)}>
          Back
        </BorderlessButton>
        <Button
          disabled={!this.props.hasMinDeposit}
          textTransform="none"
          width={220}
          size={buttonSizes.MEDIUM_WIDE}
          onClick={() => this.props.navigate(1)}
        >
          Next
        </Button>
      </NextBackButtonContainer>
    );
  }

  public renderNotEnoughTokens(): JSX.Element {
    return (
      <>
        <Border />

        <OBSmallParagraph>
          To buy CVL tokens, you must buy ETH and then you will be able to buy CVL from an exchange. You can’t use USD
          to directly buy a CVL token — currencies need to be converted into ETH first.
        </OBSmallParagraph>

        <OBSectionSubHeader>You can buy Civil tokens (CVL) from our Token Store.</OBSectionSubHeader>
        <OBSmallParagraph>
          To buy tokens, you’ll be purchasing them from our Token store. It uses Airswap, a secure decentralized token
          exchange where you can buy and sell tokens on Ethereum blockchain. Airswap does not charge any of its own fees
          on each trade.
        </OBSmallParagraph>

        <BuyButtonContainer>
          <Button textTransform="none" width={220} size={buttonSizes.MEDIUM_WIDE} href={BUY_TOKENS_URL}>
            Buy CVL tokens
          </Button>
        </BuyButtonContainer>
      </>
    );
  }

  public renderEnoughTokens(): JSX.Element {
    return (
      <>
        <YouHaveEnough>
          <HollowGreenCheck width={48} height={48} />
          <br />
          You have enough tokens to apply
        </YouHaveEnough>

        <FormSection>
          <FormRow>
            <FormRowItem>
              <OBSectionSubHeader>Token Balance</OBSectionSubHeader>
            </FormRowItem>
            <FormRowItem>
              <CvlBalance>
                {getFormattedTokenBalance(this.props.userCvlBalance, true)}
                <CvlLabel>CVL</CvlLabel>
              </CvlBalance>
              <OBNoteText>tokens in your wallet</OBNoteText>
              <BuyCvlTextLink>
                <a href={BUY_TOKENS_URL}>Buy additional CVL tokens</a>
              </BuyCvlTextLink>
            </FormRowItem>
          </FormRow>
        </FormSection>
      </>
    );
  }

  public render(): JSX.Element {
    return (
      <>
        <OBSectionHeader>Purchase Tokens to Apply to the Registry</OBSectionHeader>
        <OBSectionDescription>
          You will need {!this.props.hasMinDeposit && "to purchase"}{" "}
          {getFormattedTokenBalance(this.props.minDeposit, true, 0)} Civil tokens (CVL) to deposit with your
          application. You can buy these tokens using ETH. These tokens are to state the seriousness of your intent to
          the Civil community.
        </OBSectionDescription>

        {this.props.hasMinDeposit ? this.renderEnoughTokens() : this.renderNotEnoughTokens()}

        <OBCollapsable
          open={false}
          header={<OBCollapsableHeader>What else will I need to use Civil tokens (CVL) for?</OBCollapsableHeader>}
        >
          <OBSmallParagraph>
            Tokens open up certain activities on the Civil platform including voting on Newsroom applications,
            challenging a Newsroom, or backing another token holder’s Newsroom challenge.
          </OBSmallParagraph>
          <OBSmallParagraph>
            Owning Civil tokens means owning a piece of the Civil network; they will act as voting stakes for the
            platform’s governance (e.g., deciding whether or not a given Newsroom meets the ethical journalism standards
            laid out in the Civil Constitution). There will only ever be a fixed supply of CVL tokens created. Owners of
            CVL will be economically incentivized to ensure existing and future Civil Newsrooms maintain high quality
            standards as the network, and its reach, grows.
          </OBSmallParagraph>
        </OBCollapsable>

        {this.renderButtons()}
      </>
    );
  }
}

const mapStateToProps = (state: any, ownProps: PurchaseTokensExternalProps): PurchaseTokensProps => {
  const { user, parameters } = state.networkDependent;
  const userBalance = new BigNumber((user && user.account && user.account.balance) || 0);
  const minDeposit = new BigNumber((parameters && parameters[Parameters.minDeposit]) || 0);
  return {
    ...ownProps,
    userCvlBalance: userBalance,
    minDeposit,
    hasMinDeposit: userBalance.greaterThanOrEqualTo(minDeposit),
  };
};

export const PurchaseTokens = connect(mapStateToProps)(PurchaseTokensComponent);
