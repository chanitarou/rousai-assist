/**
 * Jest設定ファイル
 *
 * @type {import('jest').Config}
 */
export default {
    testEnvironment: 'jsdom',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/**/*.test.js',
        '!**/node_modules/**'
    ],
    testMatch: [
        '**/tests/**/*.test.js',
        '**/__tests__/**/*.js'
    ],
    transform: {},
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/js/$1'
    }
};
