/** ***********************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.

 * Adobe permits you to use and modify this file solely in accordance with
 * the terms of the Adobe license agreement accompanying it.
 ************************************************************************ */
import { getSubmitBaseUrl } from '../constant.js';
/**
 * Prefixes the URL with the context path.
 * @param {string} url - The URL to externalize.
 * @returns {string} - The externalized URL.
 */
function externalize(url) {
  const submitBaseUrl = getSubmitBaseUrl();
  if (submitBaseUrl) {
    return `${submitBaseUrl}${url}`;
  }
  return url;
}

/**
 * Validates if the given URL is correct.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is valid, false otherwise.
 */
function validateURL(url) {
  try {
    const validatedUrl = new URL(url, window.location.href);
    return (validatedUrl.protocol === 'http:' || validatedUrl.protocol === 'https:');
  } catch (err) {
    return false;
  }
}

/**
 * Converts a JSON string to an object.
 * @param {string} str - The JSON string to convert to an object.
 * @returns {object} - The parsed JSON object. Returns an empty object if an exception occurs.
 * @memberof module:FormView~customFunctions
 */
function toObject(str) {
  if (typeof str === 'string') {
    try {
      return JSON.parse(str);
    } catch (e) {
      return {};
    }
  }
  return str;
}

/**
 * Navigates to the specified URL.
 * @param {string} destinationURL - The URL to navigate to. If not specified, a new blank window will be opened.
 * @param {string} destinationType - The type of destination. Supports the following values: "_newwindow", "_blank", "_parent", "_self", "_top", or the name of the window.
 * @returns {Window} - The newly opened window.
 */
function navigateTo(destinationURL, destinationType) {
  let param = null;
  const windowParam = window;
  let arg = null;
  switch (destinationType) {
    case '_newwindow':
      param = '_blank';
      arg = 'width=1000,height=800';
      break;
  }
  if (!param) {
    if (destinationType) {
      param = destinationType;
    } else {
      param = '_blank';
    }
  }
  if (validateURL(destinationURL)) {
    windowParam.open(destinationURL, param, arg);
  }
}

/**
 * Default error handler for the invoke service API.
 * @param {object} response - The response body of the invoke service API.
 * @param {object} headers - The response headers of the invoke service API.
 * @param {scope} globals - An object containing read-only form instance, read-only target field instance and methods for form modifications.
 * @returns {void}
 */
function defaultErrorHandler(response, headers, globals) {
  if (response && response.validationErrors) {
    response.validationErrors?.forEach((violation) => {
      if (violation.details) {
        if (violation.fieldName) {
          globals.functions.markFieldAsInvalid(violation.fieldName, violation.details.join('\n'), { useQualifiedName: true });
        } else if (violation.dataRef) {
          globals.functions.markFieldAsInvalid(violation.dataRef, violation.details.join('\n'), { useDataRef: true });
        }
      }
    });
  }
}

/**
 * Handles the success response after a form submission.
 *
 * @param {scope} globals - An object containing read-only form instance, read-only target field instance and methods for form modifications.
 * @returns {void}
 */
function defaultSubmitSuccessHandler(globals) {
  const { event } = globals;
  const submitSuccessResponse = event?.payload?.body;
  const { form } = globals;
  if (submitSuccessResponse) {
    if (submitSuccessResponse.redirectUrl) {
      window.location.href = encodeURI(submitSuccessResponse.redirectUrl);
    } else if (submitSuccessResponse.thankYouMessage) {
      const formContainerElement = document.getElementById(`${form.$id}`);
      const thankYouMessage = document.createElement('div');
      thankYouMessage.setAttribute('class', 'tyMessage');
      thankYouMessage.setAttribute('tabindex', '-1');
      thankYouMessage.setAttribute('role', 'alertdialog');
      thankYouMessage.innerHTML = submitSuccessResponse.thankYouMessage;
      formContainerElement.replaceWith(thankYouMessage);
      thankYouMessage.focus();
    }
  }
}

/**
 * Handles the error response after a form submission.
 *
 * @param {string} defaultSubmitErrorMessage - The default error message.
 * @param {scope} globals - An object containing read-only form instance, read-only target field instance and methods for form modifications.
 * @returns {void}
 */
function defaultSubmitErrorHandler(defaultSubmitErrorMessage, globals) {
  // view layer should send localized error message here
  window.alert(defaultSubmitErrorMessage);
}

/**
 * Fetches the captcha token for the form.
 *
 * This function uses the Google reCAPTCHA Enterprise/turnstile service to fetch the captcha token.
 *
 * @async
 * @param {object} globals - An object containing read-only form instance, read-only target field instance and methods for form modifications.
 * @returns {string} - The captcha token.
 */
