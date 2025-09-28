// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Declare svelte-icons modules
declare module 'svelte-icons/io/*.svelte' {
	import { SvelteComponentTyped } from 'svelte';
	export default class extends SvelteComponentTyped<{}> { }
}

declare module 'svelte-icons/fa/*.svelte' {
	import { SvelteComponentTyped } from 'svelte';
	export default class extends SvelteComponentTyped<{}> { }
}

export { };
