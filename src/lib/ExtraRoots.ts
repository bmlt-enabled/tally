export interface ExtraRoot {
	name: string;
	root_server_url: string;
}

// Root servers that use BMLT but are not catalogued in the Aggregator, so they are queried directly.
export const ExtraRoots: ExtraRoot[] = [
	{
		name: 'NA Iran',
		root_server_url: 'https://bmlt.nairan3.org/main_server'
	}
];
