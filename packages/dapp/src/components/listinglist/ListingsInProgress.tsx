import * as React from "react";
import { Helmet } from "react-helmet";
import { Set } from "immutable";

import { NewsroomListing } from "@joincivil/core";
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
  ListingSummaryUnderChallengeComponent,
  ListingSummaryReadyToUpdateComponent,
} from "@joincivil/components";
import { getFormattedParameterValue, GovernmentParameters } from "@joincivil/utils";

import { getCivil } from "../../helpers/civilInstance";
import { StyledListingCopy } from "../utility/styledComponents";

import ListingList from "./ListingList";
import { EmptyRegistryTabContentComponent, REGISTRY_PHASE_TAB_TYPES } from "./EmptyRegistryTabContent";

export interface ListingProps {
  match?: any;
  history?: any;
}

export interface ListingsInProgressProps {
  applications: Set<NewsroomListing>;
  readyToWhitelistListings: Set<NewsroomListing>;
  inChallengeCommitListings: Set<NewsroomListing>;
  inChallengeRevealListings: Set<NewsroomListing>;
  awaitingAppealRequestListings: Set<NewsroomListing>;
  awaitingAppealJudgmentListings: Set<NewsroomListing>;
  awaitingAppealChallengeListings: Set<NewsroomListing>;
  appealChallengeCommitPhaseListings: Set<NewsroomListing>;
  appealChallengeRevealPhaseListings: Set<NewsroomListing>;
  resolveChallengeListings: Set<NewsroomListing>;
  resolveAppealListings: Set<NewsroomListing>;
  govtParameters: any;
}

const TABS: string[] = [
  "in-application",
  "under-challenge",
  "under-appeal",
  "under-appeal-challenge",
  "ready-to-update",
];

class ListingsInProgress extends React.Component<ListingProps & ListingsInProgressProps> {
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

    const civil = getCivil();
    const judgeAppealLenDisplay =
      this.props.govtParameters[GovernmentParameters.judgeAppealLen] &&
      getFormattedParameterValue(
        GovernmentParameters.judgeAppealLen,
        civil.toBigNumber(this.props.govtParameters[GovernmentParameters.judgeAppealLen].toString()),
      );

