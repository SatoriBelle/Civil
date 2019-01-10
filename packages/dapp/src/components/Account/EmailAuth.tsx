import * as React from "react";
import gql from "graphql-tag";
import { RouteComponentProps } from "react-router-dom";

import { Mutation, MutationFn } from "react-apollo";

const signupMutation = gql`
  mutation($emailAddress: String!) {
    authSignupEmailSend(emailAddress: $emailAddress)
  }
`;

const loginMutation = gql`
  mutation($emailAddress: String!) {
    authLoginEmailSend(emailAddress: $emailAddress)
  }
`;

export enum AuthApplicationEnum {
  DEFAULT = "DEFAULT",
  NEWSROOM = "NEWSROOM",
  STOREFRONT = "STOREFRONT",
}

export interface AuthSignupEmailSendResult {
  data: {
    authSignupEmailSend: string;
  };
}

export interface AccountEmailAuthProps extends RouteComponentProps {
  applicationType: AuthApplicationEnum;
  isNewUser: boolean;
  onEmailSend(isNewUser: boolean): void;
}

export interface AccountEmailAuthState {
  emailAddress: string;
}

export class AccountEmailAuth extends React.Component<AccountEmailAuthProps, AccountEmailAuthState> {
  constructor(props: AccountEmailAuthProps) {
    super(props);
    this.state = {
      emailAddress: "",
    };
  }

  public render(): JSX.Element {
    const { isNewUser } = this.props;

    const emailMutation = isNewUser ? signupMutation : loginMutation;
    return (
      <Mutation mutation={emailMutation}>
        {(sendEmail, { loading, error, data }) => {
          return (
            <>
              <h3>Let's Get Started</h3>
              <form onSubmit={async event => this.submit(event, sendEmail)}>
                <input
                  placeholder="Email address"
                  type="text"
                  name="email"
                  value={this.state.emailAddress}
                  onChange={event => this.setState({ emailAddress: event.target.value })}
                />
                <input type="submit" value="Confirm" />
              </form>

              {loading && <span>loading...</span>}

              <pre>{JSON.stringify(data)}</pre>
            </>
          );
        }}
      </Mutation>
    );
  }

  private async submit(event: any, mutation: MutationFn): Promise<void> {
    event.preventDefault();

    const { emailAddress } = this.state;
    const { applicationType, onEmailSend, isNewUser } = this.props;

    const {
      data: { authSignupEmailSend },
    } = (await mutation({
      variables: { emailAddress, application: applicationType },
    })) as AuthSignupEmailSendResult;

    if (authSignupEmailSend === "ok") {
      onEmailSend(isNewUser);
      return;
    }

    alert("Error:" + authSignupEmailSend);
    return;
  }
}
