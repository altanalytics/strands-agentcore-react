import { defineAuth } from '@aws-amplify/backend';
import { userSignupNotification } from '../functions/user-signup-notification/resource';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    fullname: {
      required: true,
    },
  },
  triggers: {
    postConfirmation: userSignupNotification,
  },
});
