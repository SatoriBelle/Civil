import * as React from "react";
import { connect } from "react-redux";
import { State } from "../../redux/reducers";
import { makeGetLatestWhitelistedTimestamp } from "../../selectors";
import { ListingListItemOwnProps, ListingListItemReduxProps, ListingItemBaseComponent } from "./ListingListItem";

export interface WhitelistedCardReduxProps {
  whitelistedTimestamp?: number;
}

const WhitelistedListingItem: React.SFC<
  ListingListItemOwnProps & ListingListItemReduxProps & WhitelistedCardReduxProps
> = props => {
  const listingDetailURL = `/listing/${props.listingAddress}`;
  const newProps = {
    whitelistedTimestamp: props.whitelistedTimestamp,
    listingDetailURL,
  };
  return <ListingItemBaseComponent {...props} {...newProps} />;
};

const makeMapStateToProps = () => {
  const getLatestWhitelistedTimestamp = makeGetLatestWhitelistedTimestamp();

  const mapStateToProps = (
    state: State,
    ownProps: ListingListItemOwnProps,
  ): ListingListItemOwnProps & WhitelistedCardReduxProps => {
    const whitelistedTimestamp = getLatestWhitelistedTimestamp(state, ownProps);
    return {
      whitelistedTimestamp,
      ...ownProps,
    };
  };

  return mapStateToProps;
};

export default connect(makeMapStateToProps)(WhitelistedListingItem);
