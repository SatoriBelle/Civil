import {
  ButtonTheme,
  colors,
  StepProcessTopNavNoButtons,
  StepNoButtons,
  WalletOnboardingV2,
  AuthApplicationEnum,
  DEFAULT_BUTTON_THEME,
  DEFAULT_CHECKBOX_THEME,
} from "@joincivil/components";
import { Civil, EthAddress, TxHash, CharterData } from "@joincivil/core";
import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { debounce } from "lodash";
import styled, { StyledComponentClass, ThemeProvider } from "styled-components";
import {
  addGetCmsUserDataForAddress,
  addPersistCharter,
  updateNewsroom,
  getEditors,
  getIsOwner,
  getIsEditor,
  getNewsroom,
  updateCharter,
  addConstitutionHash,
  addConstitutionUri,
  fetchConstitution,
} from "./actionCreators";
import { AuthWrapper } from "./AuthWrapper";
import { DataWrapper } from "./DataWrapper";
import { NewsroomProfile } from "./NewsroomProfile";
import { SmartContract } from "./SmartContract";
import { CivilContext } from "./CivilContext";
// import { CompleteYourProfile } from "./CompleteYourProfile";
// import { NameAndAddress } from "./NameAndAddress";
import { StateWithNewsroom } from "./reducers";
import { CmsUserData } from "./types";

enum SECTION {
  PROFILE,
  CONTRACT,
  TUTORIAL,
  TOKENS,
  APPLY,
}
export enum STEP {
  PROFILE_BIO,
  PROFILE_ROSTER,
  PROFILE_CHARTER,
  PROFILE_SIGN,
  PROFILE_SO_FAR,
  PROFILE_GRANT,
  CONTRACT_GET_STARTED,
  CONTRACT_UNDERSTANDING_ETH,
  CONTRACT_CREATE,
  CONTRACT_ASSIGN,
  TUTORIAL,
  TOKENS,
  APPLY,
}
const STEP_TO_SECTION = {
  [STEP.PROFILE_BIO]: SECTION.PROFILE,
  [STEP.PROFILE_ROSTER]: SECTION.PROFILE,
  [STEP.PROFILE_CHARTER]: SECTION.PROFILE,
  [STEP.PROFILE_SIGN]: SECTION.PROFILE,
  [STEP.PROFILE_SO_FAR]: SECTION.PROFILE,
  [STEP.PROFILE_GRANT]: SECTION.PROFILE,
  [STEP.CONTRACT_GET_STARTED]: SECTION.CONTRACT,
  [STEP.CONTRACT_UNDERSTANDING_ETH]: SECTION.CONTRACT,
  [STEP.CONTRACT_CREATE]: SECTION.CONTRACT,
  [STEP.CONTRACT_ASSIGN]: SECTION.CONTRACT,
  [STEP.TUTORIAL]: SECTION.TUTORIAL,
  [STEP.TOKENS]: SECTION.TOKENS,
  [STEP.APPLY]: SECTION.APPLY,
};
const SECTION_STARTS = {
  [SECTION.PROFILE]: 0,
  [SECTION.CONTRACT]: 6,
  [SECTION.TUTORIAL]: 10,
  [SECTION.TOKENS]: 11,
  [SECTION.APPLY]: 12,
};

export interface NewsroomComponentState {
  currentStep: STEP;
  subscription?: any;
  charterPartOneComplete?: boolean;
  charterPartTwoComplete?: boolean;
  hasPublishedCharter?: boolean;
}

export interface IpfsObject {
  add(content: any, options?: { hash: string; pin: boolean }): Promise<[{ path: string; hash: string; size: number }]>;
}

