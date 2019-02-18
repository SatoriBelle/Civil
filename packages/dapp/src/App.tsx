import * as React from "react";
import { GlobalNav } from "./components/GlobalNav";
import Main from "./components/Main";
import { BrowserRouter as Router } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import { getApolloClient } from "@joincivil/utils";
import config from "./helpers/config";

console.log("using config:", config);

const client = getApolloClient({});

export const App = (): JSX.Element => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <>
          <GlobalNav />
          <Main />
        </>
      </Router>
    </ApolloProvider>
  );
};
