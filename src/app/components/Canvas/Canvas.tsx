import { Responsive, WidthProvider } from 'react-grid-layout';

import { useDispatch, useStore } from 'store/context';
import { UPDATE_LAYOUTS } from 'store/race/actions';
import { useMemo, useCallback } from 'react';

import { RecorderConfigWidget } from 'app/pages/RecordersPage/RecorderConfigWidget';

import { ValueDisplayPanel } from './ValueDisplayPanel';
import { LineChartPanel } from './LineChartPanel';
import { DataPanelBox } from './DataPanelBox';
import { CircularMapPanel } from './CircularMapPanel';
import { DamageDisplayPanel } from './DamageDisplayPanel';
import { TyreWearPitDisplayPanel } from './TyreWearPitDisplayPanel';
import { WeatherDisplayPanel } from './WeatherDisplayPanel';
import { LapChartDisplayPanel } from './LapChartDisplayPanel';
import { TyreTemperatureDisplayPanel } from './TyreTemperatureDisplayPanel';

import styles from './Canvas.module.scss';

const COLS = { lg: 24, md: 20, sm: 16, xs: 12, xxs: 8 };

const ResponsiveGridLayout = WidthProvider(Responsive);

export function Canvas() {
  const { dispatch } = useDispatch();
  const { store } = useStore();
  const { canvas, layouts } = store;

  const memoizedLayouts = useMemo(() => layouts, [layouts]);

  const handleLayoutChange = useCallback(
    newLayout => {
      dispatch({ type: UPDATE_LAYOUTS, newLayout });
    },
    [dispatch],
  );

  function getComponent(id: string) {
    switch (id.split('_')[0]) {
      case 'recorder':
        return <RecorderConfigWidget recorderId={id} />;
      case 'temperature-display':
        return <DamageDisplayPanel id={id} />;
      case 'circular-map':
        return <CircularMapPanel id={id} />;
      case 'value-display':
        return <ValueDisplayPanel id={id} />;
      case 'weather-display':
        return <WeatherDisplayPanel id={id} />;
      // case 'table-display':
      //   return <TableDisplayPanel id={id} />;
      case 'line-chart':
        return <LineChartPanel id={id} />;
      case 'pit-tyre-wear-display':
        return <TyreWearPitDisplayPanel id={id} />;
      case 'tyre-temps-display':
        return <TyreTemperatureDisplayPanel id={id} />;
      case 'lap-chart-display':
        return <LapChartDisplayPanel id={id} />;
      default:
        return <div />;
    }
  }

  return (
    <>
      <ResponsiveGridLayout
        rowHeight={75}
        autoSize={true}
        layouts={memoizedLayouts}
        draggableHandle=".handle"
        cols={COLS}
        onLayoutChange={handleLayoutChange}
        className={styles.canvas}
        resizeHandles={['se']}
        transformScale={1}
        margin={[10, 10]}
        isResizable={true}
        isDraggable={true}
        useCSSTransforms={true}
        preventCollision={false}
        compactType="vertical"
      >
        {canvas.map(id => (
          <div key={id} className={styles.panel}>
            <DataPanelBox showScrollHint={false}>
              {getComponent(id)}
            </DataPanelBox>
          </div>
        ))}
      </ResponsiveGridLayout>
    </>
  );
}
