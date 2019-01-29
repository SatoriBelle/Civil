import * as React from "react";
import {
  TutorialLandingContainer,
  TutorialIntro,
  TutorialTime,
  TutorialSkipSection,
  TakeQuizBtn,
  TutorialTopic,
  LaunchTopic,
  TopicProgress,
  TutorialProgressBars,
  TutorialProgressBar,
} from "./TokenTutorialStyledComponents";
import { ClockIcon } from "../icons/ClockIcon";
import {
  TutorialIntroText,
  TutorialTimeText,
  TutorialSkipText,
  TutorialSkipBtnText,
  TutorialProgressText,
} from "./TokenTutorialTextComponents";
import { TutorialContent } from "./TutorialContent";
import { DisclosureArrowIcon } from "../icons/DisclosureArrowIcon";

export interface TokenTutorialLandingProps {
  onClick?(index: number): void;
}

export const TokenTutorialLanding: React.StatelessComponent<TokenTutorialLandingProps> = props => {
  return (
    <TutorialLandingContainer>
      <TutorialIntro>
        <TutorialIntroText />
        <TutorialTime>
          <ClockIcon />
          <TutorialTimeText />
        </TutorialTime>
      </TutorialIntro>

      <TutorialSkipSection>
        <TutorialSkipText />
        <TakeQuizBtn>
          <TutorialSkipBtnText />
        </TakeQuizBtn>
      </TutorialSkipSection>

      {TutorialContent.map((topic, idx) => (
        <TutorialTopic key={idx}>
          <LaunchTopic data-quiz-id={idx} onClick={props.onClick}>
            <div>
              {topic.icon}
              <h3>{topic.name}</h3>
              <p>{topic.description}</p>
            </div>
            <DisclosureArrowIcon />
          </LaunchTopic>
          <TopicProgress>
            <TutorialProgressText questions={topic.questions.length} />
            <TutorialProgressBars>
              {topic.questions.map(x => <TutorialProgressBar />)}
              <b>0/{topic.questions.length}</b>
            </TutorialProgressBars>
          </TopicProgress>
        </TutorialTopic>
      ))}
    </TutorialLandingContainer>
  );
};
