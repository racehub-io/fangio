type Panel = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static: boolean;
  resizeHandles: string[];
};

export const createPanel = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  staticPanel: boolean = false,
): Panel => ({
  i: id,
  x,
  y,
  w,
  h,
  static: staticPanel,
  resizeHandles: ['se'],
});

export const initialLayout = {
  lg: [
    createPanel('recorder_0', 8, 0, 4, 7),
    ...Array.from({ length: 4 }, (_, i) =>
      createPanel(`value-display_${i}`, 2 * i, 0, 2, 2),
    ),
    ...Array.from({ length: 2 }, (_, i) =>
      createPanel(`line-chart_${i + 1}`, 0, 4 * (i + 1) + 4, 8, 4),
    ),
    ...Array.from({ length: 2 }, (_, i) =>
      createPanel(`line-chart_${i + 3}`, 0, 4 * (i + 3) + 4, 12, 4),
    ),
  ],
};

export const getInitialCanvas = () => [
  'recorder_0',
  ...Array.from({ length: 4 }, (_, i) => `value-display_${i}`),
  ...Array.from({ length: 4 }, (_, i) => `line-chart_${i + 1}`),
];
