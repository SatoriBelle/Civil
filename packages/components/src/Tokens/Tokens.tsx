import * as React from "react";
import {
  TokenAccountOuter,
  TokenAccountInner,
  FlexColumns,
  FlexColumnsPrimary,
  FlexColumnsPrimaryModule,
  FlexColumnsSecondary,
  FlexColumnsSecondaryModule,
} from "./TokensStyledComponents";
import { UserTokenAccountHeader } from "./TokensAccountHeader";
import { UserTokenAccountSignup } from "./TokensAccountSignup";
import { UserTokenAccountVerify } from "./TokensAccountVerify";
import { UserTokenAccountBuy } from "./TokensAccountBuy";
import { UserTokenAccountHelp } from "./TokensAccountHelp";

export interface UserTokenAccountStates {
  isTutorialModalOpen: boolean;
}

export class UserTokenAccount extends React.Component<{}, UserTokenAccountStates> {
  constructor(props: any) {
    super(props);
    this.state = {
      isTutorialModalOpen: false,
    };
  }

  public render(): JSX.Element | null {
    return (
      <TokenAccountOuter>
        <TokenAccountInner>
          <UserTokenAccountHeader />
          <FlexColumns>
            <FlexColumnsPrimary>
              <FlexColumnsPrimaryModule>
                <UserTokenAccountSignup step={"completed"} />
              </FlexColumnsPrimaryModule>
              <FlexColumnsPrimaryModule>
                <UserTokenAccountVerify
                  step={"active"}
                  open={this.state.isTutorialModalOpen}
                  handleClose={this.closeTutorialModal}
                  handleOpen={this.openTutorialModal}
                />
              </FlexColumnsPrimaryModule>
              <FlexColumnsPrimaryModule>
                <UserTokenAccountBuy openAirSwap={this.openAirSwap} step={"active"} />
              </FlexColumnsPrimaryModule>
            </FlexColumnsPrimary>
            <FlexColumnsSecondary>
              <FlexColumnsSecondaryModule>
                <UserTokenAccountHelp />
              </FlexColumnsSecondaryModule>
            </FlexColumnsSecondary>
          </FlexColumns>
        </TokenAccountInner>
      </TokenAccountOuter>
    );
  }

  private openTutorialModal = () => {
    this.setState({ isTutorialModalOpen: true });
  };

  private closeTutorialModal = () => {
    this.setState({ isTutorialModalOpen: false });
  };

  private openAirSwap = () => {
    this.setState({ isTutorialModalOpen: false });
  };
}