export interface NewsroomExternalProps {
  address?: EthAddress;
  txHash?: TxHash;
  disabled?: boolean;
  account?: string;
  currentNetwork?: string;
  requiredNetwork?: string;
  requiredNetworkNiceName?: string;
  civil?: Civil;
  ipfs?: IpfsObject;
  theme?: ButtonTheme;
  showWelcome?: boolean;
  helpUrl?: string;
  helpUrlBase?: string;
  newsroomUrl?: string;
  logoUrl?: string;
  renderUserSearch?(onSetAddress: any): JSX.Element;
  onNewsroomCreated?(address: EthAddress): void;
  onContractDeployStarted?(txHash: TxHash): void;
  getCmsUserDataForAddress?(address: EthAddress): Promise<CmsUserData>;
}

export interface NewsroomPropsWithRedux extends NewsroomExternalProps {
  charter: Partial<CharterData>;
  // owners: string[];
  // editors: string[];
  name?: string;
  newsroom?: any;
  userIsOwner?: boolean;
  userIsEditor?: boolean;
  userNotOnContract?: boolean;
  charterUri?: string;
}

// Final props are from GQL
export interface NewsroomProps extends NewsroomPropsWithRedux {
  grantRequested?: boolean;
  grantApproved?: boolean;
  profileWalletAddress?: EthAddress;
  persistedCharter?: Partial<CharterData>;
  persistCharter(charter: Partial<CharterData>): Promise<any>;
}

export const NoteSection: StyledComponentClass<any, "p"> = styled.p`
  color: ${(props: { disabled: boolean }) => (props.disabled ? "#dcdcdc" : colors.accent.CIVIL_GRAY_3)};
`;

export const Wrapper: StyledComponentClass<any, "div"> = styled.div`
  max-width: 845px;
  margin: auto;
  font-size: 14px;
`;

const ErrorP = styled.p`
  color: ${colors.accent.CIVIL_RED};
`;

class NewsroomComponent extends React.Component<NewsroomProps & DispatchProp<any>, NewsroomComponentState> {
  public static defaultProps = {
    theme: {
      ...DEFAULT_BUTTON_THEME,
      ...DEFAULT_CHECKBOX_THEME,
      primaryButtonTextTransform: "none",
      primaryButtonFontWeight: "bold",
      borderlessButtonSize: "14px",
    },
  };

  public static getDerivedStateFromProps(
    props: NewsroomProps,
    state: NewsroomComponentState,
  ): NewsroomComponentState | null {
    // @TODO/toby Confirm that when grant is rejected, it comes through as explicit `false` and not null or undefined
    const waitingOnGrant = props.grantRequested && typeof props.grantApproved !== "boolean";
    if (state.currentStep === STEP.PROFILE_GRANT && !waitingOnGrant) {
      return {
        ...state,
        currentStep: state.currentStep + 1,
      };
    }
    return null;
  }

  private debouncedPersistCharter = debounce(this.props.persistCharter, 1000, { maxWait: 5000 });

  private checkCharterCompletion = debounce(
    () => {
      const charterPartOneComplete = !!(
        this.props.charter &&
        this.props.charter.logoUrl &&
        this.props.charter.newsroomUrl &&
        this.props.charter.tagline &&
        this.props.charter.roster &&
        this.props.charter.roster.length
      );

      let charterPartTwoComplete = false;
      const mission = this.props.charter.mission;
      if (mission) {
        charterPartTwoComplete = !!(
          mission.purpose &&
          mission.structure &&
          mission.revenue &&
          mission.encumbrances &&
          mission.miscellaneous
        );
      }

      this.setState({
        charterPartOneComplete,
        charterPartTwoComplete,
      });
    },
    1000,
    { maxWait: 2000 },
  );

  constructor(props: NewsroomProps) {
    super(props);
    let currentStep = props.address ? SECTION_STARTS[SECTION.CONTRACT] : STEP.PROFILE_SO_FAR;
    try {
      if (localStorage.newsroomOnBoardingLastSeen) {
        currentStep = Number(localStorage.newsroomOnBoardingLastSeen);
      }
    } catch (e) {
      console.error("Failed to load step index", e);
    }

    this.state = {
      currentStep,
    };
  }

