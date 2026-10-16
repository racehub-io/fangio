import { useDispatch as useReduxDispatch } from 'react-redux';
import { Menu } from 'app/components/Menu';
import { RecorderType } from 'store/client/slice/types';
import { ADD_COMPONENT } from 'store/race/actions';
import { useClientSlice } from 'store/client/slice';
import { useDispatch } from 'store/context';

function generateRandomString(): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function ComponentAdder() {
  const { dispatch } = useDispatch();
  const { actions: clientActions } = useClientSlice();
  const reduxDispatch = useReduxDispatch();

  return (
    <Menu
      label={'Components'}
      options={[
        {
          label: 'Add Recorder',
          action: () => {
            const randomisedId = `recorder_${generateRandomString()}`;
            dispatch({
              type: ADD_COMPONENT,
              payload: { id: randomisedId },
            });
            reduxDispatch(
              clientActions.addRecorder({
                recorderId: randomisedId,
                recorderType: RecorderType.F12024,
              }),
            );
          },
        },
        {
          label: 'Add Line Chart',
          action: () => {
            dispatch({
              type: ADD_COMPONENT,
              payload: { id: `line-chart_${generateRandomString()}` },
            });
          },
        },
        {
          label: 'Add Circular Map',
          action: () => {
            dispatch({
              type: ADD_COMPONENT,
              payload: { id: `circular-map_${generateRandomString()}` },
            });
          },
        },
        {
          label: 'Add Value Display',
          action: () => {
            dispatch({
              type: ADD_COMPONENT,
              payload: { id: `value-display_${generateRandomString()}` },
            });
          },
        },
        {
          label: 'Add Temperature Display',
          action: () => {
            dispatch({
              type: ADD_COMPONENT,
              payload: { id: `temperature-display_${generateRandomString()}` },
            });
          },
        },
        {
          label: 'Add Weather Display',
          action: () => {
            dispatch({
              type: ADD_COMPONENT,
              payload: { id: `weather-display_${generateRandomString()}` },
            });
          },
        },
        {
          label: 'Add Pit Tyre Wear Display',
          action: () => {
            dispatch({
              type: ADD_COMPONENT,
              payload: {
                id: `pit-tyre-wear-display_${generateRandomString()}`,
              },
            });
          },
        },
        {
          label: 'Add Tyre Temperature Display',
          action: () => {
            dispatch({
              type: ADD_COMPONENT,
              payload: {
                id: `tyre-temps-display_${generateRandomString()}`,
                width: 3,
                height: 5,
              },
            });
          },
        },
        {
          label: 'Add Lap Chart Display',
          action: () => {
            dispatch({
              type: ADD_COMPONENT,
              payload: {
                id: `lap-chart-display_${generateRandomString()}`,
              },
            });
          },
        },
        {
          label: 'Add Track Status Display (Coming Soon)',
          disabled: true,
          action: () => {},
        },
        {
          label: 'Add Safety Car Display (Coming Soon)',
          disabled: true,
          action: () => {},
        },
        {
          label: 'Add Table Display (Coming Soon)',
          disabled: true,
          action: () => {},
        },
      ]}
    />
  );
}
