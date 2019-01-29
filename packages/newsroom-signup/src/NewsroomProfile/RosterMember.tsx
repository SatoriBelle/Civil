import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { isValidAddress } from "ethereumjs-util";
import { colors, buttonSizes, ToolTip } from "@joincivil/components";
import { EthAddress, RosterMember as RosterMemberInterface } from "@joincivil/core";
import { isValidHttpUrl } from "@joincivil/utils";
import styled from "styled-components";
import {
  FormSubhead,
  FormRow,
  FormRowItem,
  HelperText,
  StyledTextInput,
  StyledTextareaInput,
  TertiaryButton,
} from "../styledComponents";
import { StateWithNewsroom } from "../reducers";
import { UserData } from "../types";

export interface RosterMemberProps {
  user: UserData;
  updateRosterMember(newVal: Partial<RosterMemberInterface>): void;
}

const Wrapper = styled.div`
  padding: 20px 0;
  border-top: 1px solid ${colors.accent.CIVIL_GRAY_4};
`;

const DisplayName = styled(FormSubhead)`
  display: inline-block;
  font-weight: bold;
  margin: 0 10px 0 0;
`;
const Username = styled.span`
  color: #72777c;
  margin-right: 10px;
`;

const AvatarWrap = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
  width: 24px;
  height: 24px;
`;
const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
`;
const _NoAvatar = styled.div`
  display: inline-block;
  width: 24px;
  height: 21px;
  padding-top: 3px;
  text-align: center;
  font-weight: bold;
  background-color: ${colors.accent.CIVIL_GRAY_4};
  color: ${colors.accent.CIVIL_GRAY_2};
`;
const noAvatar = <_NoAvatar>?</_NoAvatar>;

const Input = styled(StyledTextInput)`
  margin: -8px 0 -20px;
`;
const Textarea = styled(StyledTextareaInput)`
  margin: -8px 0 0;
  small {
    top: 70px;
  }
`;

export class RosterMemberComponent extends React.Component<RosterMemberProps & DispatchProp<any>> {
  constructor(props: RosterMemberProps & DispatchProp<any>) {
    super(props);
  }

  public render(): JSX.Element {
    const user = this.props.user;
    return (
      <Wrapper>
        <FormSubhead>Name</FormSubhead>
        <Input name="name" value={user.rosterData.name || ""} onChange={this.rosterInputChange} />
        <FormSubhead optional>Avatar URL</FormSubhead>
        <Input
          name="avatarUrl"
          value={user.rosterData.avatarUrl || ""}
          onChange={this.rosterInputChange}
          invalid={!!user.rosterData.avatarUrl && !isValidHttpUrl(user.rosterData.avatarUrl)}
          invalidMessage={"Invalid URL"}
        />

        <FormSubhead>Role</FormSubhead>
        <Input name="role" value={user.rosterData.role} onChange={this.rosterInputChange} />

        <FormSubhead>Bio</FormSubhead>
        <Textarea
          name="bio"
          value={user.rosterData.bio}
          onChange={this.rosterInputChange}
          invalid={!!user.rosterData.bio && user.rosterData.bio.length > 1000}
          invalidMessage={"Too long"}
        />
        <HelperText>Maximum of 1000 characters</HelperText>
        <FormSubhead optional>Public Wallet Address</FormSubhead>
        <Input name="ethAddress" value={user.rosterData.ethAddress || ""} onChange={this.rosterInputChange} />
        <FormSubhead optional>Email Address</FormSubhead>
        <Input name="email" value={(user.rosterData.socialUrls || {}).email} onChange={this.rosterSocialInputChange} />
        <FormRow>
          <FormRowItem>
            <FormSubhead optional>Twitter URL</FormSubhead>
            <Input
              name="twitter"
              value={(user.rosterData.socialUrls || {}).twitter}
              onChange={this.rosterSocialInputChange}
              invalid={
                !!user.rosterData.socialUrls &&
                !!user.rosterData.socialUrls.twitter &&
                !isValidHttpUrl(user.rosterData.socialUrls.twitter)
              }
              invalidMessage={"Invalid URL"}
            />
          </FormRowItem>
          <FormRowItem>
            <FormSubhead optional>Facebook</FormSubhead>
            <Input
              name="facebook"
              value={(user.rosterData.socialUrls || {}).facebook}
              onChange={this.rosterSocialInputChange}
            />
          </FormRowItem>
        </FormRow>
      </Wrapper>
    );
  }

  // private removeMember = () => {
  //   this.props.updateRosterMember(this.props.user.rosterData, {}, true);
  // };

  private rosterInputChange = (name: string, val: string) => {
    this.props.updateRosterMember({
      ...this.props.user.rosterData,
      [name]: val,
    });
  };

  private rosterSocialInputChange = (type: string, val: string) => {
    this.props.updateRosterMember({
      ...this.props.user.rosterData,
      socialUrls: {
        ...this.props.user.rosterData.socialUrls,
        [type]: val,
      },
    });
  };
}

const mapStateToProps = (state: StateWithNewsroom, ownProps: RosterMemberProps): RosterMemberProps => {
  return ownProps;
};

export const RosterMember = connect(mapStateToProps)(RosterMemberComponent);
