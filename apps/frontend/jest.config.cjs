module.exports = {
  testEnvironment: 'jsdom',
  rootDir: '../../',
  roots: ['<rootDir>/packages/frontend'],
  moduleFileExtensions: ['js', 'json', 'ts', 'vue'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/apps/frontend/tsconfig.json',
        diagnostics: false,
      },
    ],
    '^.+\\.vue$': '@vue/vue3-jest',
  },
  moduleNameMapper: {
    '^@test_2/frontend-summary$': '<rootDir>/packages/frontend/summary',
    '^@test_2/frontend-inventory$': '<rootDir>/packages/frontend/inventory',
    '^@test_2/frontend-order$': '<rootDir>/packages/frontend/order',
    '^@test_2/share-types$': '<rootDir>/packages/share/types',
    '^@test_2/share-utils$': '<rootDir>/packages/share/utils',
    '^@auth0/auth0-vue$': '<rootDir>/node_modules/@auth0/auth0-vue/dist/auth0-vue.cjs.js',
  },
  transformIgnorePatterns: ['/node_modules/(?!(vue|@vue|@vue/test-utils|pinia)/)'],
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['packages/frontend/**/*.(t|j)s'],
};
