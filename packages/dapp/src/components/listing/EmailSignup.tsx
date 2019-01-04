import * as React from "react";
import { EmailSignup as EmailSignupComponent } from "@joincivil/components";
import { TCR_SENDGRID_LIST_ID, addToMailingList } from "@joincivil/utils";

export interface EmailSignupState {
  email: string;
  errorMessage: string;
}

class EmailSignup extends React.Component<{}, EmailSignupState> {
  constructor(props: any) {
    super(props);
    this.state = {
      email: "",
      errorMessage: "",
    };
  }
  public render(): JSX.Element {
    const { email } = this.state;
    return (
      <EmailSignupComponent onChange={this.onEmailSignupChange} onSubmit={this.onEmailSignupSubmit} email={email} />
    );
  }

  private onEmailSignupChange = (name: string, value: string): void => {
    if (name === "EmailSignupTextInput") {
      this.setState({ email: value });
    }
  };

  private onEmailSignupSubmit = async (): Promise<void> => {
    const { email } = this.state;

    try {
      await addToMailingList(email, TCR_SENDGRID_LIST_ID);
      this.setState({ email: "" });
    } catch (err) {
      console.error("Error adding to mailing list:", { err });
      this.setState({ errorMessage: err });
    }
  };
}

export default EmailSignup;
