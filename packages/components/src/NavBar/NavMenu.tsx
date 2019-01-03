import * as React from "react";
import * as ReactDOM from "react-dom";

import { NavMenuState } from "./types";
import {
  NavAccent,
  StyledNavMenuContainer,
  StyledNavMenuResponsiveContainer,
  StyledMobileNavMenu,
  StyledVisibleIfLoggedInLink,
} from "./styledComponents";
import {
  NavLinkRegistryText,
  NavLinkParameterizerText,
  NavLinkCreateNewsroomText,
  NavLinkConstitutionText,
  NavLinkAboutText,
  NavLinkLaunchNewsroomText,
  NavLinkWhitePaperText,
  NavLinkDashboardText,
} from "./textComponents";
import { NavLink } from "./NavLink";
import { NavDropDown } from "./NavDropDown";
import { NavMenuResponsiveToggleButton } from "./NavMenuResponsiveToggleButton";

export interface NavMenuLinksComponentProps {
  isLoggedIn: boolean;
}

const NavMenuLinksComponent: React.SFC<NavMenuLinksComponentProps> = props => {
  return (
    <>
      <NavLink to="/registry">
        <NavLinkRegistryText />
      </NavLink>
      <NavLink to="/parameterizer">
        <NavLinkParameterizerText />
      </NavLink>
      <NavLink to="/createNewsroom">
        <NavLinkCreateNewsroomText />
      </NavLink>
      <NavDropDown label="How Civil works">
        <NavLink href="https://civil.co/constitution/" target="_blank">
          <NavLinkConstitutionText />
        </NavLink>
        <NavLink href="https://civil.co/about/" target="_blank">
          <NavLinkAboutText />
        </NavLink>
        <NavLink href="https://civil.co/how-to-launch-newsroom/" target="_blank">
          <NavLinkLaunchNewsroomText />
        </NavLink>
        <NavLink href="https://civil.co/white-paper/" target="_blank">
          <NavLinkWhitePaperText />
        </NavLink>
      </NavDropDown>
      <StyledVisibleIfLoggedInLink>
        {props.isLoggedIn && (
          <NavAccent>
            <NavLink to="/dashboard">
              <NavLinkDashboardText />
            </NavLink>
          </NavAccent>
        )}
      </StyledVisibleIfLoggedInLink>
    </>
  );
};

class NavMenuResponsiveDrawer extends React.Component<NavMenuState & NavMenuLinksComponentProps> {
  public bucket: HTMLDivElement = document.createElement("div");

  public componentDidMount(): void {
    document.body.appendChild(this.bucket);
  }

  public componentWillUnmount(): void {
    document.body.removeChild(this.bucket);
  }

  public render(): React.ReactPortal | null {
    if (!this.props.isResponsiveDrawerOpen) {
      return null;
    }

    const mobileNavMenu = (
      <>
        <StyledMobileNavMenu>
          <NavMenuLinksComponent {...this.props} />
        </StyledMobileNavMenu>
      </>
    );

    return ReactDOM.createPortal(mobileNavMenu, this.bucket);
  }
}

export class NavMenu extends React.Component<NavMenuLinksComponentProps, NavMenuState> {
  constructor(props: NavMenuLinksComponentProps) {
    super(props);
    this.state = {
      isResponsiveDrawerOpen: false,
    };
  }

  public render(): JSX.Element {
    return (
      <>
        <StyledNavMenuContainer>
          <NavMenuLinksComponent isLoggedIn={this.props.isLoggedIn} />
        </StyledNavMenuContainer>
        <NavMenuResponsiveToggleButton
          isResponsiveDrawerOpen={this.state.isResponsiveDrawerOpen}
          onClick={() => this.toggleResponsiveMenuDrawer()}
        />
        <StyledNavMenuResponsiveContainer>
          <NavMenuResponsiveDrawer
            isResponsiveDrawerOpen={this.state.isResponsiveDrawerOpen}
            isLoggedIn={this.props.isLoggedIn}
          />
        </StyledNavMenuResponsiveContainer>
      </>
    );
  }

  private toggleResponsiveMenuDrawer = (): void => {
    this.setState({ isResponsiveDrawerOpen: !this.state.isResponsiveDrawerOpen });
  };
}
