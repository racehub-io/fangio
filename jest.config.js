module.exports = {
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'babel-jest',
      { configFile: './babel.config.js' },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(d3-array|d3-shape|d3-time-format|@visx|react-redux|d3-.*|internmap)/)',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^store/(.*)$': '<rootDir>/src/store/$1',
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^types$': '<rootDir>/src/types',
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleDirectories: ['node_modules', 'src'],
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
};
