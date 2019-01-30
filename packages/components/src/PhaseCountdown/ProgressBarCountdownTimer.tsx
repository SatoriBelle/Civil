import * as React from "react";
import { getLocalDateTimeStrings, getReadableDuration } from "@joincivil/utils";
import { InjectedCountdownTimerProps, ProgressBarCountdownProps } from "./types";
import {
  StyledProgressBarCountdownTimer,
  ProgressBarCountdownContainer,
  ProgressBarDisplayLabel,
  ProgressBarCountdownTotal,
  ProgressBarCountdownProgress,
  ProgressBarCopy,
  MetaItem,
  MetaItemValueAccent,
  MetaItemLabel,
} from "./styledComponents";
import { QuestionToolTip } from "../QuestionToolTip";

export class ProgressBarCountdownTimerComponent extends React.Component<
  ProgressBarCountdownProps & InjectedCountdownTimerProps
> {
  public render(): JSX.Element {
    const progress = this.getProgress();
    const style = { width: `${(progress * 100).toString()}%` };
    return (
      <StyledProgressBarCountdownTimer>
        <ProgressBarCountdownContainer>
          <ProgressBarDisplayLabel>
            {this.props.displayLabel}
            <QuestionToolTip explainerText={this.props.toolTipText} positionBottom={true} />
          </ProgressBarDisplayLabel>
          <ProgressBarCountdownTotal>
            <ProgressBarCountdownProgress style={style} />
          </ProgressBarCountdownTotal>
        </ProgressBarCountdownContainer>
        {this.renderReadableTimeRemaining()}
        {this.renderExpiry()}
      </StyledProgressBarCountdownTimer>
    );
  }

  private renderExpiry = (): JSX.Element => {
    const [expiryDateString, expiryTimeString] = this.props.endTime
      ? getLocalDateTimeStrings(parseInt(this.props.endTime.toString(), 10))
      : ["", ""];
    return (
      <ProgressBarCopy>
        Newsroom listing {this.props.secondsRemaining! > 0 ? "is" : "was"} {this.props.flavorText} until{" "}
        {expiryDateString} {expiryTimeString}
      </ProgressBarCopy>
    );
  };

  private renderReadableTimeRemaining = (): JSX.Element => {
    if (this.props.secondsRemaining! > 0) {
      return (
        <MetaItem>
          <MetaItemValueAccent>{getReadableDuration(this.props.secondsRemaining!, ["second"])}</MetaItemValueAccent>
          <MetaItemLabel>Remaining</MetaItemLabel>
        </MetaItem>
      );
    }
    return (
      <MetaItem>
        <MetaItemValueAccent>Ended</MetaItemValueAccent>
        <MetaItemLabel>&nbsp;</MetaItemLabel>
      </MetaItem>
    );
  };

  private getProgress = (): number => {
    if (this.props.secondsRemaining! > 0) {
      return 1 - this.props.secondsRemaining! / this.props.totalSeconds;
    }
    return 1;
  };
}