  public async componentDidMount(): Promise<void> {
    if (this.props.getCmsUserDataForAddress) {
      this.props.dispatch!(addGetCmsUserDataForAddress(this.props.getCmsUserDataForAddress));
    }

    this.props.dispatch!(addPersistCharter(this.debouncedPersistCharter));
    this.initCharter();

    if (this.props.civil) {
      if (this.props.address) {
        await this.hydrateNewsroom(this.props.address);
      }

      const tcr = await this.props.civil.tcrSingletonTrusted();
      const government = await tcr.getGovernment();
      const hash = await government.getConstitutionHash();
      const uri = await government.getConstitutionURI();
      this.props.dispatch!(addConstitutionHash(hash));
      this.props.dispatch!(addConstitutionUri(uri));
      this.props.dispatch!(fetchConstitution(uri));
    }
  }

  public async componentDidUpdate(prevProps: NewsroomProps & DispatchProp<any>): Promise<void> {
    if (this.props.address && !prevProps.address) {
      await this.hydrateNewsroom(this.props.address);
    }
    if (prevProps.newsroom && this.props.account !== prevProps.account) {
      this.setRoles(this.props.address || prevProps.address!);
    }
  }

  public renderManager(): JSX.Element {
    return (
      <>
        {this.props.userNotOnContract && (
          <ErrorP>
            Your wallet address is not listed on your newsroom contract, so you are unable to make changes to it. Please
            contact a newsroom officer in order to be added.
          </ErrorP>
        )}
        <CivilContext.Provider
          value={{
            civil: this.props.civil,
            currentNetwork: this.props.currentNetwork,
            requiredNetwork: this.props.requiredNetwork || "rinkeby|ganache",
            account: this.props.account,
          }}
        >
          <StepProcessTopNavNoButtons
            activeIndex={STEP_TO_SECTION[this.state.currentStep]}
            onActiveTabChange={this.navigateToSection}
          >
            {this.renderSteps()}
          </StepProcessTopNavNoButtons>
        </CivilContext.Provider>
      </>
    );
  }

  public renderSteps(): JSX.Element[] {
    return [
      <StepNoButtons title={"Registry Profile"} complete={this.state.charterPartOneComplete} key="createCharterPartOne">
        <NewsroomProfile
          currentStep={this.state.currentStep - SECTION_STARTS[SECTION.PROFILE]}
          navigate={this.navigate}
          grantRequested={this.props.grantRequested}
          grantApproved={this.props.grantApproved}
          charter={this.props.charter}
          updateCharter={this.updateCharter}
        />
      </StepNoButtons>,
      <StepNoButtons title={"Smart Contract"} key="smartcontract">
        <SmartContract
          currentStep={this.state.currentStep - SECTION_STARTS[SECTION.CONTRACT]}
          navigate={this.navigate}
          profileWalletAddress={this.props.profileWalletAddress}
          charter={this.props.charter}
        />
      </StepNoButtons>,
      <StepNoButtons title={"Tutorial"} disabled={true} key="tutorial">
        <div />
      </StepNoButtons>,
      <StepNoButtons title={"Civil Tokens"} disabled={true} key="ct">
        <div />
      </StepNoButtons>,
      <StepNoButtons title={"Apply to Registry"} disabled={true} key="atr">
        <div />
      </StepNoButtons>,
    ];
  }

  public render(): JSX.Element {
    return (
      <ThemeProvider theme={this.props.theme}>
        <Wrapper>
          <WalletOnboardingV2
            civil={this.props.civil}
            wrongNetwork={!!this.props.requiredNetwork && this.props.currentNetwork !== this.props.requiredNetwork}
            requiredNetworkNiceName={this.props.requiredNetworkNiceName || this.props.requiredNetwork}
            metamaskWalletAddress={this.props.account}
            profileWalletAddress={this.props.profileWalletAddress}
            authApplicationType={AuthApplicationEnum.NEWSROOM}
          >
            {this.renderManager()}
          </WalletOnboardingV2>
        </Wrapper>
      </ThemeProvider>
    );
  }

