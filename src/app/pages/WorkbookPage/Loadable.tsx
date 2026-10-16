import { lazyLoad } from 'utils/loadable';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import styles from './Loadable.module.scss';

export const WorkbookPage = lazyLoad(
  () => import('./index'),
  module => module.WorkbookPage,
  {
    fallback: (
      <div className={styles.loadingWrapper}>
        <LoadingIndicator />
      </div>
    ),
  },
);
