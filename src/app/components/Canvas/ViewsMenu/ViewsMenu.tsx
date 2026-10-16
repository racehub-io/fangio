import React, { useRef } from 'react';
import { Menu } from 'app/components/Menu';
import { RACEHUB_LAYOUT, useDispatch } from 'store/context';
import { RESTORE_CANVAS } from 'store/race/actions';
import { getInitialCanvas, initialLayout } from '../config';

export function ViewsMenu() {
  const { dispatch } = useDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const downloadLocalStateAsJson = () => {
    const localState = localStorage.getItem(RACEHUB_LAYOUT);

    if (!localState) {
      console.error('No local state found in localStorage');
      return;
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(now.getFullYear()).slice(-2); // Get last two digits of the year

    const dateTime = `${day}-${month}-${year}`;

    // Create a blob with the localState data
    const blob = new Blob([localState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `Canvas View ${dateTime}.rhview`;

    // Append the link to the document body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the object URL to free up memory
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const loadedState = JSON.parse(e.target?.result as string);

        console.log(loadedState);

        dispatch({
          type: RESTORE_CANVAS,
          canvas: loadedState.canvas,
          layout: loadedState.layouts,
        });
      } catch (error) {
        console.error('Error loading canvas view:', error);
        alert('Failed to load canvas view. Please check the file format.');
      }
    };

    reader.readAsText(file);
  };

  const resetViews = () => {
    dispatch({
      type: RESTORE_CANVAS,
      canvas: getInitialCanvas(),
      layout: initialLayout,
    });
  };

  return (
    <div>
      <Menu
        label={'Views'}
        options={[
          {
            label: 'Save View',
            action: () => downloadLocalStateAsJson(),
          },
          {
            label: 'Load View',
            action: () => fileInputRef.current?.click(),
          },
          {
            label: 'Reset to Default',
            action: () => resetViews(),
          },
        ]}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept=".rhview"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
}