    return (
      <Tabs
        activeIndex={activeIndex}
        TabsNavComponent={StyledSquarePillTabNav}
        TabComponent={StyledSquarePillTab}
        onActiveTabChange={this.onTabChange}
      >
        <Tab title={newApplicationsTab}>
          <>
            <Helmet>
              <title>New Applications - The Civil Registry</title>
            </Helmet>
            <StyledListingCopy>
              New applications are subject to Civil community review for alignment with the Civil Constitution. By
              participating in our governance, you can help curate high-quality, trustworthy journalism.
            </StyledListingCopy>
            {this.renderApplications()}
          </>
        </Tab>
        <Tab title={underChallengeTab}>
          <>
            <Helmet>
              <title>Newsrooms Under Challenge - The Civil Registry</title>
            </Helmet>

            <StyledListingCopy>
              Applications “under challenge” require the Civil community's vote to remain on the Registry due to a
              potential breach of the Civil Constitution. Help us curate high quality, trustworthy journalism, and earn
              CVL tokens when you vote.
            </StyledListingCopy>
            {this.renderUnderChallenge()}
          </>
        </Tab>
        <Tab title={appealToCouncilTab}>
          <>
            <Helmet>
              <title>Newsrooms Under Appeal - The Civil Registry</title>
            </Helmet>
            <StyledListingCopy>
              Appeal to the Civil Council has been requested for these Newsrooms. The Civil Council will review whether
              these Newsrooms breached the Civil Constitution, and a decision will be announced {judgeAppealLenDisplay}{" "}
              after the appeal is requested.
            </StyledListingCopy>
            {this.renderUnderAppeal()}
          </>
        </Tab>
        <Tab title={challengeCouncilAppealTab}>
          <>
            <Helmet>
              <title>Newsrooms Under Appeal Challenge - The Civil Registry</title>
            </Helmet>
            <StyledListingCopy>
              Newsrooms under “Challenge Council Appeal” have been granted appeals by the Civil Council, which can be
              challenged and subsequently vetoed by the Civil community's vote. Help us curate high quality, trustworthy
              journalism, and earn CVL tokens when you vote.
            </StyledListingCopy>
            {this.renderUnderAppealChallenge()}
          </>
        </Tab>
        <Tab title={readyToUpdateTab}>
          <>
            <Helmet>
              <title>Newsrooms Ready To Update - The Civil Registry</title>
            </Helmet>
            <StyledListingCopy>
              The Civil community has spoken and the vote results are in. However, in order for the decision to take
              effect, the status of the newsroom must be updated. Thank you for helping the community curate
              high-quality, trustworthy journalism.{" "}
            </StyledListingCopy>
            {this.renderReadyToUpdate()}
          </>
        </Tab>
      </Tabs>
    );
  }

  private renderApplications = (): JSX.Element => {
    if (this.props.applications.count()) {
      return (
        <ListingList ListingItemComponent={ListingSummaryUnderChallengeComponent} listings={this.props.applications} />
      );
    }

    return <EmptyRegistryTabContentComponent phaseTabType={REGISTRY_PHASE_TAB_TYPES.IN_APPLICATION} />;
  };

  private renderUnderChallenge = (): JSX.Element => {
    const beingChallenged = this.props.inChallengeCommitListings
      .merge(this.props.inChallengeRevealListings)
      .merge(this.props.awaitingAppealRequestListings);

    if (beingChallenged.count()) {
      return <ListingList ListingItemComponent={ListingSummaryUnderChallengeComponent} listings={beingChallenged} />;
    }

    return <EmptyRegistryTabContentComponent phaseTabType={REGISTRY_PHASE_TAB_TYPES.UNDER_CHALLENGE} />;
  };

  private renderUnderAppeal = (): JSX.Element => {
    const consideringAppeal = this.props.awaitingAppealJudgmentListings.merge(
      this.props.awaitingAppealChallengeListings,
    );

    if (consideringAppeal.count()) {
      return <ListingList ListingItemComponent={ListingSummaryUnderChallengeComponent} listings={consideringAppeal} />;
    }

    return <EmptyRegistryTabContentComponent phaseTabType={REGISTRY_PHASE_TAB_TYPES.UNDER_APPEAL} />;
  };

  private renderUnderAppealChallenge = (): JSX.Element => {
    const appealChallenge = this.props.appealChallengeCommitPhaseListings.merge(
      this.props.appealChallengeRevealPhaseListings,
    );

    if (appealChallenge.count()) {
      return <ListingList ListingItemComponent={ListingSummaryUnderChallengeComponent} listings={appealChallenge} />;
    }

    return <EmptyRegistryTabContentComponent phaseTabType={REGISTRY_PHASE_TAB_TYPES.UNDER_APPEAL_CHALLENGE} />;
  };

  private renderReadyToUpdate = (): JSX.Element => {
    const readyToUpdate = this.props.readyToWhitelistListings
      .merge(this.props.resolveChallengeListings)
      .merge(this.props.resolveAppealListings);

    if (readyToUpdate.count()) {
      return <ListingList ListingItemComponent={ListingSummaryReadyToUpdateComponent} listings={readyToUpdate} />;
    }

    return <EmptyRegistryTabContentComponent phaseTabType={REGISTRY_PHASE_TAB_TYPES.READY_TO_UPDATE} />;
  };

  private onTabChange = (activeIndex: number = 0): void => {
    const tabName = this.props.match.params.listingType;
    const subTabName = TABS[activeIndex];
    this.props.history.push(`/registry/${tabName}/${subTabName}`);
  };
}

export default ListingsInProgress;
