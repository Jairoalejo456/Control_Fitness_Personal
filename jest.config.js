module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/src/logic/**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
