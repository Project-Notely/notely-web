module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type enum
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only changes
        "style", // Changes that do not affect the meaning of the code
        "refactor", // Code change that neither fixes a bug nor adds a feature
        "perf", // Code change that improves performance
        "test", // Adding missing tests or correcting existing tests
        "chore", // Changes to the build process or auxiliary tools
        "ci", // Changes to CI configuration files and scripts
        "build", // Changes that affect the build system or external dependencies
        "revert", // Reverts a previous commit
        "deps", // Dependency updates
        "deps-dev", // Dev dependency updates
      ],
    ],
    // Subject case
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],
    // Subject length
    "subject-max-length": [2, "always", 72],
    "subject-min-length": [2, "always", 3],
    // Body settings
    "body-leading-blank": [2, "always"],
    "body-max-line-length": [2, "always", 100],
    // Footer settings
    "footer-leading-blank": [2, "always"],
    "footer-max-line-length": [2, "always", 100],
  },
  helpUrl:
    "https://github.com/conventional-changelog/commitlint/#what-is-commitlint",
};
