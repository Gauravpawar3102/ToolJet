import React, { useState, useEffect } from 'react';
import EnterIcon from '../../assets/images/onboardingassets/Icons/Enter';
import GoogleSSOLoginButton from '@ee/components/LoginPage/GoogleSSOLoginButton';
import GitSSOLoginButton from '@ee/components/LoginPage/GitSSOLoginButton';
import OnBoardingForm from '../OnBoardingForm/OnBoardingForm';
import { appService, authenticationService } from '@/_services';
import { useLocation, useHistory } from 'react-router-dom';
import { LinkExpiredInfoScreen } from '@/successInfoScreen';
import { ShowLoading } from '@/_components';
import { toast } from 'react-hot-toast';
import OnboardingNavbar from '../_components/OnboardingNavbar';
import { ButtonSolid } from '@/_components/AppButton';
import OnboardingCta from '../_components/OnboardingCta';
import EyeHide from '../../assets/images/onboardingassets/Icons/EyeHide';
import EyeShow from '../../assets/images/onboardingassets/Icons/EyeShow';
import Spinner from '@/_ui/Spinner';

export const VerificationSuccessInfoScreen = function VerificationSuccessInfoScreen() {
  const [show, setShow] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState(false);
  const [userDetails, setUserDetails] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showJoinWorkspace, setShowJoinWorkspace] = useState(false);
  const [isGettingConfigs, setIsGettingConfigs] = useState(true);
  const [configs, setConfigs] = useState({});
  const [enableSignUp, setEnableSignUp] = useState({});
  const [password, setPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const history = useHistory();

  const organizationId = new URLSearchParams(location?.state.search).get('oid');
  const single_organization = window.public_config?.DISABLE_MULTI_WORKSPACE === 'true';
  const source = new URLSearchParams(location.state.search).get('source');

  const getUserDetails = () => {
    setIsLoading(true);
    authenticationService.verifyToken(location?.state?.token).then((data) => {
      setUserDetails(data);
      setIsLoading(false);
      if (data?.email !== '') {
        setVerifiedToken(true);
      }
    });
  };

  useEffect(() => {
    console.log('showJoinWorkspace', showJoinWorkspace, password, isLoading);
  }, [showJoinWorkspace, password, isLoading]);

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    if (single_organization) {
      setIsGettingConfigs(false);
      return;
    }
    authenticationService.deleteLoginOrganizationId();

    if (organizationId) {
      // Workspace invite
      authenticationService.saveLoginOrganizationId(organizationId);
      authenticationService.getOrganizationConfigs(organizationId).then(
        (configs) => {
          setIsGettingConfigs(false);
          setConfigs(configs);
        },
        () => {
          setIsGettingConfigs(false);
        }
      );
    } else {
      // Sign up
      setIsGettingConfigs(false);
      setEnableSignUp(
        window.public_config?.DISABLE_MULTI_WORKSPACE !== 'true' && window.public_config?.SSO_DISABLE_SIGNUPS !== 'true'
      );
      setConfigs({
        google: {
          enabled: !!window.public_config?.SSO_GOOGLE_OAUTH2_CLIENT_ID,
          configs: {
            client_id: window.public_config?.SSO_GOOGLE_OAUTH2_CLIENT_ID,
          },
        },
        git: {
          enabled: !!window.public_config?.SSO_GIT_OAUTH2_CLIENT_ID,
          configs: {
            client_id: window.public_config?.SSO_GIT_OAUTH2_CLIENT_ID,
          },
        },
      });
    }
  }, []);

  const setUpAccount = () => {
    setIsLoading(true);
    authenticationService
      .onboarding({
        companyName: '',
        companySize: '',
        role: '',
        token: location?.state?.token,
        organizationToken: location?.state?.organizationToken ?? '',
        source: source,
      })
      .then((user) => {
        authenticationService.updateUser(user);
        authenticationService.deleteLoginOrganizationId();
        setIsLoading(false);
        history.push('/');
      })
      .catch((res) => {
        setIsLoading(false);
        toast.error(res.error || 'Something went wrong', {
          id: 'toast-login-auth-error',
          position: 'top-center',
        });
      });
  };

  const handleOnCheck = () => {
    setShowPassword(!showPassword);
  };
  const handleChange = (event) => {
    setPassword(event.target.value);
  };

  // const acceptInvite = (e, isSetPassword) => {
  //   e.preventDefault();

  //   const token = location?.state?.token;
  //   setIsLoading(true);

  //   if (isSetPassword) {
  //     if (!password || !password.trim()) {
  //       setIsLoading(false);
  //       toast.error("Password shouldn't be empty or contain white space(s)", {
  //         position: 'top-center',
  //       });
  //       return;
  //     }
  //   }

  //   appService
  //     .acceptInvite({
  //       token,
  //       password,
  //     })
  //     .then((response) => {
  //       setIsLoading(false);
  //       if (!response.ok) {
  //         return toast.error('Error while setting up your account.', { position: 'top-center' });
  //       }
  //       if (response.status == 201) {
  //         toast.success(`Added to the workspace${isSetPassword ? ' and password has been set ' : ' '}successfully.`);
  //         history.push('/login');
  //       }
  //     });
  // };

  return (
    <div>
      {isLoading && (
        <div className="loader-wrapper verification-loader-wrap">
          <ShowLoading />
        </div>
      )}
      {showJoinWorkspace && (
        <>
          <div className="page common-auth-section-whole-wrapper">
            <div className="common-auth-section-left-wrapper">
              <OnboardingNavbar />
              <div className="common-auth-section-left-wrapper-grid">
                <div></div>

                <form action="." method="get" autoComplete="off">
                  {isGettingConfigs ? (
                    <ShowLoading />
                  ) : (
                    <div className="common-auth-container-wrapper">
                      <h2 className="common-auth-section-header">Join Workspace</h2>

                      <div className="signup-page-signin-redirect">
                        {`You are invited to a workspace ${configs?.name}. Accept the invite to join the org.`}
                      </div>
                      {configs?.enable_sign_up && (
                        <div className="d-flex flex-column align-items-center separator-bottom">
                          {configs?.google?.enabled && (
                            <div className="login-sso-wrapper">
                              <GoogleSSOLoginButton
                                text={('confirmationPage.signupWithGoogle', 'Sign up with Google')}
                                configs={configs?.google?.configs}
                                configId={configs?.google?.config_id}
                              />
                            </div>
                          )}
                          {configs?.git?.enabled && (
                            <div className="login-sso-wrapper">
                              <GitSSOLoginButton
                                text={('confirmationPage.signupWithGitHub', 'Sign up with GitHub')}
                                configs={configs?.git?.configs}
                              />
                            </div>
                          )}
                          <div className="mt-2 separator">
                            <h2>
                              <span>{('confirmationPage.or', 'OR')}</span>{' '}
                            </h2>
                          </div>
                        </div>
                      )}

                      <div className="org-page-inputs-wrapper">
                        <label className="tj-text-input-label">Name</label>
                        <p className="tj-text-input">{userDetails.name}</p>
                      </div>

                      <div className="signup-inputs-wrap">
                        <label className="tj-text-input-label">Work Email</label>
                        <p className="tj-text-input">{userDetails.email}</p>
                      </div>

                      {userDetails.onboarding_details?.password && (
                        <div className="mb-3">
                          <label className="form-label" data-cy="password-label">
                            {('confirmationPage.password', 'Password')}
                          </label>
                          <div className="org-password">
                            <input
                              onChange={handleChange}
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              className="tj-text-input"
                              placeholder="Enter password"
                              autoComplete="off"
                              data-cy="password-input"
                            />

                            <div className="org-password-hide-img" onClick={handleOnCheck}>
                              {showPassword ? (
                                <EyeHide fill={password?.length ? '#384151' : '#D1D5DB'} />
                              ) : (
                                <EyeShow fill={password?.length ? '#384151' : '#D1D5DB'} />
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <ButtonSolid
                          className="org-btn login-btn"
                          // onClick={(e) => acceptInvite(e, true)}
                          onClick={(e) => setUpAccount()}
                          disabled={isLoading || !password || password?.length < 5}
                          data-cy="accept-invite-button"
                        >
                          {isLoading ? (
                            <div className="spinner-center">
                              <Spinner />
                            </div>
                          ) : (
                            <>
                              <span> Accept invite</span>
                              <EnterIcon className="enter-icon-onboard" />
                            </>
                          )}
                        </ButtonSolid>
                      </div>
                      <p>
                        By Signing up you are agreeing to the
                        <br />
                        <span>
                          <a href="https://www.tooljet.com/terms">Terms of Service &</a>
                          <a href="https://www.tooljet.com/privacy"> Privacy Policy.</a>
                        </span>
                      </p>
                    </div>
                  )}
                </form>
                <div></div>
              </div>
            </div>
            <div className="common-auth-section-right-wrapper">
              <OnboardingCta isLoading={false} />
            </div>
          </div>
        </>
      )}

      {verifiedToken && !show && !showJoinWorkspace && (
        <div className="page common-auth-section-whole-wrapper">
          <div className="info-screen-outer-wrap">
            <div className="info-screen-wrapper">
              <div className="verification-success-card">
                <img
                  className="info-screen-email-img"
                  src={'assets/images/onboardingassets/Illustrations/Verification successfull.svg'}
                  alt="email image"
                />
                <h1 className="common-auth-section-header">Successfully verified email</h1>
                <p className="info-screen-description">
                  Your email has been verified successfully. Continue to set up your workspace to start using ToolJet.
                </p>
                <ButtonSolid
                  className="verification-success-info-btn "
                  variant="primary"
                  onClick={() => {
                    single_organization &&
                      (userDetails?.onboarding_details?.questions ? setShow(true) : setUpAccount());
                    !single_organization &&
                      (userDetails?.onboarding_details?.questions ? setShow(true) : setShowJoinWorkspace(true));
                  }}
                >
                  Set up ToolJet
                  <EnterIcon fill={'#fff'}></EnterIcon>
                </ButtonSolid>
              </div>
            </div>
          </div>
        </div>
      )}

      {verifiedToken && show && (
        <OnBoardingForm
          userDetails={userDetails}
          token={location?.state?.token}
          organizationToken={location?.state?.organizationToken ?? ''}
        />
      )}

      {!verifiedToken && (
        <div className="page">
          <div className="info-screen-outer-wrap">
            {isLoading ? (
              <div className="loader-wrapper">
                <ShowLoading />
              </div>
            ) : (
              <LinkExpiredInfoScreen />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