  public onNewsroomCreated = async (result: any) => {
    await this.props.dispatch!(
      updateNewsroom(result.address, {
        wrapper: await result.getNewsroomWrapper(),
        newsroom: result,
      }),
    );
    if (this.props.onNewsroomCreated) {
      this.props.onNewsroomCreated(result.address);
    }
  };

  private navigateToSection = (newSection: SECTION): void => {
    if (newSection === STEP_TO_SECTION[this.state.currentStep]) {
      // Already on this section
      return;
    }

    let newStep = SECTION_STARTS[newSection]; // Go to first step in that section
    if (newSection === SECTION.PROFILE) {
      newStep = STEP.PROFILE_SO_FAR; // For this section, makes more sense to go to "your profile so far" step
    }

    this.saveStep(newStep);
    this.setState({ currentStep: newStep });
  };
  private navigate = (go: 1 | -1): void => {
    this.saveStep(this.state.currentStep + go);
    this.setState({ currentStep: this.state.currentStep + go });
  };
  private saveStep(step: STEP): void {
    try {
      localStorage.newsroomOnBoardingLastSeen = JSON.stringify(step);
    } catch (e) {
      console.error("Failed to save step index", e);
    }
  }

  private initCharter(): void {
    this.updateCharter(this.defaultCharterValues(this.props.persistedCharter || {}));
  }

  private hydrateNewsroom = async (address: EthAddress): Promise<void> => {
    await this.props.dispatch!(getNewsroom(address, this.props.civil!));
    this.props.dispatch!(getEditors(address, this.props.civil!));
    this.setRoles(address);
  };

  private setRoles = (address: EthAddress): void => {
    this.props.dispatch!(getIsOwner(address, this.props.civil!));
    this.props.dispatch!(getIsEditor(address, this.props.civil!));
  };

  private updateCharter = (charter: Partial<CharterData>): void => {
    this.props.dispatch!(updateCharter(this.props.address || "", charter));
    this.checkCharterCompletion();
  };

  /** Replace even empty string values for newsroom/logo URLs in case user has partially filled charter and later goes in to CMS and sets these values. */
  private defaultCharterValues = (charter: Partial<CharterData>): Partial<CharterData> => {
    const { newsroomUrl, logoUrl } = this.props;
    return {
      ...charter,
      newsroomUrl: charter.newsroomUrl || newsroomUrl,
      logoUrl: charter.logoUrl || logoUrl,
    };
  };
}

const mapStateToProps = (state: StateWithNewsroom, ownProps: NewsroomExternalProps): NewsroomPropsWithRedux => {
  const { address } = ownProps;
  const newsroom = state.newsrooms.get(address || "") || { wrapper: { data: {} } };
  // const userIsOwner = newsroom.isOwner;
  // const userIsEditor = newsroom.isEditor;
  // const userNotOnContract = !!ownProps.address && userIsOwner === false && userIsEditor === false;
  // const editors = newsroom.editors ? newsroom.editors.toArray() : [];

  // const charterUri = newsroom.wrapper.data.charterHeader && newsroom.wrapper.data.charterHeader.uri;
  return {
    ...ownProps,
    // charterUri,
    newsroom: newsroom.newsroom,
    // name: newsroom.wrapper.data.name,
    // userIsOwner,
    // userIsEditor,
    // userNotOnContract,
    // owners: newsroom.wrapper.data.owners || [],
    // editors,
    charter: newsroom.charter || {},
  };
};

const NewsroomWithGqlData: React.SFC<NewsroomPropsWithRedux> = props => {
  return (
    <AuthWrapper>
      <DataWrapper>
        {({ profileWalletAddress, persistedCharter, persistCharter, grantRequested, grantApproved }) => {
          return (
            <NewsroomComponent
              {...props}
              profileWalletAddress={profileWalletAddress}
              persistCharter={persistCharter}
              persistedCharter={persistedCharter}
              grantRequested={grantRequested}
              grantApproved={grantApproved}
            />
          );
        }}
      </DataWrapper>
    </AuthWrapper>
  );
};

export const Newsroom = connect(mapStateToProps)(NewsroomWithGqlData);
