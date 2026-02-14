# Makefile for Jisaku project
# Usage:
#   make lint FILES="src/foo.ts src/bar.ts"
#   make lint-css FILES="src/foo.vue src/bar.vue"
#   make format FILES="src/foo.ts src/bar.ts"
#   make type-check-files FILES="src/foo.ts"
#   make check         # runs all on all files
#   make check-changed # runs all on changed files (git)
#   make fix     # runs all with fixes on all files
#   make fix-changed # runs all with fixes on changed files (git)
#   make test-changed  # runs tests on changed files + tests for changed source files

# Default to all files if FILES is not set
FILES ?= .
STYLELINT_FILES = $(filter %.css %.vue,$(FILES))
# Per-tool file filters
ESLINT_FILES = $(filter %.ts %.tsx %.js %.jsx %.vue,$(FILES))
PRETTIER_FILES = $(filter %.ts %.tsx %.js %.jsx %.vue %.css %.json %.md,$(FILES))
TSCFILES_FILES = $(filter %.ts %.tsx %.vue,$(FILES))

# Lint JS/TS files
lint:
	@if [ "$(FILES)" = "." ]; then pnpm lint; elif [ -n "$(ESLINT_FILES)" ]; then pnpm eslint $(ESLINT_FILES) --fix; fi

# Type-check specific files
type-check-files:
	@if [ "$(FILES)" = "." ]; then pnpm type-check; elif [ -n "$(TSCFILES_FILES)" ]; then npx vue-tsc-files $(TSCFILES_FILES); fi

# Type-check specific files (no emit, check only)
type-check-files-check:
	@if [ "$(FILES)" = "." ]; then pnpm type-check; elif [ -n "$(TSCFILES_FILES)" ]; then npx vue-tsc-files $(TSCFILES_FILES); fi

# Lint CSS/Vue files
lint-css:
	@if [ "$(FILES)" = "." ]; then pnpm lint:css; elif [ -n "$(STYLELINT_FILES)" ]; then pnpm stylelint $(STYLELINT_FILES) --fix; fi

# Format files
format:
	@if [ "$(FILES)" = "." ]; then pnpm format; elif [ -n "$(PRETTIER_FILES)" ]; then pnpm prettier --write --list-different $(PRETTIER_FILES); fi

# Lint (no fix)
lint-check:
	@if [ "$(FILES)" = "." ]; then pnpm lint:check; elif [ -n "$(ESLINT_FILES)" ]; then pnpm eslint $(ESLINT_FILES); fi

# Lint CSS (no fix)
lint-css-check:
	@if [ "$(FILES)" = "." ]; then pnpm lint:css:check; elif [ -n "$(STYLELINT_FILES)" ]; then pnpm stylelint $(STYLELINT_FILES); fi

# Format check (no write)
format-check:
	@if [ "$(FILES)" = "." ]; then pnpm format:check; elif [ -n "$(PRETTIER_FILES)" ]; then pnpm prettier --check $(PRETTIER_FILES); fi

# Check for unused files
check-unused:
	python3 find-unused-files.py

# Check for untested files
check-untested:
	python3 find-untested-files.py

# Run all checks (no type-check)
check:
	make lint-check FILES="$(FILES)" && make lint-css-check FILES="$(FILES)" && make format-check FILES="$(FILES)" && make type-check-files-check FILES="$(FILES)" && make check-unused && make check-untested

# Run all fixes (no type-check)
fix:
	make lint FILES="$(FILES)" && make lint-css FILES="$(FILES)" && make format FILES="$(FILES)" && make type-check-files FILES="$(FILES)"

# Run on changed files (git diff --name-only + untracked)
changed_files=$(shell git diff --name-only --diff-filter=ACMRTUXB && git ls-files --others --exclude-standard)

# Test files logic for changed files
# Source files that might have tests (exclude test files themselves)
source_files = $(filter-out %.test.ts %.spec.ts, $(filter %.vue %.ts %.tsx %.js %.jsx, $(changed_files)))
# Generate test files from source files (assume .test.ts extension)
test_files_from_source = $(addsuffix .test.ts, $(basename $(source_files)))
# Changed test files
changed_test_files = $(filter %.test.ts %.spec.ts, $(changed_files))
# All test files to run
test_files_to_run = $(sort $(test_files_from_source) $(changed_test_files))

check-changed:
	make check FILES="$(changed_files)"

fix-changed:
	make fix FILES="$(changed_files)"

# Run tests on changed files (including tests for changed source files)
test-changed:
	@if [ -n "$(test_files_to_run)" ]; then pnpm test $(test_files_to_run); fi

# ============================================================================
# Legacy Code Targets
# ============================================================================
# Legacy code is excluded from normal lint/check by default.
# Use these targets to explicitly lint or test legacy code.

# Lint legacy code (opt-in)
lint-legacy:
	pnpm eslint src/legacy e2e/legacy --fix

# Check legacy code (no fix)
check-legacy:
	pnpm eslint src/legacy e2e/legacy

# Run E2E tests on legacy UI
test-e2e-legacy:
	pnpm playwright test --project=legacy
