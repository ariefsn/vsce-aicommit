/**
 * Trailers and generator credits the model wrote itself.
 *
 * Trailers are komit's job, not the model's (FR-9a): appendSignature renders the
 * exact lines configured in komit.signature, after generation. Anything the model
 * adds on its own is either a guess at a name and address or the CLI agent's own
 * habit -- a `claude -p` run ends a commit with `Co-Authored-By: Claude` and a PR
 * body with a "Generated with" line -- so it is dropped before the text is shown.
 */
const ATTRIBUTION = [
	/^co[-\s]?authored[-\s]?by:/i,
	/^signed[-\s]?off[-\s]?by:/i,
	/^generated (?:with|by)\b/i,
	/^(?:created|written) (?:with|by) \[?(?:claude|codex|gemini|opencode)\b/i,
];

/**
 * Leading emoji and symbols only: the credit arrives as "🤖 Generated with ...".
 * List markers are deliberately left in place, so a body bullet like
 * "- Generated with esbuild" is still a bullet and never reads as a credit.
 */
const DECORATION = /^[\p{Extended_Pictographic}\p{S}️‍\s]+/u;

export function isAttribution(line: string): boolean {
	const text = line.trim().replace(DECORATION, '');
	return ATTRIBUTION.some(marker => marker.test(text));
}

/**
 * Drops attribution lines, leaving fenced blocks alone: a PR body that shows an
 * example commit message keeps whatever that example contains.
 */
export function stripAttribution(text: string): string {
	const out: string[] = [];
	let fenced = false;

	for (const line of text.split('\n')) {
		if (line.trimStart().startsWith('```')) {
			fenced = !fenced;
		}

		if (fenced || !isAttribution(line)) {
			out.push(line);
		}
	}

	// A dropped footer leaves the blank line that separated it behind.
	return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
}
