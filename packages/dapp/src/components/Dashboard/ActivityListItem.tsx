import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { Link } from "react-router-dom";
import BigNumber from "bignumber.js";
import { ListingWrapper, WrappedChallengeData, UserChallengeData } from "@joincivil/core";
import { NewsroomState } from "@joincivil/newsroom-manager";
import { DashboardActivityItem, PHASE_TYPE_NAMES } from "@joincivil/components";
import { getFormattedTokenBalance } from "@joincivil/utils";
import { State } from "../../redux/reducers";
import {
  getChallenge,
  getListingPhaseState,
  makeGetListing,
  makeGetListingAddressByChallengeID,
  makeGetUserChallengeData,
  makeGetUnclaimedRewardAmount,
  getChallengeState,
} from "../../selectors";
import { WinningChallengeResults } from "./WinningChallengeResults";
import { PhaseCountdownTimer } from "./PhaseCountdownTimer";
import { fetchAndAddListingData } from "../../redux/actionCreators/listings";

export interface ActivityListItemOwnProps {
  listingAddress?: string;
  even: boolean;
  challenge?: WrappedChallengeData;
  userChallengeData?: UserChallengeData;
  unclaimedRewardAmount?: string;
  challengeState?: any;
  challengeID?: string;
  user?: string;
  listingDataRequestStatus?: any;
}

export interface ChallengeActivityListItemOwnProps {
  challengeID: string;
  even: boolean;
  user?: string;
}

export interface ResolvedChallengeActivityListItemProps {
  toggleSelect?(challengeID: string, isSelected: boolean, salt: BigNumber): void;
}

export interface ActivityListItemReduxProps {
  newsroom?: NewsroomState;
  listing?: ListingWrapper;
  listingPhaseState?: any;
  challengeState?: any;
}

class ActivityListItemComponent extends React.Component<
  ActivityListItemOwnProps & ResolvedChallengeActivityListItemProps & ActivityListItemReduxProps & DispatchProp<any>
> {
  public async componentDidUpdate(): Promise<void> {
    if (!this.props.listing && !this.props.listingDataRequestStatus) {
      this.props.dispatch!(fetchAndAddListingData(this.props.listingAddress!));
    }
  }

  public async componentDidMount(): Promise<void> {
    if (!this.props.listing && !this.props.listingDataRequestStatus) {
      this.props.dispatch!(fetchAndAddListingData(this.props.listingAddress!));
    }
  }

  public render(): JSX.Element {
    const { listingAddress: address, listing, newsroom, listingPhaseState } = this.props;
    if (listing && listing.data && newsroom && listingPhaseState) {
      const newsroomData = newsroom.wrapper.data;
      let listingDetailURL = `/listing/${address}`;
      if (this.props.challenge) {
        listingDetailURL = `/listing/${address}/challenge/${this.props.challenge.challengeID}`;
      }
      const buttonTextTuple = this.getButtonText();
      const props = {
        newsroomName: newsroomData.name,
        listingDetailURL,
        buttonText: buttonTextTuple[0],
        buttonHelperText: buttonTextTuple[1],
        challengeID: this.props.challengeID,
        salt: this.props.userChallengeData && this.props.userChallengeData.salt,
        toggleSelect: this.props.toggleSelect,
      };

      return <DashboardActivityItem {...props}>{this.renderActivityDetails()}</DashboardActivityItem>;
    } else {
      return <></>;
    }
  }

  private renderActivityDetails = (): JSX.Element => {
    const { listingPhaseState, challengeState } = this.props;
    const {
      isWhitelisted,
      isInApplication,
      isRejected,
      isUnderChallenge,
      canResolveChallenge,
      isAwaitingAppealRequest,
      inChallengeCommitVotePhase,
      inChallengeRevealPhase,
    } = listingPhaseState;

    if (!this.props.challenge) {
      if (isInApplication) {
        return (
          <>
            <p>Awaiting Approval</p>
          </>
        );
      } else if (isWhitelisted && !isUnderChallenge) {
        return (
          <>
            <p>Accepted into Registry</p>
          </>
        );
      } else if (!isRejected && !isInApplication && !isUnderChallenge) {
        return (
          <>
            <p>Rejected from Registry</p>
          </>
        );
      } else if (inChallengeCommitVotePhase) {
        return (
          <>
            <p>Under Challenge > Accepting Votes</p>
          </>
        );
      } else if (inChallengeRevealPhase) {
        return (
          <>
            <p>Under Challenge > Revealing Votes</p>
          </>
        );
      } else if (isAwaitingAppealRequest) {
        return (
          <>
            <p>Under Challenge > Awaiting Appeal Request</p>
          </>
        );
      } else if (canResolveChallenge) {
        return (
          <>
            <p>Under Challenge > Complete</p>
          </>
        );
      }
    } else if (challengeState) {
      if (listingPhaseState && inChallengeCommitVotePhase) {
        return (
          <PhaseCountdownTimer phaseType={PHASE_TYPE_NAMES.CHALLENGE_COMMIT_VOTE} challenge={this.props.challenge} />
        );
      }

      if (listingPhaseState && inChallengeRevealPhase) {
        return (
          <PhaseCountdownTimer phaseType={PHASE_TYPE_NAMES.CHALLENGE_REVEAL_VOTE} challenge={this.props.challenge} />
        );
      }

      if (listingPhaseState && isAwaitingAppealRequest) {
        return (
          <PhaseCountdownTimer
            phaseType={PHASE_TYPE_NAMES.CHALLENGE_AWAITING_APPEAL_REQUEST}
            challenge={this.props.challenge}
          />
        );
      }

      if (challengeState.isResolved) {
        return (
          <>
            <WinningChallengeResults challengeID={this.props.challenge.challengeID} />
          </>
        );
      }
    }

    return <></>;
  };

  private getButtonText = (): [string, string | JSX.Element | undefined] => {
    const { listingAddress, listingPhaseState, userChallengeData } = this.props;

    if (listingPhaseState && listingPhaseState.inChallengeRevealPhase && userChallengeData) {
      if (userChallengeData.didUserCommit && !userChallengeData.didUserReveal) {
        return ["Reveal Vote", undefined];
      } else {
        return ["View", "You revealed your vote"];
      }
    }

    if (listingPhaseState && listingPhaseState.canResolveChallenge) {
      return ["Resolve Challenge", undefined];
    }

    if (userChallengeData) {
      const {
        didUserCommit,
        didUserReveal,
        isVoterWinner,
        didUserCollect,
        didCollectAmount,
        didUserRescue,
      } = userChallengeData;

      if (
        listingPhaseState &&
        !listingPhaseState.isUnderChallenge &&
        didUserReveal &&
        isVoterWinner &&
        !didUserCollect
      ) {
        return ["Claim Rewards", `~${this.props.unclaimedRewardAmount} available`];
      } else if (listingPhaseState && !listingPhaseState.isUnderChallenge && didUserReveal && !isVoterWinner) {
        return ["View Results", "You did not vote for the winner"];
      } else if (
        listingPhaseState &&
        !listingPhaseState.isUnderChallenge &&
        didUserCommit &&
        !didUserReveal &&
        !didUserRescue
      ) {
        return ["Rescue Tokens", "You did not reveal your vote"];
      } else if (listingPhaseState && !listingPhaseState.isUnderChallenge && didUserRescue) {
        return ["View Results", "You rescued your tokens"];
      } else if (didUserCollect) {
        const reward = getFormattedTokenBalance(didCollectAmount!);
        return ["View Results", `You collected ${reward}`];
      }
    }

    // This is a listing
    if (!userChallengeData && listingAddress) {
      const manageNewsroomUrl = `/mgmt-v1/${this.props.listingAddress}`;
      return ["View", <Link to={manageNewsroomUrl}>Manage Newsroom</Link>];
    }

    return ["View", undefined];
  };
}