async function fetchCaptchaToken(globals) {
  return new Promise((resolve, reject) => {
    // successCallback and errorCallback can be reused for different captcha implementations
    const successCallback = function (token) {
      resolve(token);
    };

    const errorCallback = function (error) {
      reject(error);
    };

    try {
      const captcha = globals.form.$captcha;
      if (captcha.$captchaProvider === 'turnstile') {
        const turnstileContainer = document.getElementsByClassName('cmp-adaptiveform-turnstile__widget')[0];
        const turnstileParameters = {
          sitekey: captcha.$captchaSiteKey,
          callback: successCallback,
          'error-callback': errorCallback,
        };
        if (turnstile != undefined) {
          const widgetId = turnstile.render(turnstileContainer, turnstileParameters);
          if (widgetId) {
            turnstile.execute(widgetId);
          } else {
            reject({ error: 'Failed to render turnstile captcha' });
          }
        } else {
          reject({ error: 'Turnstile captcha not loaded' });
        }
      } else {
        const siteKey = captcha?.$properties['fd:captcha']?.config?.siteKey;
        const captchaElementName = captcha.$name.replaceAll('-', '_');
        let captchaPath = captcha?.$properties['fd:path'];
        const index = captchaPath.indexOf('/jcr:content');
        let formName = '';
        if (index > 0) {
          captchaPath = captchaPath.substring(0, index);
          formName = captchaPath.substring(captchaPath.lastIndexOf('/') + 1).replaceAll('-', '_');
        }
        const actionName = `submit_${formName}_${captchaElementName}`;
        grecaptcha.enterprise.ready(() => {
          grecaptcha.enterprise.execute(siteKey, { action: actionName })
            .then((token) => resolve(token))
            .catch((error) => reject(error));
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Converts a date to the number of days since the Unix epoch (1970-01-01).
 *
 * If the input date is a number, it is assumed to represent the number of days since the epoch,
 * including both integer and decimal parts. In this case, only the integer part is returned as the number of days.
 *
 * @param {string|Date|number} date - The date to convert.
 * Can be:
 * - An ISO string (yyyy-mm-dd)
 * - A Date object
 * - A number representing the days since the epoch, where the integer part is the number of days and the decimal part is the fraction of the day
 *
 * @returns {number} - The number of days since the Unix epoch
 */
function dateToDaysSinceEpoch(date) {
  let dateObj;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    return Math.floor(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    throw new Error('Invalid date input');
  }

  // Validate that date is valid after parsing
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date input');
  }
  return Math.floor(dateObj.getTime() / (1000 * 60 * 60 * 24));
}

/**
 * Fetches CSRF token from the API
 *
 * @async
 * @returns {Promise<string|null>} - The CSRF token or null if fetch fails
 */
async function fetchCsrfToken() {
  try {
    const response = await fetch('https://pwsdevenvironment.azure-api.net/api/FormSubmissionService/forms/csrf/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token || data.csrfToken || data;
    }
    
    console.error('Failed to fetch CSRF token:', response.status);
    return null;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}

/**
 * Adds CSRF token to the form submission payload with headers.
 * Fetches the CSRF token from the API and adds it to the X-CSRF-Token header.
 *
 * @async
 * @param {object} payload - The form submission payload (typically from $form.exportData())
 * @returns {Promise<object>} - The payload with CSRF token added to headers in format { body, headers }
 *
 * @example
 * // Usage in submit button's click event in form JSON:
 * {
 *   "id": "submitButton",
 *   "fieldType": "button",
 *   "name": "submit",
 *   "label": { "value": "Submit" },
 *   "events": {
 *     "click": ["submitForm(await addCsrfToken($form.exportData()))"]
 *   }
 * }
 *
 * @example
 * // Usage with request function for API calls:
 * {
 *   "events": {
 *     "change": [
 *       "request('https://api.example.com/endpoint', 'POST', await addCsrfToken($form.exportData()), 'custom:success', 'custom:error')"
 *     ]
 *   }
 * }
 */
async function addCsrfToken(payload) {
  const token = await fetchCsrfToken();
  
  if (token) {
    // Return payload in the format expected by the runtime's request function
    return {
      body: payload,
      headers: {
        'X-CSRF-Token': token
      }
    };
  }
  
  // If token fetch fails, return payload as-is
  return payload;
}

/**
 * Adds a custom header to the form submission payload.
 * Use this to add any custom header (e.g., API keys, authentication tokens) to form submissions.
 *
 * @param {object} payload - The form submission payload (can be plain data or { body, headers } format)
 * @param {string} headerName - The name of the header to add (e.g., 'X-API-Key', 'Authorization')
 * @param {string} headerValue - The value of the header
 * @returns {object} - The payload with custom header added in format { body, headers }
 *
 * @example
 * // Usage 1: Add single custom header on submit button click
 * {
 *   "id": "submitButton",
 *   "fieldType": "button",
 *   "events": {
 *     "click": [
 *       "submitForm(addCustomHeader($form.exportData(), 'X-API-Key', 'your-api-key-here'))"
 *     ]
 *   }
 * }
 *
 * @example
 * // Usage 2: Chain with addCsrfToken to add both CSRF token and custom header
 * {
 *   "events": {
 *     "click": [
 *       "submitForm(addCustomHeader(await addCsrfToken($form.exportData()), 'X-Client-ID', 'client-123'))"
 *     ]
 *   }
 * }
 *
 * @example
 * // Usage 3: Add authorization header dynamically from form field
 * {
 *   "events": {
 *     "click": [
 *       "submitForm(addCustomHeader($form.exportData(), 'Authorization', 'Bearer ' + authToken.$value))"
 *     ]
 *   }
 * }
 *
 * @example
 * // Usage 4: With request function for custom API calls
 * {
 *   "events": {
 *     "change": [
 *       "request('https://api.example.com/data', 'POST', addCustomHeader({data: $field.$value}, 'X-Request-ID', '12345'), 'custom:success', 'custom:error')"
 *     ]
 *   }
 * }
 */
function addCustomHeader(payload, headerName, headerValue) {
  // If payload already has headers structure, merge with existing headers
  if (payload && typeof payload === 'object' && 'body' in payload && 'headers' in payload) {
    return {
      body: payload.body,
      headers: {
        ...payload.headers,
        [headerName]: headerValue
      }
    };
  }
  
  // Otherwise, create new structure with headers
  return {
    body: payload,
    headers: {
      [headerName]: headerValue
    }
  };
}

export {
  externalize,
  validateURL,
  navigateTo,
  toObject,
  defaultErrorHandler,
  defaultSubmitSuccessHandler,
  defaultSubmitErrorHandler,
  fetchCaptchaToken,
  dateToDaysSinceEpoch,
  addCsrfToken,
  fetchCsrfToken,
  addCustomHeader,
};
