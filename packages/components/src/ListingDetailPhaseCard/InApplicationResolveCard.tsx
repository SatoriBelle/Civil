import * as React from "react";
import { ListingDetailPhaseCardComponentProps } from "./types";
import {
  StyledListingDetailPhaseCardContainer,
  StyledListingDetailPhaseCardSection,
  StyledPhaseDisplayName,
  CTACopy,
} from "./styledComponents";
import { TransactionButtonNoModal } from "../TransactionButton";

export const InApplicationResolveCard: React.SFC<ListingDetailPhaseCardComponentProps> = props => {
  return (
    <StyledListingDetailPhaseCardContainer>
      <StyledListingDetailPhaseCardSection>
        <StyledPhaseDisplayName>Application Accepted</StyledPhaseDisplayName>
      </StyledListingDetailPhaseCardSection>
      <StyledListingDetailPhaseCardSection>
        <CTACopy>
          This application is complete. To update this Newsroom's status on the Civil Registry, please add to registry.
        </CTACopy>
        <TransactionButtonNoModal
          transactions={props.transactions!}
          disabledOnMobile={true}
          onMobileClick={props.onMobileTransactionClick}
        >
          Add To Registry
        </TransactionButtonNoModal>
      </StyledListingDetailPhaseCardSection>
    </StyledListingDetailPhaseCardContainer>
  );
};
