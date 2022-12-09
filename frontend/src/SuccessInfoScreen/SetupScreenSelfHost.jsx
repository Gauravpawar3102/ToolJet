import React, { useState } from 'react';
import EnterIcon from '../../assets/images/onboardingassets/Icons/Enter';
import { ButtonSolid } from '@/_components/AppButton';
import OnbboardingFromSH from '../OnBoardingForm/OnbboardingFromSH';

function SetupScreenSelfHost() {
  const [showSelfHostOboarding, setShowSelfHostOboarding] = useState(false);
  const darkMode = localStorage.getItem('darkMode') === 'true';

  return (
    <div className="sh-setup-screen-wrapper">
      {!showSelfHostOboarding ? (
        <div className="sh-setup-banner">
          <div className="sh-setup-sub-banner"></div>
          <div className="sh-setup-card">
            <img src="assets/images/onboardingassets/Illustrations/Dots.svg" />

            <h1>
              Hello,
              <br /> Welcome to <br />
              <span>ToolJet!</span>
            </h1>
            <p>Let’s set up your workspace to get started with ToolJet</p>
            <ButtonSolid
              className="sh-setup-button"
              onClick={() => setShowSelfHostOboarding(true)}
              style={{ width: '328px' }}
            >
              <span>Setup ToolJet</span>
              <EnterIcon className="enter-icon-onboard" fill={darkMode ? '#656565' : '#fff'} />
            </ButtonSolid>
          </div>
        </div>
      ) : (
        <OnbboardingFromSH />
      )}
    </div>
  );
}

export default SetupScreenSelfHost;
