// Conventional Commits validation. See COMMIT_GUIDELINES.md.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'docs', 'refactor', 'style', 'test']],
    'scope-enum': [1, 'always', [
      'agents', 'rules', 'commands', 'hooks', 'skills',
      'mcp', 'tooling', 'ci', 'config', 'docs',
    ]],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [0], // summaries may start with a lowercase imperative verb
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
  },
};
