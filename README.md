# Fangio

RaceHub is free software maintained by the community. All analyser and recorder features are available without payment.

## Development

- `yarn install --immutable`
- `yarn start`
- Open `/analyser`. No account or cloud settings are needed for local use.
- Start the RaceHub client on the same computer. Fangio connects to `ws://localhost:8082`.
- Use the existing view import and export controls to keep layouts locally.

### Optional cloud features

Accounts and team management use Firebase Authentication and Firestore.
Configure your own Firebase project to use these features.
Cloud hosting and storage costs depend on your provider.
Protect user data with Firestore rules before you expose a hosted instance.

Set `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_AUTH_DOMAIN`,
`REACT_APP_FIREBASE_PROJECT_ID`, `REACT_APP_FIREBASE_STORAGE_BUCKET`,
`REACT_APP_FIREBASE_MESSAGING_SENDER_ID`, and `REACT_APP_FIREBASE_APP_ID`
for your Firebase project. Set `REACT_APP_FIREBASE_DATABASE_URL` and
`REACT_APP_FIREBASE_MEASUREMENT_ID` if your project uses them.

Set `REACT_APP_CLIENT_DOWNLOAD_URL` to an approved public installer URL.
The download menu stays hidden when its URL is absent.
React includes these values in the browser bundle. Do not use server secrets.

The source export excludes the recorded telemetry and cover video.
The app starts with no telemetry. Deployment workflows were removed.

### Community maintenance

Report bugs and propose changes through GitHub issues and pull requests.
Read the [contribution guide](CONTRIBUTING.md), [security policy](SECURITY.md),
and [licensing notes](LICENSING.md). Third-party code keeps its existing licences.
There is no payment service or paid feature tier.

### Useful docs

- [Branching Strategy](docs/Branching Strategy.md)

## TO DO

- [ ] Fix bug where resizing grids that are on the middle/right expands much larger than the box to be resized
- [ ] Add lap chart display
- [ ] Add safety car display
- [ ] Add track status display
- [ ] Add table display
- [ ] Move recorder to nav menu + colour for recorder
- [ ] Consume proto file
- [ ] Handle NaN or missing channels from telem data
