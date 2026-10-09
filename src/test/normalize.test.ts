import * as assert from 'assert';

import { normalize } from '../normalize';

const FENCE = '```';
const GENERATED = '🤖 Generated with [Claude Code](https://claude.com/claude-code)';

suite('normalize', () => {
	test('drops a fence that wraps only the subject', () => {
		const raw = [
			FENCE,
			'fix(aiprovider,aigateway): stop edit-only models serving text-to-image',
			FENCE,
			'',
			'- Reject `/edit` models as the IMAGE capability default at input validation',
			'- Scope the pro-edit model override in the router to image-to-image only',
		].join('\n');

		assert.strictEqual(normalize(raw), [
			'fix(aiprovider,aigateway): stop edit-only models serving text-to-image',
			'',
			'- Reject `/edit` models as the IMAGE capability default at input validation',
			'- Scope the pro-edit model override in the router to image-to-image only',
		].join('\n'));
	});

	test('drops a fence that wraps the whole message', () => {
		const raw = [FENCE, 'feat(ui): add dark theme', '', '- Swap the palette', FENCE].join('\n');

		assert.strictEqual(normalize(raw), 'feat(ui): add dark theme\n\n- Swap the palette');
	});

	test('drops a preamble followed by a fence', () => {
		const raw = ['Here is the commit message:', FENCE, 'chore(deps): bump eslint', FENCE].join('\n');

		assert.strictEqual(normalize(raw), 'chore(deps): bump eslint');
	});

	test('drops a fence carrying an info string', () => {
		const raw = [`${FENCE}text`, 'docs(readme): document the prompt override', FENCE].join('\n');

		assert.strictEqual(normalize(raw), 'docs(readme): document the prompt override');
	});

	test('leaves an unfenced message alone', () => {
		const raw = 'fix(normalize): keep the subject clean\n\n- Strip the fence';

		assert.strictEqual(normalize(raw), raw);
	});

	test('keeps a fenced block inside the body', () => {
		const raw = [
			'Add a retry helper',
			'',
			'## Summary',
			'',
			'- Call it like this:',
			'',
			`${FENCE}ts`,
			'retry(fn, 3);',
			FENCE,
		].join('\n');

		assert.strictEqual(normalize(raw), raw);
	});

	test('keeps inline backticks that do not wrap the subject', () => {
		const raw = 'fix(cli): quote the `--diff` argument';

		assert.strictEqual(normalize(raw), raw);
	});

	test('drops the footer a CLI agent appends to a commit message', () => {
		const raw = [
			'feat(workspace): pick repository and confirm PR base per repository',
			'',
			'- Ask which repository to use when the workspace has more than one',
			'- Remember the last base branch keyed by repository',
			'',
			'Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>',
			GENERATED,
		].join('\n');

		assert.strictEqual(normalize(raw), [
			'feat(workspace): pick repository and confirm PR base per repository',
			'',
			'- Ask which repository to use when the workspace has more than one',
			'- Remember the last base branch keyed by repository',
		].join('\n'));
	});

	test('drops a credit sitting directly under a trailer', () => {
		const raw = [
			'fix(pr): keep old footers out of the prompt',
			'',
			'- Filter the commit bodies before rendering them',
			'Co-authored-by: Claude <noreply@anthropic.com>',
			GENERATED,
		].join('\n');

		assert.strictEqual(normalize(raw), [
			'fix(pr): keep old footers out of the prompt',
			'',
			'- Filter the commit bodies before rendering them',
		].join('\n'));
	});

	test('drops the credit from a PR description', () => {
		const raw = [
			'feat: release 1.2.0 with 40 new composables',
			'',
			'## Summary',
			'- Ships v1.2.0, adding 40 composables and the first component',
			'',
			'## Changes',
			'- Add 40 composables across state, async, browser and media',
			'',
			GENERATED,
		].join('\n');

		assert.strictEqual(normalize(raw), [
			'feat: release 1.2.0 with 40 new composables',
			'',
			'## Summary',
			'- Ships v1.2.0, adding 40 composables and the first component',
			'',
			'## Changes',
			'- Add 40 composables across state, async, browser and media',
		].join('\n'));
	});
});
