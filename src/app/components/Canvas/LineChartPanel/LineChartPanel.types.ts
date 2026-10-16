export interface Props {
  parameter: string;
  brush?: boolean;
  title?: string;
}

export interface Tooltip {
  lapDistance: number;
  tooltipLeft: number;
  tooltipTop: any;
  tooltipData: any;
  parameter: string;
  relativeTop: number;
}
