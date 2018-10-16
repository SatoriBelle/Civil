import * as React from "react";
import { connect } from "react-redux";
import { Set } from "immutable";
import {
  Tabs,
  Tab,
  StyledSquarePillTabNav,
  StyledSquarePillTab,
  NewApplicationsTabTitle,
  UnderChallengeTabTitle,
  AppealToCouncilTabTitle,
  ChallengeCouncilAppealTabTitle,
  ReadyToUpdateTabTitle,
} from "@joincivil/components";

import ListingList from "./ListingList";
import { State } from "../../reducers";
import { StyledListingCopy } from "../utility/styledComponents";

export interface ListingProps {
  match?: any;
  history?: any;
}

export interface ListingReduxProps {
  applications: Set<string>;
  readyToWhitelistListings: Set<string>;
  inChallengeCommitListings: Set<string>;
  inChallengeRevealListings: Set<string>;
  awaitingAppealRequestListings: Set<string>;
  awaitingAppealJudgmentListings: Set<string>;
  awaitingAppealChallengeListings: Set<string>;
  appealChallengeCommitPhaseListings: Set<string>;
  appealChallengeRevealPhaseListings: Set<string>;
  resolveChallengeListings: Set<string>;
  resolveAppealListings: Set<string>;
}

const TABS: string[] = [
  "in-application",
  "under-challenge",
  "under-appeal",
  "under-appeal-challenge",
  "ready-to-update",
];

class ListingsInProgress extends React.Component<ListingProps & ListingReduxProps> {
  public render(): JSX.Element {
    const { subListingType } = this.props.match.params;
    let activeIndex = 0;
    if (subListingType) {
      activeIndex = TABS.indexOf(subListingType) || 0;
    }
    const applications = this.props.applications;
    const beingChallenged = this.props.inChallengeCommitListings
      .merge(this.props.inChallengeRevealListings)
      .merge(this.props.awaitingAppealRequestListings);
    const consideringAppeal = this.props.awaitingAppealJudgmentListings.merge(
      this.props.awaitingAppealChallengeListings,
    );
    const appealChallenge = this.props.appealChallengeCommitPhaseListings.merge(
      this.props.appealChallengeRevealPhaseListings,
    );
    const readyToUpdate = this.props.readyToWhitelistListings
      .merge(this.props.resolveChallengeListings)
      .merge(this.props.resolveAppealListings);

    const newApplicationsTab = <NewApplicationsTabTitle count={applications.count()} />;
    const underChallengeTab = <UnderChallengeTabTitle count={beingChallenged.count()} />;
    const appealToCouncilTab = <AppealToCouncilTabTitle count={consideringAppeal.count()} />;
    const challengeCouncilAppealTab = <ChallengeCouncilAppealTabTitle count={appealChallenge.count()} />;
    const readyToUpdateTab = <ReadyToUpdateTabTitle count={readyToUpdate.count()} />;

    return (
      <Tabs
        activeIndex={activeIndex}
        TabsNavComponent={StyledSquarePillTabNav}
        TabComponent={StyledSquarePillTab}
        onActiveTabChange={this.onTabChange}
      >
        <Tab title={newApplicationsTab}>
          <>
            <StyledListingCopy>
              New applications are subject to Civil community review for alignment with the Civil Constitution. By
              participating in our governance, you can help curate high-quality, trustworthy journalism.
            </StyledListingCopy>
            <ListingList listings={applications} />
          </>
        </Tab>
        <Tab title={underChallengeTab}>
          <>
            <StyledListingCopy>
              Applications “under challenge” require the Civil community vote to remain on the Registry due to a
              potential breach of the Civil Constitution. Help us curate high quality, trustworthy journalism, and earn
              CVL tokens when you vote.
            </StyledListingCopy>
            <ListingList listings={beingChallenged} />
          </>
        </Tab>
        <Tab title={appealToCouncilTab}>
          <>
            <StyledListingCopy>
              Appeal to the Civil Council has been granted to these Newsrooms. The Civil Council will review whether
              these Newsrooms breached the Civil Constitution, and a decision will be announced X days after the appeal
              is granted.
            </StyledListingCopy>
            <ListingList listings={consideringAppeal} />
          </>
        </Tab>
        <Tab title={challengeCouncilAppealTab}>
          <>
            <StyledListingCopy>
              Newsrooms under “Challenge Council Appeal” require the Civil community vote to veto the Council decision
              in order to remain on the Registry. Help us curate high quality, trustworthy journalism, and earn CVL
              tokens when you vote.
            </StyledListingCopy>
            <ListingList listings={appealChallenge} />
          </>
        </Tab>
        <Tab title={readyToUpdateTab}>
          <>
            <StyledListingCopy>Step 1: Resolve these challenges. Step 2: ???. Step 3: Profit!!!</StyledListingCopy>
            <ListingList listings={readyToUpdate} />
          </>
        </Tab>
      </Tabs>
    );
  }

  private onTabChange = (activeIndex: number = 0): void => {
    const tabName = this.props.match.params.listingType;
    const subTabName = TABS[activeIndex];
    this.props.history.push(`/registry/${tabName}/${subTabName}`);
  };
}

const mapStateToProps = (state: State, ownProps: ListingProps): ListingProps & ListingReduxProps => {
  const {
    applications,
    readyToWhitelistListings,
    inChallengeCommitListings,
    inChallengeRevealListings,
    awaitingAppealRequestListings,
    awaitingAppealJudgmentListings,
    awaitingAppealChallengeListings,
    appealChallengeCommitPhaseListings,
    appealChallengeRevealPhaseListings,
    resolveChallengeListings,
    resolveAppealListings,
  } = state.networkDependent;

  return {
    applications,
    readyToWhitelistListings,
    inChallengeCommitListings,
    inChallengeRevealListings,
    awaitingAppealRequestListings,
    awaitingAppealJudgmentListings,
    awaitingAppealChallengeListings,
    appealChallengeCommitPhaseListings,
    appealChallengeRevealPhaseListings,
    resolveChallengeListings,
    resolveAppealListings,
    ...ownProps,
  };
};

export default connect(mapStateToProps)(ListingsInProgress);
