import { AnyAction } from "redux";
import { Dispatch } from "react-redux";
import { clearListingSubscriptions, initializeSubscriptions } from "../../helpers/listingEvents";
import { clearAllListingData } from "./listings";
import { isGraphQLSupportedOnNetwork } from "../../helpers/civilInstance";

export enum uiActions {
  ADD_OR_UPDATE_UI_STATE = "ADD_OR_UPDATE_UI_STATE",
  SET_LOADING_FINISHED = "SET_LOADING_FINISHED",
  TOGGLE_USE_GRAPH_QL = "TOGGLE_USE_GRAPH_QL",
  DISABLE_GRAPHL_QL = "DISABLE_GRAPH_QL",
  TRIED_TO_ENABLE_GRAPH_QL_ON_UNSUPPORTED_NETWORK = "TRIED_TO_ENABLE_GRAPH_QL_ON_UNSUPPORTED_NETWORK",
}

export const addOrUpdateUIState = (key: string, value: any): AnyAction => {
  return {
    type: uiActions.ADD_OR_UPDATE_UI_STATE,
    key,
    value,
  };
};

export const initialize = async (): Promise<any> => {
  return async (dispatch: Dispatch<any>, getState: any): Promise<undefined> => {
    const { useGraphQL } = getState();
    if (!useGraphQL) {
      await initializeSubscriptions(dispatch);
    }
    return undefined;
  };
};

export const disableGraphQL = (): AnyAction => {
  return {
    type: uiActions.DISABLE_GRAPHL_QL,
  };
};

export const toggleUseGraphQL = async (): Promise<any> => {
  return async (dispatch: Dispatch<any>, getState: any): Promise<AnyAction> => {
    const { useGraphQL, network } = getState();
    if (isGraphQLSupportedOnNetwork(network)) {
      if (!useGraphQL) {
        // going to graphQL loading
        clearListingSubscriptions();
        dispatch(clearAllListingData());
      } else {
        // going to web3 loading
        await initializeSubscriptions(dispatch);
      }
      return dispatch(toggleUseGraphQLSimple());
    } else {
      return dispatch(triedToEnableGraphQL()); // if network is not supported, graphql current disabled and cannot be enabled
    }
  };
};

export const triedToEnableGraphQL = (): AnyAction => {
  return {
    type: uiActions.TRIED_TO_ENABLE_GRAPH_QL_ON_UNSUPPORTED_NETWORK,
  };
};

export const toggleUseGraphQLSimple = (): AnyAction => {
  return {
    type: uiActions.TOGGLE_USE_GRAPH_QL,
  };
};
