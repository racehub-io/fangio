import classnames from 'classnames';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { bisector } from 'd3-array';
import { curveStep } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import { scaleLinear } from '@visx/scale';
import { LinePath, Line } from '@visx/shape';
import { useTooltip, Tooltip } from '@visx/tooltip';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import { GridRows, GridColumns } from '@visx/grid';
import { localPoint } from '@visx/event';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import { createSelectTelemetryByComponentIdAndFrame } from 'store/race/slice/selectors';
import { Participants } from 'store/race/slice/types';
import { Button } from 'app/components/Button';
import {
  extractTelemetry,
  getFullXDomain,
  getTeamColor,
  getXDomain,
} from './helpers';
import { useAnimationFrame, useEffectAllDepsChange } from './hooks';
import styles from './LineChart.module.scss';
import { RootState } from 'types';

const margin = { top: 20, right: 20, bottom: 80, left: 50 };
const brushMargin = { top: 0, bottom: 15, left: 50, right: 20 };
const formatTime = timeFormat('%H:%M:%S');

interface TooltipData {
  points?: { x: number; y: number }[];
}

export function LineChart({
  id,
  participantIds,
  isLiveMode,
  participants,
  isPropertySelectorsOpen,
}: {
  id: string;
  isLiveMode: boolean;
  participantIds: number[];
  participants: Participants;
  isPropertySelectorsOpen: boolean;
}) {
  const { tooltipData, tooltipLeft, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip<TooltipData>();

  const [customDomain, setCustomDomain] = useState<
    { x0?: number; x1?: number; y0?: number; y1?: number } | undefined
  >(undefined);
  const [liveWindow, setLiveWindow] = useState<number | undefined>(undefined);
  const [liveLastIndexes, setLiveLastIndexes] = useState<{} | undefined>(
    undefined,
  );
  const [brushSelection, setBrushSelection] = useState<Bounds | null>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  const selectTelemetryByComponentIdAndFrame =
    createSelectTelemetryByComponentIdAndFrame();

  const currentTelemetry = useSelector((state: RootState) =>
    selectTelemetryByComponentIdAndFrame(state, id, animationFrame),
  );

  const limitTelemetry = useCallback((currentTelemetry, liveLastIndexes) => {
    if (!currentTelemetry || !liveLastIndexes) return;

    let limitedTelemetry = {};
    Object.keys(liveLastIndexes).forEach(key => {
      limitedTelemetry[key] = currentTelemetry[key].slice(
        0,
        liveLastIndexes[key],
      );
    });

    return limitedTelemetry;
  }, []);

  const telemetry = isLiveMode
    ? currentTelemetry
    : limitTelemetry(currentTelemetry, liveLastIndexes);

  const brushRef = useRef(null);
  const chartHeight = isLiveMode ? '60px' : '35px';

  const resetBrush = () => {
    setBrushSelection(null);
    if (brushRef.current) {
      (brushRef.current as any).reset();
    }
  };

  useEffectAllDepsChange(() => {
    if (isLiveMode) {
      setLiveLastIndexes(undefined);
    } else if (currentTelemetry) {
      let selection = {};
      Object.keys(currentTelemetry).forEach(key => {
        selection[key] = currentTelemetry[key].length;
      });
      setLiveLastIndexes(selection);
    }
  }, [isLiveMode, currentTelemetry]);

  useEffect(() => {
    if (isLiveMode || isPropertySelectorsOpen) {
      resetBrush();
    }
  }, [isLiveMode, isPropertySelectorsOpen]);

  useAnimationFrame(() => {
    setAnimationFrame(prevFrame => prevFrame + 1);
  });

  if (isPropertySelectorsOpen) {
    return null;
  }

  if (participantIds.length === 0) {
    return <div className={styles.noData}>No participants selected</div>;
  }

  if (!telemetry) {
    return <div className={styles.noData}>No data</div>;
  }

  const allExtractedTelemetries = participantIds
    .map(participantId =>
      extractTelemetry(
        telemetry,
        participantId,
        isLiveMode ? liveWindow : undefined,
      ),
    )
    .filter(telemetry => Boolean(telemetry));

  if (allExtractedTelemetries.length === 0) {
    return <div className={styles.noData}>No data</div>;
  }

  const handleBrushChange = (domain: Bounds | null) => {
    if (!domain) return;
    setBrushSelection(domain);
  };

  const handleCustomWindow = e => {
    const { value } = e.target;

    if (value === '-') {
      setLiveWindow(value);
      return;
    }

    if (!isNaN(value)) {
      setLiveWindow(value === '' ? undefined : Number(value));
    }
  };

  const handleCustomDomain = (e, attrib: 'x0' | 'x1' | 'y0' | 'y1') => {
    const { value } = e.target;

    // Allow the value to be set as '-' temporarily
    if (value === '-') {
      setCustomDomain(prevValue => ({
        ...prevValue,
        [attrib]: value,
      }));
      return;
    }

    // Check if the value is a valid number
    if (!isNaN(value)) {
      setCustomDomain(prevValue => ({
        ...prevValue,
        [attrib]: value === '' ? undefined : Number(value),
      }));
    }
  };

  return (
    <ParentSize
      debounceTime={10}
      style={{
        height: '100%',
        width: '100%',
        marginTop: chartHeight,
      }}
    >
      {({ width, height }) => {
        if (width < 10) return null;

        const renderTooltip = (x0, x) => {
          const bisectX = bisector((d: any) => d.x).left;

          const getClosestDataPoint = telemetry => {
            const index = bisectX(telemetry, x0, 1);
            const d0 = telemetry[index - 1];
            const d1 = telemetry[index];
            let d = d0;
            if (d1 && d1.x) {
              d = x0 - d0.x > d1.x - x0 ? d1 : d0;
            }
            return d;
          };

          const mainDataPoints = allExtractedTelemetries
            .map(telemetry => getClosestDataPoint(telemetry))
            .filter(telemetry => Boolean(telemetry));

          if (!mainDataPoints || mainDataPoints.length === 0) {
            return;
          }

          const tooltip = {
            tooltipData: {
              points: mainDataPoints,
            },
            tooltipLeft: x,
            tooltipTop: yScale(mainDataPoints[0].y),
          };

          showTooltip(tooltip);
        };

        const handleMouseMove = (event: any) => {
          const { x } = localPoint(event) || { x: 0 };
          const x0 = xScale.invert(x);
          renderTooltip(x0, x);
        };

        const handleMouseLeave = () => {
          hideTooltip();
        };

        const maxHeightBottom = isLiveMode ? 70 : 46;
        const maxHeight = height - maxHeightBottom;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = maxHeight - margin.top - margin.bottom;
        const chartSeparation = isLiveMode ? 0 : 25;
        const topChartBottomMargin = isLiveMode ? 0 : 15;
        const topChartHeight = isLiveMode
          ? innerHeight + 20
          : 0.8 * innerHeight - topChartBottomMargin + 10;
        const bottomChartHeight = isLiveMode
          ? 0
          : 0.2 * innerHeight - topChartBottomMargin;

        const xDomain = getXDomain(
          isLiveMode,
          brushSelection,
          customDomain,
          allExtractedTelemetries,
        );
        const fullXDomain = getFullXDomain(allExtractedTelemetries);
        const yDomain = [
          customDomain?.y0 !== undefined && !isLiveMode
            ? customDomain.y0
            : Math.min(...allExtractedTelemetries.flat().map(d => d.y)),
          customDomain?.y1 !== undefined && !isLiveMode
            ? customDomain.y1
            : Math.max(...allExtractedTelemetries.flat().map(d => d.y)),
        ];

        const xScale = scaleLinear({
          domain: xDomain,
          range: [margin.left, innerWidth + margin.left],
        });
        const yScale = scaleLinear({
          domain: yDomain,
          range: [topChartHeight, 0],
        });

        const xBrushScale = scaleLinear({
          domain: [
            customDomain?.x0 !== undefined && !isLiveMode
              ? customDomain.x0
              : fullXDomain[0],
            customDomain?.x1 !== undefined && !isLiveMode
              ? customDomain.x1
              : fullXDomain[1],
          ],
          range: [margin.left, innerWidth + margin.left],
        });
        const yBrushScale = scaleLinear({
          domain: [
            customDomain?.y0 !== undefined && !isLiveMode
              ? customDomain.y0
              : Math.min(...allExtractedTelemetries.flat().map(d => d.y)),
            customDomain?.y1 !== undefined && !isLiveMode
              ? customDomain.y1
              : Math.max(...allExtractedTelemetries.flat().map(d => d.y)),
          ],
          range: [bottomChartHeight, 0],
        });

        const xBrushMax = Math.max(
          width - brushMargin.left + margin.left - brushMargin.right,
          margin.left,
        );
        const yBrushMax = Math.max(bottomChartHeight, 0);

        return (
          <div style={{ position: 'relative' }}>
            <svg width={width} height={height}>
              <defs>
                <clipPath id={`chartClip-${id}`}>
                  <rect
                    x={margin.left}
                    y={margin.top - 20}
                    width={innerWidth}
                    height={topChartHeight}
                  />
                </clipPath>
                <clipPath id={`brushClip-${id}`}>
                  <rect
                    x={margin.left}
                    y={0}
                    width={innerWidth}
                    height={bottomChartHeight}
                  />
                </clipPath>
              </defs>
              <g
                onMouseLeave={handleMouseLeave}
                onPointerMove={handleMouseMove}
                onPointerOver={handleMouseMove}
              >
                <rect
                  width={width}
                  height={height}
                  rx={14}
                  fill="transparent"
                />
                <GridRows
                  scale={yScale}
                  width={innerWidth}
                  stroke="white"
                  strokeOpacity={0.1}
                  pointerEvents="none"
                  left={margin.left}
                />
                <GridColumns
                  scale={xScale}
                  height={topChartHeight}
                  stroke="white"
                  strokeOpacity={0.1}
                  pointerEvents="none"
                  top={margin.top}
                />
                <g clipPath={`url(#chartClip-${id})`}>
                  {allExtractedTelemetries.map((telemetry, index) => {
                    const teamName = participants.team_name![
                      participantIds[index]
                    ].replace(/\s+/g, '');

                    return (
                      <LinePath
                        key={participantIds[index]}
                        data={telemetry}
                        x={(d: any) => xScale(d.x)}
                        y={(d: any) => yScale(d.y)}
                        stroke={getTeamColor(teamName)}
                        strokeWidth={2}
                        curve={curveStep}
                      />
                    );
                  })}
                </g>
                <AxisLeft
                  scale={yScale}
                  left={margin.left}
                  tickFormat={d => `${Math.round(Number(d))}`}
                  tickStroke="white"
                  tickLabelProps={() => ({
                    fill: 'white',
                    fontSize: 10,
                    textAnchor: 'end',
                  })}
                />
                <AxisBottom
                  scale={xScale}
                  top={topChartHeight}
                  tickFormat={d => formatTime(new Date(Number(d) * 1000))}
                  tickStroke="white"
                  tickLabelProps={() => ({
                    fill: 'white',
                    fontSize: 10,
                    textAnchor: 'middle',
                  })}
                />
              </g>

              {tooltipOpen && tooltipData && (
                <g>
                  <Line
                    from={{ x: tooltipLeft, y: 0 }}
                    to={{ x: tooltipLeft, y: topChartHeight }}
                    stroke="white"
                    strokeWidth={2}
                    pointerEvents="none"
                    strokeDasharray="5,2"
                  />
                </g>
              )}
              {!isLiveMode ? (
                <g
                  transform={`translate(0, ${
                    margin.top + topChartHeight + chartSeparation
                  })`}
                >
                  <g clipPath={`url(#brushClip-${id})`}>
                    {allExtractedTelemetries.map((telemetry, index) => {
                      const teamName = participants.team_name![
                        participantIds[index]
                      ].replace(/\s+/g, '');

                      return (
                        <LinePath
                          key={participantIds[index]}
                          data={telemetry}
                          x={(d: any) => xBrushScale(d.x)}
                          y={(d: any) => yBrushScale(d.y)}
                          stroke={getTeamColor(teamName)}
                          strokeWidth={2}
                          height={bottomChartHeight}
                          curve={curveStep}
                        />
                      );
                    })}
                  </g>
                  <Brush
                    innerRef={brushRef}
                    xScale={xBrushScale}
                    yScale={yBrushScale}
                    width={xBrushMax}
                    height={yBrushMax}
                    handleSize={8}
                    resizeTriggerAreas={['left', 'right']}
                    brushDirection="horizontal"
                    onChange={handleBrushChange}
                  />
                  <AxisBottom
                    scale={xBrushScale}
                    top={bottomChartHeight + 1}
                    tickFormat={d => formatTime(new Date(Number(d) * 1000))}
                    tickStroke="white"
                    tickLabelProps={() => ({
                      fill: 'white',
                      fontSize: 10,
                      textAnchor: 'middle',
                    })}
                  />
                </g>
              ) : null}
            </svg>
            {tooltipOpen && tooltipData && (
              <Tooltip
                top={-50}
                left={50}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  position: 'absolute',
                }}
              >
                <div>
                  {formatTime(
                    new Date(Number(tooltipData.points?.[0]?.x) * 1000),
                  )}
                </div>
                {tooltipData.points?.map((point, index) => (
                  <div key={`${point}-${index}`} className={styles.tooltipRow}>
                    <strong>
                      {participants?.player_name?.[participantIds[index]]}:
                    </strong>
                    <div>{point.y}</div>
                  </div>
                ))}
              </Tooltip>
            )}
            {isLiveMode ? (
              <div
                className={classnames(styles.analysisControls, styles.liveMode)}
              >
                <div className={styles.domainControls}>
                  <span>Live Window Size (s)</span>
                  <input
                    placeholder="Value"
                    onChange={e => handleCustomWindow(e)}
                    value={liveWindow === undefined ? '' : liveWindow}
                  />
                </div>
                <div className={styles.domainControls}>
                  <span>X Axis: Absolute Time</span>
                </div>
                {/* <Button
                  text={}
                  size="xs"
                  disabled
                  minimal
                  onClick={() =>
                    setXAxis(prevValue => {
                      if (prevValue === 'index') return 'time';
                      return 'index';
                    })
                  }
                /> */}
              </div>
            ) : (
              <div className={styles.analysisControls}>
                <div className={styles.domainControls}>
                  <span>RANGE</span>
                  {/* <input
                    placeholder="Min X"
                    onChange={e => handleCustomDomain(e, 'x0')}
                    value={customDomain === undefined ? '' : customDomain.x0}
                  />
                  <input
                    placeholder="Max X"
                    onChange={e => handleCustomDomain(e, 'x1')}
                    value={customDomain === undefined ? '' : customDomain.x1}
                  /> */}
                  <input
                    placeholder="Min Y"
                    onChange={e => handleCustomDomain(e, 'y0')}
                    value={customDomain === undefined ? '' : customDomain.y0}
                  />
                  <input
                    placeholder="Max Y"
                    onChange={e => handleCustomDomain(e, 'y1')}
                    value={customDomain === undefined ? '' : customDomain.y1}
                  />
                </div>
                <Button
                  text="Reset Brush"
                  disabled={!brushSelection}
                  size="xs"
                  minimal
                  onClick={resetBrush}
                />
              </div>
            )}
          </div>
        );
      }}
    </ParentSize>
  );
}
