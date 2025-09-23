# Testing Guide

This project includes a comprehensive testing setup with unit tests and end-to-end tests.

## Test Structure

```
tests/
├── unit/                    # Unit tests (Jest)
│   ├── CreateParticipantDto.test.ts
│   └── participationValidation.test.ts
└── e2e/                     # End-to-end tests (Playwright)
    └── participation-app.spec.ts
```

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

## Test Coverage

The project has comprehensive test coverage for:

### Unit Tests

- **DTO Validation**: Tests for `CreateParticipantDto` with various validation scenarios
- **Business Logic**: Tests for participation validation functions
- **Error Handling**: Tests for database errors and edge cases

### End-to-End Tests

- **Page Loading**: Tests that the application loads correctly
- **Form Interactions**: Tests form submission and validation
- **Responsive Design**: Tests mobile responsiveness
- **User Workflows**: Tests complete user journeys

## Test Configuration

### Jest Configuration

- **Framework**: Jest with Next.js integration
- **Environment**: jsdom for React testing
- **Coverage**: 70% threshold for branches, functions, lines, and statements
- **Path Mapping**: `@/` maps to `src/` directory

### Playwright Configuration

- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:3000`
- **Auto-start**: Development server starts automatically
- **Parallel**: Tests run in parallel for faster execution

## Writing Tests

### Unit Test Example

```typescript
describe("CreateParticipantDto", () => {
  it("should pass validation with valid data", async () => {
    const dto = new CreateParticipantDto();
    dto.firstName = "John";
    dto.lastName = "Doe";
    dto.participation = 50;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
```

### E2E Test Example

```typescript
test("should load the homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Participation App/);
});
```

## Best Practices

1. **Unit Tests**: Test individual functions and components in isolation
2. **Mocking**: Use Jest mocks for external dependencies
3. **Coverage**: Aim for high test coverage on critical business logic
4. **E2E Tests**: Test complete user workflows and interactions
5. **Responsive**: Test on multiple screen sizes and devices
6. **Performance**: Keep tests fast and reliable

## CI/CD Integration

Tests are automatically run in GitHub Actions:

- **Unit tests**: Run on every push and PR
- **E2E tests**: Run on main branch deployments
- **Coverage**: Reported to maintain quality standards

## Debugging Tests

### Jest Debugging

```bash
# Run specific test file
npm test tests/unit/CreateParticipantDto.test.ts

# Run with verbose output
npm test -- --verbose
```

### Playwright Debugging

```bash
# Run with UI for debugging
npm run test:e2e:ui

# Run specific test
npx playwright test tests/e2e/participation-app.spec.ts
```

## Test Data

- **Mock Data**: Tests use consistent mock data for reliability
- **Database**: Tests use in-memory database or mocks
- **Environment**: Tests run in isolated environments
- **Cleanup**: Tests clean up after themselves

## Continuous Improvement

- **Regular Updates**: Keep testing dependencies updated
- **New Features**: Add tests for new functionality
- **Performance**: Monitor test execution time
- **Coverage**: Maintain high coverage standards
