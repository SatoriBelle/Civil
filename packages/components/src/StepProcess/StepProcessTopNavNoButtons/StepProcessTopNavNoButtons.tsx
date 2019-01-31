import * as React from "react";
import styled from "styled-components";
import { StepTopNavNoButtonsProps } from "./Step";
import { StepProcessTopNavState, StepsProps } from "../StepProcessTopNav";

export interface ContentProps {
  goNext?(): void;
  goPrevious?(): void;
}

const StyledNav = styled.div`
  position: relative;
  height: 76px;
  margin: 0 auto;
  width: 100%;
  & > ul {
    justify-content: space-between;
  }
`;

const StyledContainer = styled.ul`
  display: flex;
  list-style: none;
  margin: 0 auto;
  padding: 0;
`;

const MainSection = styled.div`
  background-color: #fff;
  padding: 45px 0;
`;

export class StepProcessTopNavNoButtons extends React.Component<StepsProps, StepProcessTopNavState> {
  public buttonContainer?: HTMLDivElement;
  public navContainer?: HTMLDivElement;

  constructor(props: StepsProps) {
    super(props);
    this.state = {
      activeIndex: props.activeIndex || 0,
    };
  }

  public componentDidUpdate(prevProps: StepsProps, prevState: StepProcessTopNavState): void {
    if (typeof this.props.activeIndex === "undefined") {
      return;
    }
    if (this.state.activeIndex !== prevState.activeIndex) {
      return;
    }
    if (this.props.activeIndex !== prevProps.activeIndex) {
      this.setState({ activeIndex: this.props.activeIndex });
    } else if (prevProps.activeIndex !== prevState.activeIndex && this.props.activeIndex !== this.state.activeIndex) {
      this.setState({ activeIndex: this.props.activeIndex });
    }
  }

  public renderTabs(): Array<React.ReactElement<StepTopNavNoButtonsProps>> {
    return React.Children.map(this.props.children, (child: React.ReactChild, index) => {
      return React.cloneElement(child as React.ReactElement<StepTopNavNoButtonsProps>, {
        index,
        startPosition: this.state.startPosition,
        isCurrent: this.state.activeIndex === index,
        isActive: this.state.activeIndex >= index,
        onClick: this.handleClick,
        setStartPosition: index === 0 ? this.setStartPosition : undefined,
      });
    });
  }

  public renderContent(): React.ReactNode | undefined {
    const children = this.props.children;
    const { activeIndex } = this.state;
    if (children[activeIndex]) {
      return React.cloneElement(children[activeIndex].props.children as React.ReactElement<ContentProps>, {
        goNext: this.goNext,
        goPrevious: this.goPrevious,
      });
    }
  }

  public render(): JSX.Element {
    return (
      <div>
        <StyledNav innerRef={el => (this.navContainer = el)}>
          <StyledContainer>{this.renderTabs()}</StyledContainer>
        </StyledNav>
        <MainSection>{this.renderContent()}</MainSection>
      </div>
    );
  }

  private setStartPosition = (position: number): void => {
    this.setState({ startPosition: position });
  };

  private scrollToTop = (): void => {
    if (this.navContainer) {
      this.navContainer.scrollIntoView(true);
    }
  };

  private goNext = (): void => {
    this.scrollToTop();
    const newIndex = this.state.activeIndex + 1;
    if (this.props.onActiveTabChange) {
      this.props.onActiveTabChange(newIndex);
    }
    this.setState({ activeIndex: newIndex });
  };

  private goPrevious = (): void => {
    this.scrollToTop();
    const newIndex = this.state.activeIndex - 1;
    if (this.props.onActiveTabChange) {
      this.props.onActiveTabChange(newIndex);
    }
    this.setState({ activeIndex: newIndex });
  };

  private handleClick = (index: number): void => {
    if (this.props.onActiveTabChange) {
      this.props.onActiveTabChange(index);
    }
    this.setState({ activeIndex: index });
  };
}