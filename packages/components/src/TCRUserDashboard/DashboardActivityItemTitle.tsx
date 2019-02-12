import * as React from "react";
import { Link } from "react-router-dom";

import { DashboardActivityItemBaseProps, DashboardActivityItemTitleProps } from "./DashboardTypes";
import { StyledDashboardActivityItemTitle } from "./styledComponents";

const DashboardActivityItemTitle: React.SFC<
  DashboardActivityItemBaseProps & DashboardActivityItemTitleProps
> = props => {
  const titleChild = props.viewDetailURL ? <Link to={props.viewDetailURL}>{props.title}</Link> : props.title;
  return <StyledDashboardActivityItemTitle>{titleChild}</StyledDashboardActivityItemTitle>;
};

export default DashboardActivityItemTitle;
