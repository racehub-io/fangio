export function extractTelemetry(telemetry, participantId, valueWindow?) {
  if (!telemetry[participantId]) return;

  return valueWindow === undefined
    ? telemetry[participantId]
    : telemetry[participantId].filter(data => {
        const lastPosition = telemetry[participantId].length - 1;
        return data.x >= telemetry[participantId][lastPosition].x - valueWindow;
      });
}

export function takeLastN<T>(arr: T[], N: number): T[] {
  if (N >= arr.length) {
    return arr;
  }
  return arr.slice(arr.length - N);
}

export const getTeamColor = teamName => {
  const teamColors = {
    AstonMartin: '#98FF98',
    McLaren: '#FFDAB9',
    AlfaRomeo: '#F08080',
    Mercedes: '#80CBC4',
    Ferrari: '#FFA07A',
    Williams: '#87CEEB',
    Alpine: '#77B5FE',
    AlphaTauri: '#CCCCFF',
    Haas: '#FFC0CB',
    RedBullRacing: '#E6E6FA',
  };
  return teamColors[teamName] || '#FFFFFF'; // Default to white if team not found
};

export const getXDomain = (
  isLiveMode,
  brushSelection,
  customDomain,
  allExtractedTelemetries,
) => {
  let x0, x1, firstParticipantTelemetry, xValues;

  if (
    isLiveMode ||
    customDomain?.x0 === undefined ||
    customDomain?.x1 === undefined
  ) {
    firstParticipantTelemetry = allExtractedTelemetries[0];
    xValues = firstParticipantTelemetry.map(d => d.x);
  }

  if (isLiveMode) {
    return [Math.min(...xValues), Math.max(...xValues)];
  }

  if (brushSelection) {
    return [brushSelection.x0, brushSelection.x1];
  }

  if (customDomain?.x0 !== undefined) {
    x0 = customDomain.x0;
  } else {
    x0 = Math.min(...xValues);
  }

  if (customDomain?.x1 !== undefined) {
    x1 = customDomain.x1;
  } else {
    x1 = Math.max(...xValues);
  }

  return [x0, x1];
};

export const getFullXDomain = allExtractedTelemetries => {
  const firstParticipantTelemetry = allExtractedTelemetries[0];
  const xValues = firstParticipantTelemetry.map(d => d.x);

  return [Math.min(...xValues), Math.max(...xValues)];
};
