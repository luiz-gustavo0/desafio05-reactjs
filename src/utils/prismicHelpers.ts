// ~/utils/prismicHelpers.js
import Prismic from '@prismicio/client';

const Router = {
  routes: [
    {
      type: 'posts',
      path: '/post/:uid',
    },
  ],
};

// -- @prismicio/client initialisation
// Initialises the Prismic Client that's used for querying the API and passes it any query options.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const Client = (req = null) =>
  Prismic.client(
    process.env.PRISMIC_API_ENDPOINT,
    createClientOptions(req, process.env.PRISMIC_ACCESS_TOKEN, Router)
  );

// Options to be passed to the Client
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createClientOptions = (
  req = null,
  prismicAccessToken = null,
  routes = null
) => {
  const reqOption = req ? { req } : {};
  const accessTokenOption = prismicAccessToken
    ? { accessToken: prismicAccessToken }
    : {};
  const routesOption = routes ? { routes: Router.routes } : {};
  return {
    ...reqOption,
    ...accessTokenOption,
    ...routesOption,
  };
};

export default Client;
