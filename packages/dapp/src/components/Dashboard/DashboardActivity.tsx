import * as React from "react";
import { connect } from "react-redux";
import { Set } from "immutable";
import styled, { StyledComponentClass } from "styled-components";
import BigNumber from "bignumber.js";
import { EthAddress } from "@joincivil/core";
import {
  Tabs,
  Tab,
  DashboardActivity as DashboardActivityComponent,
  AllChallengesDashboardTabTitle,
  RevealVoteDashboardTabTitle,
  ClaimRewardsDashboardTabTitle,
  RescueTokensDashboardTabTitle,
  StyledDashboardSubTab,
  SubTabReclaimTokensText,
  Modal,
  ProgressModalContentMobileUnsupported,
} from "@joincivil/components";

import { State } from "../../redux/reducers";
import {
  getUserChallengesWithUnclaimedRewards,
  getUserChallengesWithUnrevealedVotes,
  getUserChallengesWithRescueTokens,
  getChallengesStartedByUser,
  getChallengesVotedOnByUser,
  getAppealChallengesVotedOnByUser,
  getUserAppealChallengesWithRescueTokens,
  getUserAppealChallengesWithUnrevealedVotes,
  getUserAppealChallengesWithUnclaimedRewards,
} from "../../selectors";

import ActivityList from "./ActivityList";
import MyTasks from "./MyTasks";
import ReclaimTokens from "./ReclaimTokens";
import ChallengesWithRewardsToClaim from "./ChallengesWithRewardsToClaim";
import ChallengesWithTokensToRescue from "./ChallengesWithTokensToRescue";
import DepositTokens from "./DepositTokens";

const TABS: string[] = ["tasks", "newsrooms", "challenges", "activity"];

export interface DashboardActivityProps {
  match?: any;
  history: any;
}

export interface DashboardActivityReduxProps {
  currentUserNewsrooms: Set<string>;
  currentUserChallengesVotedOn: Set<string>;
  currentUserAppealChallengesVotedOn?: Set<string>;
  currentUserChallengesStarted: Set<string>;
  userChallengesWithUnclaimedRewards?: Set<string>;
  userChallengesWithUnrevealedVotes?: Set<string>;
  userChallengesWithRescueTokens?: Set<string>;
  userAppealChallengesWithUnclaimedRewards?: Set<string>;
  userAppealChallengesWithRescueTokens?: Set<string>;
  userAppealChallengesWithUnrevealedVotes?: Set<string>;
  userAccount: EthAddress;
}

export interface ChallengesToProcess {
  [index: string]: [boolean, BigNumber];
}

export interface DashboardActivityState {
  isNoMobileTransactionVisible: boolean;
  activeTasksTab: number;
}

const StyledTabsComponent = styled.div`
  margin-left: 26px;
`;