const makeMapStateToProps = () => {
  const getListing = makeGetListing();

  const mapStateToProps = (
    state: State,
    ownProps: ActivityListItemOwnProps,
  ): ActivityListItemReduxProps & ActivityListItemOwnProps => {
    const { newsrooms } = state;
    const { user } = state.networkDependent;
    const newsroom = ownProps.listingAddress ? newsrooms.get(ownProps.listingAddress) : undefined;
    const listing = getListing(state, ownProps);

    let userAcct = ownProps.user;
    if (!userAcct) {
      userAcct = user.account.account;
    }

    return {
      newsroom,
      listing,
      listingPhaseState: getListingPhaseState(listing),
      ...ownProps,
    };
  };

  return mapStateToProps;
};

export const ActivityListItem = connect(makeMapStateToProps)(ActivityListItemComponent);

const makeChallengeMapStateToProps = () => {
  const getListingAddressByChallengeID = makeGetListingAddressByChallengeID();
  const getUserChallengeData = makeGetUserChallengeData();
  const getUnclaimedRewardAmount = makeGetUnclaimedRewardAmount();

  const mapStateToProps = (state: State, ownProps: ChallengeActivityListItemOwnProps): ActivityListItemOwnProps => {
    const listingAddress = getListingAddressByChallengeID(state, ownProps);
    const challenge = getChallenge(state, ownProps);
    const userChallengeData = getUserChallengeData(state, ownProps);
    const unclaimedRewardAmountBN = getUnclaimedRewardAmount(state, ownProps);
    const challengeState = getChallengeState(challenge!);
    const { even, user } = ownProps;
    const { listingsFetching } = state.networkDependent;
    let listingDataRequestStatus;
    if (listingAddress) {
      listingDataRequestStatus = listingsFetching.get(listingAddress.toString());
    }

    let unclaimedRewardAmount = "";
    if (unclaimedRewardAmountBN) {
      unclaimedRewardAmount = getFormattedTokenBalance(unclaimedRewardAmountBN);
    }

    return {
      listingAddress,
      challenge,
      challengeState,
      userChallengeData,
      unclaimedRewardAmount,
      even,
      user,
      listingDataRequestStatus
    };
  };

  return mapStateToProps;
};

/**
 * Container that renders a listing associated with the specified `ChallengeID`
 */
export class ChallengeListingItemComponent extends React.Component<
  ChallengeActivityListItemOwnProps & ActivityListItemOwnProps
> {
  public render(): JSX.Element {
    return <ActivityListItem {...this.props} />;
  }
}

export const ChallengeActivityListItem = connect(makeChallengeMapStateToProps)(ChallengeListingItemComponent);

/**
 * Container that renders a listing associated with the specified `ChallengeID`
 */
export class ResolvedChallengeListingItemComponent extends React.Component<
  ChallengeActivityListItemOwnProps & ResolvedChallengeActivityListItemProps & ActivityListItemOwnProps
> {
  public render(): JSX.Element {
    return <ActivityListItem {...this.props} />;
  }
}

export const ResolvedChallengeActivityListItem = connect(makeChallengeMapStateToProps)(
  ResolvedChallengeListingItemComponent,
);
