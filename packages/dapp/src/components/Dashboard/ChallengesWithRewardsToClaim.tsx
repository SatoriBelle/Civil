import * as React from "react";
import { compose } from "redux";
import BigNumber from "bignumber.js";

import { TwoStepEthTransaction, TxHash } from "@joincivil/core";

import {
  ClaimRewardsDescriptionText,
  ModalContent,
  StyledDashboardActivityDescription,
  TransactionButtonNoModal,
} from "@joincivil/components";

import { multiClaimRewards } from "../../apis/civilTCR";
import { InjectedTransactionStatusModalProps, hasTransactionStatusModals } from "../utility/TransactionStatusModalsHOC";

import ActivityList from "./ActivityList";
import { ChallengesToProcess, StyledBatchButtonContainer, getChallengesToProcess, getSalts } from "./DashboardActivity";

enum TransactionTypes {
  MULTI_CLAIM_REWARDS = "MULTI_CLAIM_REWARDS",
}

const transactionLabels = {
  [TransactionTypes.MULTI_CLAIM_REWARDS]: "Claim Rewards",
};

const transactionSuccessContent = {
  [TransactionTypes.MULTI_CLAIM_REWARDS]: [
    "You have successfully claimed your rewards",
    <ModalContent>Thank you for participating and helping curate high-quality, trustworthy journalism.</ModalContent>,
  ],
};

const transactionRejectionContent = {
  [TransactionTypes.MULTI_CLAIM_REWARDS]: [
    "Your rewards were not claimed",
    "To claim your rewards, you need to confirm the transaction in your MetaMask wallet.",
  ],
};

const transactionErrorContent = {
  [TransactionTypes.MULTI_CLAIM_REWARDS]: [
    "The was an problem with claiming your rewards",
    <ModalContent>Please retry your transaction</ModalContent>,
  ],
};

const transactionStatusModalConfig = {
  transactionLabels,
  transactionSuccessContent,
  transactionRejectionContent,
  transactionErrorContent,
};

export interface ChallengesWithRewardsToClaimProps {
  challenges: any;
  appealChallenges: any;
  onMobileTransactionClick?(): any;
}

interface ChallengesWithRewardsToClaimState {
  challengesToClaim: ChallengesToProcess;
}

class ChallengesWithRewardsToClaim extends React.Component<
  ChallengesWithRewardsToClaimProps & InjectedTransactionStatusModalProps,
  ChallengesWithRewardsToClaimState
> {
  constructor(props: ChallengesWithRewardsToClaimProps & InjectedTransactionStatusModalProps) {
    super(props);
    this.state = {
      challengesToClaim: {},
    };
  }

  public componentWillMount(): void {
    this.props.setTransactions(this.getTransactions());
  }

  public componentWillUnmount(): void {
    this.setState(() => ({ challengesToClaim: {} }));
  }

  public render(): JSX.Element {
    const isClaimRewardsButtonDisabled = !this.state.challengesToClaim.length;
    const transactions = this.getTransactions();

    return (
      <>
        <StyledDashboardActivityDescription>
          <ClaimRewardsDescriptionText />
        </StyledDashboardActivityDescription>
        <ActivityList
          challenges={this.props.challenges}
          appealChallenges={this.props.appealChallenges}
          resolvedChallenges={true}
          toggleChallengeSelect={this.setChallengesToMultiClaim}
        />
        <StyledBatchButtonContainer>
          <TransactionButtonNoModal
            disabled={isClaimRewardsButtonDisabled}
            transactions={transactions}
            disabledOnMobile={true}
            onMobileClick={this.props.onMobileTransactionClick}
          >
            Claim Rewards
          </TransactionButtonNoModal>
        </StyledBatchButtonContainer>
      </>
    );
  }

  private getTransactions = (): any[] => {
    return [
      {
        transaction: async () => {
          this.props.updateTransactionStatusModalsState({
            isWaitingTransactionModalOpen: true,
            isTransactionProgressModalOpen: false,
            isTransactionSuccessModalOpen: false,
            transactionType: TransactionTypes.MULTI_CLAIM_REWARDS,
          });
          return this.multiClaim();
        },
        handleTransactionHash: (txHash: TxHash) => {
          this.props.updateTransactionStatusModalsState({
            isWaitingTransactionModalOpen: false,
            isTransactionProgressModalOpen: true,
          });
        },
        postTransaction: () => {
          this.props.updateTransactionStatusModalsState({
            isWaitingTransactionModalOpen: false,
            isTransactionProgressModalOpen: false,
            isTransactionSuccessModalOpen: true,
          });
        },
        handleTransactionError: this.props.handleTransactionError,
      },
    ];
  };

  private setChallengesToMultiClaim = (challengeID: string, isSelected: boolean, salt: BigNumber): void => {
    this.setState(() => ({
      challengesToClaim: { ...this.state.challengesToClaim, [challengeID]: [isSelected, salt] },
    }));
  };

  private multiClaim = async (): Promise<TwoStepEthTransaction | void> => {
    const challengeIDs = getChallengesToProcess(this.state.challengesToClaim);
    const salts = getSalts(this.state.challengesToClaim);
    return multiClaimRewards(challengeIDs, salts);
  };
}

export default compose<React.ComponentClass<ChallengesWithRewardsToClaimProps>>(
  hasTransactionStatusModals(transactionStatusModalConfig),
)(ChallengesWithRewardsToClaim);