export const StyledBatchButtonContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 12px 0 36px;
`;

// We're storing which challenges to multi-claim in the state of this component, because
// the user can select which rewards to batch
// @TODO(jon: Clean this up. Maybe this gets put into redux, or we create a more
// explicit type that describes this object that gets checked and that type has a field
// called something like `isSelected` so this code is a bit clearer
export const getChallengesToProcess = (challengeObj: ChallengesToProcess): BigNumber[] => {
  const challengesToCheck = Object.entries(challengeObj);
  const challengesToProcess: BigNumber[] = challengesToCheck
    .map((challengeToProcess: [string, [boolean, BigNumber]]) => {
      if (challengeToProcess[1][0]) {
        return new BigNumber(challengeToProcess[0]);
      }
      return;
    })
    .filter(item => !!item) as BigNumber[];
  return challengesToProcess;
};

export const getSalts = (challengeObj: ChallengesToProcess): BigNumber[] => {
  const challengesToCheck = Object.entries(challengeObj);
  const challengesToProcess: BigNumber[] = challengesToCheck
    .map((challengeToProcess: [string, [boolean, BigNumber]]) => {
      if (challengeToProcess[1][0]) {
        return challengeToProcess[1][1];
      }
      return;
    })
    .filter(item => !!item) as BigNumber[];
  return challengesToProcess;
};

class DashboardActivity extends React.Component<
  DashboardActivityProps & DashboardActivityReduxProps,
  DashboardActivityState
> {
  constructor(props: DashboardActivityProps & DashboardActivityReduxProps) {
    super(props);
    this.state = {
      isNoMobileTransactionVisible: false,
      activeTasksTab: 0,
    };
  }

  public render(): JSX.Element {
    const { activeDashboardTab } = this.props.match.params;
    let activeIndex = 0;
    if (activeDashboardTab) {
      activeIndex = TABS.indexOf(activeDashboardTab) || 0;
    }
    return (
      <DashboardActivityComponent
        userVotes={this.renderUserVotes()}
        userNewsrooms={this.renderUserNewsrooms()}
        userChallenges={this.renderUserChallenges()}
        activeIndex={activeIndex}
        onTabChange={this.onTabChange}
      />
    );
  }

  private renderUserNewsrooms = (): JSX.Element => {
    return <ActivityList listings={this.props.currentUserNewsrooms} />;
  };

  private renderUserChallenges = (): JSX.Element => {
    return <ActivityList challenges={this.props.currentUserChallengesStarted} />;
  };

  private renderUserVotes = (): JSX.Element => {
    const {
      currentUserChallengesVotedOn,
      currentUserAppealChallengesVotedOn,
      userChallengesWithUnclaimedRewards,
      userChallengesWithUnrevealedVotes,
      userChallengesWithRescueTokens,
      userAppealChallengesWithRescueTokens,
      userAppealChallengesWithUnrevealedVotes,
      userAppealChallengesWithUnclaimedRewards,
    } = this.props;
    const allVotesTabTitle = (
      <AllChallengesDashboardTabTitle
        count={currentUserChallengesVotedOn.count() + currentUserAppealChallengesVotedOn!.count()}
      />
    );
    const revealVoteTabTitle = (
      <RevealVoteDashboardTabTitle
        count={userChallengesWithUnrevealedVotes!.count() + userAppealChallengesWithUnrevealedVotes!.count()}
      />
    );
    const claimRewardsTabTitle = (
      <ClaimRewardsDashboardTabTitle
        count={userChallengesWithUnclaimedRewards!.count() + userAppealChallengesWithUnclaimedRewards!.count()}
      />
    );
    const rescueTokensTabTitle = (
      <RescueTokensDashboardTabTitle
        count={userChallengesWithRescueTokens!.count() + userAppealChallengesWithRescueTokens!.count()}
      />
    );

    return (
      <>
        <Tabs
          TabComponent={StyledDashboardSubTab}
          TabsNavComponent={StyledTabsComponent}
          activeIndex={this.state.activeTasksTab}
          onActiveTabChange={this.setActiveTasksTab}
        >
          <Tab title={allVotesTabTitle}>
            <MyTasks
              challenges={currentUserChallengesVotedOn}
              appealChallenges={currentUserAppealChallengesVotedOn}
              showClaimRewardsTab={() => {
                this.setActiveTasksTab(2);
              }}
              showRescueTokensTab={() => {
                this.setActiveTasksTab(3);
              }}
            />
          </Tab>
          <Tab title={revealVoteTabTitle}>
            <ActivityList
              challenges={userChallengesWithUnrevealedVotes}
              appealChallenges={userAppealChallengesWithUnrevealedVotes}
            />
          </Tab>
          <Tab title={claimRewardsTabTitle}>
            <ChallengesWithRewardsToClaim
              challenges={userChallengesWithUnclaimedRewards}
              appealChallenges={userAppealChallengesWithUnclaimedRewards}
              onMobileTransactionClick={this.showNoMobileTransactionsModal}
            />
          </Tab>
          <Tab title={rescueTokensTabTitle}>
            <ChallengesWithTokensToRescue
              challenges={userChallengesWithRescueTokens}
              appealChallenges={userAppealChallengesWithRescueTokens}
              onMobileTransactionClick={this.showNoMobileTransactionsModal}
            />
          </Tab>
          <Tab title={<SubTabReclaimTokensText />}>
            <>
              <ReclaimTokens onMobileTransactionClick={this.showNoMobileTransactionsModal} />
              <DepositTokens />
            </>
          </Tab>
        </Tabs>
        {this.renderNoMobileTransactions()}
      </>
    );
  };

  private setActiveTasksTab = (activeTasksTabIndex: number): void => {
    this.setState({ activeTasksTab: activeTasksTabIndex });
  };

  private onTabChange = (activeIndex: number = 0): void => {
    const tabName = TABS[activeIndex];
    this.props.history.push(`/dashboard/${tabName}`);
  };

  private showNoMobileTransactionsModal = (): void => {
    this.setState({ isNoMobileTransactionVisible: true });
  };

  private hideNoMobileTransactionsModal = (): void => {
    this.setState({ isNoMobileTransactionVisible: false });
  };

  private renderNoMobileTransactions(): JSX.Element {
    if (this.state.isNoMobileTransactionVisible) {
      return (
        <Modal textAlign="center">
          <ProgressModalContentMobileUnsupported hideModal={this.hideNoMobileTransactionsModal} />
        </Modal>
      );
    }

    return <></>;
  }
}

const mapStateToProps = (
  state: State,
  ownProps: DashboardActivityProps,
): DashboardActivityProps & DashboardActivityReduxProps => {
  const { currentUserNewsrooms, user } = state.networkDependent;
  const currentUserChallengesVotedOn = getChallengesVotedOnByUser(state);
  const currentUserAppealChallengesVotedOn = getAppealChallengesVotedOnByUser(state);
  const currentUserChallengesStarted = getChallengesStartedByUser(state);
  const userChallengesWithUnclaimedRewards = getUserChallengesWithUnclaimedRewards(state);
  const userAppealChallengesWithUnclaimedRewards = getUserAppealChallengesWithUnclaimedRewards(state);
  const userChallengesWithUnrevealedVotes = getUserChallengesWithUnrevealedVotes(state);
  const userAppealChallengesWithUnrevealedVotes = getUserAppealChallengesWithUnrevealedVotes(state);

  const userChallengesWithRescueTokens = getUserChallengesWithRescueTokens(state);
  const userAppealChallengesWithRescueTokens = getUserAppealChallengesWithRescueTokens(state);

  return {
    currentUserNewsrooms,
    currentUserChallengesVotedOn,
    currentUserAppealChallengesVotedOn,
    currentUserChallengesStarted,
    userChallengesWithUnclaimedRewards,
    userChallengesWithUnrevealedVotes,
    userChallengesWithRescueTokens,
    userAppealChallengesWithUnclaimedRewards,
    userAppealChallengesWithUnrevealedVotes,
    userAppealChallengesWithRescueTokens,
    userAccount: user.account.account,
    ...ownProps,
  };
};

export default connect(mapStateToProps)(DashboardActivity);
