import { Menu } from 'app/components/Menu';

export function DownloadMenu(props: { className?: string }) {
  const downloadUrl = process.env.REACT_APP_CLIENT_DOWNLOAD_URL;
  if (!downloadUrl) return null;

  return (
    <Menu
      label={'Files'}
      options={[
        {
          label: 'Download RaceHub Client',
          action: () => window.open(downloadUrl),
        },
      ]}
    />
  );
}
