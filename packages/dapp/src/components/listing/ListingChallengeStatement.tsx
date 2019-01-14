import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import * as sanitizeHtml from "sanitize-html";
import styled from "styled-components";
import { State } from "../../redux/reducers";
import { ListingTabHeading } from "./styledComponents";
import { getChallengeByListingAddress } from "../../selectors";
import { NewsroomWrapper, ListingWrapper } from "@joincivil/core";
import { getBareContent } from "../../redux/actionCreators/newsrooms";

const StyledChallengeStatementComponent = styled.div`
  margin: 0 0 56px;
`;

const StyledChallengeStatementSection = styled.div`
  margin: 0 0 24px;
`;

export interface ListingChallengeStatementProps {
  listingAddress: string;
  newsroom?: NewsroomWrapper;
  listing?: ListingWrapper;
}

export interface ListingChallengeStatementReduxProps {
  appealStatement: any;
  challengeStatement?: any;
  appealChallengeStatement?: any;
}

class ListingChallengeStatement extends React.Component<
  ListingChallengeStatementProps & ListingChallengeStatementReduxProps & DispatchProp<any>
> {
  constructor(props: ListingChallengeStatementProps & ListingChallengeStatementReduxProps & DispatchProp<any>) {
    super(props);
  }
  public async componentDidMount(): Promise<void> {
    await this.getContents();
  }

  public async componentDidUpdate(
    prevProps: ListingChallengeStatementProps & ListingChallengeStatementReduxProps,
  ): Promise<void> {
    if (prevProps.listing !== this.props.listing) {
      await this.getContents();
    }
  }

  public render(): JSX.Element {
    return (
      <>
        {this.renderChallengeStatement()}
        {this.renderAppealStatement()}
        {this.renderAppealChallengeStatement()}
      </>
    );
  }

  private async getContents(): Promise<void> {
    const { listing } = this.props;
    if (listing && listing.data.challenge) {
      this.props.dispatch!(await getBareContent(listing.data.challenge.challengeStatementURI!));
      const { challenge } = listing.data;
      if (challenge.appeal) {
        this.props.dispatch!(await getBareContent(challenge.appeal.appealStatementURI!));
      }
    }
  }

  private renderAppealStatement = (): JSX.Element => {
    if (!this.props.appealStatement) {
      return <></>;
    }
    const parsed = JSON.parse(this.props.appealStatement);
    const summary = parsed.summary;
    const cleanDetails = sanitizeHtml(parsed.details, {
      allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(["bzz"]),
    });
    return (
      <StyledChallengeStatementComponent>
        <ListingTabHeading>The Civil Council is reviewing a requested appeal.</ListingTabHeading>
        <p>Should the Civil Council overturn this challenge result?</p>
        <ListingTabHeading>Appeal Statement</ListingTabHeading>
        <StyledChallengeStatementSection>
          <b>Summary</b>
          <div>{summary}</div>
        </StyledChallengeStatementSection>
        <StyledChallengeStatementSection>
          <b>Additional Details</b>
          <div dangerouslySetInnerHTML={{ __html: cleanDetails }} />
        </StyledChallengeStatementSection>
      </StyledChallengeStatementComponent>
    );
  };

  private renderChallengeStatement = (): JSX.Element => {
    if (!this.props.challengeStatement) {
      return <></>;
    }
    const parsed = JSON.parse(this.props.challengeStatement);
    const summary = parsed.summary || "";
    const cleanCiteConstitution = parsed.citeConstitution
      ? sanitizeHtml(parsed.citeConstitution, {
          allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(["bzz"]),
        })
      : "";
    const cleanDetails = parsed.details
      ? sanitizeHtml(parsed.details, {
          allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(["bzz"]),
        })
      : "";
    return (
      <StyledChallengeStatementComponent>
        <ListingTabHeading>Newsroom listing is under challenge</ListingTabHeading>
        <p>
          Should this newsroom stay on the Civil Registry? Read the challenger’s statement below and vote with your CVL
          tokens.
        </p>
        <ListingTabHeading>Challenge Statement</ListingTabHeading>
        <StyledChallengeStatementSection>
          <b>Summary</b>
          <div>{summary}</div>
        </StyledChallengeStatementSection>
        <StyledChallengeStatementSection>
          <b>Evidence From Civil Constitution</b>
          <div dangerouslySetInnerHTML={{ __html: cleanCiteConstitution }} />
        </StyledChallengeStatementSection>
        <StyledChallengeStatementSection>
          <b>Additional Details</b>
          <div dangerouslySetInnerHTML={{ __html: cleanDetails }} />
        </StyledChallengeStatementSection>
      </StyledChallengeStatementComponent>
    );
  };

  private renderAppealChallengeStatement = (): JSX.Element => {
    if (!this.props.appealChallengeStatement) {
      return <></>;
    }
    const parsed = JSON.parse(this.props.appealChallengeStatement);
    const summary = parsed.summary || "";
    const cleanDetails = parsed.details
      ? sanitizeHtml(parsed.details, {
          allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(["bzz"]),
        })
      : "";
    return (
      <StyledChallengeStatementComponent>
        <ListingTabHeading>Newsroom listing is under challenge</ListingTabHeading>
        <p>
          Should the granted appeal be overturned? Read the challenger’s statement below and vote with your CVL tokens.
        </p>
        <ListingTabHeading>Appeal Challenge Statement</ListingTabHeading>
        <StyledChallengeStatementSection>
          <b>Summary</b>
          <div>{summary}</div>
        </StyledChallengeStatementSection>
        <StyledChallengeStatementSection>
          <b>Additional Details</b>
          <div dangerouslySetInnerHTML={{ __html: cleanDetails }} />
        </StyledChallengeStatementSection>
      </StyledChallengeStatementComponent>
    );
  };
}

const mapToStateToProps = (
  state: State,
  ownProps: ListingChallengeStatementProps,
): ListingChallengeStatementProps & ListingChallengeStatementReduxProps => {
  const challenge = getChallengeByListingAddress(state, ownProps);
  const { content } = state.networkDependent;
  let challengeStatement: any = "";
  let appealStatement: any = "";
  let appealChallengeStatement: any = "";
  if (challenge) {
    challengeStatement = content.get(challenge.challenge.challengeStatementURI!);

    if (challenge.challenge.appeal) {
      appealStatement = content.get(challenge.challenge.appeal.appealStatementURI!);

      if (challenge.challenge.appeal.appealChallenge) {
        appealChallengeStatement = content.get(challenge.challenge.appeal.appealChallenge.appealChallengeStatementURI!);
      }
    }
  }
  return {
    ...ownProps,
    challengeStatement,
    appealStatement,
    appealChallengeStatement,
  };
};

export default connect(mapToStateToProps)(ListingChallengeStatement);
