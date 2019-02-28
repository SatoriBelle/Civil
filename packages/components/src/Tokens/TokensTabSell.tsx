import * as React from "react";
import { TokensTabSellActive } from "./TokensTabSellActive";
import { TokensTabSellComplete } from "./TokensTabSellComplete";
import { TokensTabSellUnlock } from "./TokensTabSellUnlock";
import { ComingSoon } from "./TokensStyledComponents";

export interface TokensTabSellProps {
  network: string;
}

export interface TokensTabSellStates {
  isSellComplete: boolean;
}

export class TokensTabSell extends React.Component<TokensTabSellProps, TokensTabSellStates> {
  public constructor(props: TokensTabSellProps) {
    super(props);
    this.state = {
      isSellComplete: false,
    };
  }

  public render(): JSX.Element | null {
    const { network } = this.props;
    const { isSellComplete } = this.state;

    // TODO(sarah): temporary messaging while waiting on market maker
    const comingSoon = true;
    if (comingSoon) {
      return (
        <ComingSoon>
          <h3>Coming Soon...</h3>
          <p>
            We appreciate your patience while we are testing this feature.<br />You will be notified when it’s ready. If
            you need help or have questions, please contact our support team at{" "}
            <a href="mailto:support@civil.co">support@civil.co</a>.
          </p>
        </ComingSoon>
      );
    }

    // TODO(sarah): check token controller.
    const isTokenUnlocked = true;

    if (!isTokenUnlocked) {
      return <TokensTabSellUnlock />;
    } else if (isSellComplete) {
      return <TokensTabSellComplete />;
    }

    return <TokensTabSellActive network={network} onSellComplete={this.onSellComplete} />;
  }

  private onSellComplete = () => {
    this.setState({ isSellComplete: true });
  };
}
