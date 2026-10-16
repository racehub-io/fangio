import { lazyLoad } from 'utils/loadable';
import { LoadingIndicator } from 'app/components/LoadingIndicator';

export const RecordersPage = lazyLoad(
  () => import('./index'),
  module => module.RecordersPage,
  {
    fallback: <LoadingIndicator />,
  },
);
