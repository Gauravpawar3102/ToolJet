import React from 'react';

function OnBoardingInput({
  formData,
  setFormData,
  setButtonState,
  setPage,
  fieldType,
  setEmailError,
  emailError = false,
}) {
  return (
    <div className="wrap-onboard-input">
      <input
        defaultValue={formData?.[fieldType]}
        placeholder="Enter your company name"
        className="onboard-input"
        maxLength="25"
        onKeyUp={(e) => {
          fieldType == 'email' && setEmailError(false);
          setFormData({ ...formData, [fieldType]: e.target.value });
          if (e.target.value !== '') setButtonState(false);
          else setButtonState(true);
          if (e.key === 'Enter' && formData.companyName.trim().length !== 0) {
            setPage((currPage) => currPage + 1);
          }
        }}
      />
      {emailError && <span className="tj-text-input-error-state"> Invalid email</span>}
    </div>
  );
}

export default OnBoardingInput;
