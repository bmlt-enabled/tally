export interface ServerInfo {
	version: string;
	versionInt: string;
	langs: string;
	nativeLang: string;
	centerLongitude: string;
	centerLatitude: string;
	centerZoom: string;
	defaultDuration: string;
	regionBias: string;
	charSet: string;
	distanceUnits: string;
	semanticAdmin: string;
	emailEnabled: string;
	emailIncludesServiceBodies: string;
	changesPerMeeting: string;
	meeting_states_and_provinces: string;
	meeting_counties_and_sub_provinces: string;
	available_keys: string;
	google_api_key: string;
	dbVersion: string;
	dbPrefix: string;
	meeting_time_zones_enabled: string;
	phpVersion: string;
	auto_geocoding_enabled: boolean;
	commit: string;
	default_closed_status: boolean;
	aggregator_mode_enabled: boolean;
}

export interface ServiceBody {
	id: string;
	parent_id: string;
	name: string;
	description: string;
	type: string;
	url: string;
	helpline: string;
	world_id: string;
	contact_email: string;
}

export interface Meeting {
	id_bigint: string;
	meeting_name: string;
	longitude?: string;
	latitude?: string;
}

export interface MeetingLocations {
	longitude: number;
	latitude: number;
}

export interface Root {
	root_server_url: string;
	name: string;
	num_zones: number;
	num_regions: number;
	num_areas: number;
	num_groups: number;
	num_total_meetings: number;
	num_in_person: number;
	num_virtual: number;
	num_hybrid: number;
	num_unknown: number;
	server_info: string;
	id?: string;
}

export interface AggregatorRoot {
	id: number;
	sourceId: number;
	name: string;
	url: string;
	statistics: {
		serviceBodies: {
			numZones: number;
			numRegions: number;
			numAreas: number;
			numGroups: number;
		};
		meetings: {
			numTotal: number;
			numInPerson: number;
			numVirtual: number;
			numHybrid: number;
			numUnknown: number;
		};
	};
	serverInfo: string;
	lastSuccessfulImport: string;
	root_server_url: string;
}

export interface Reports {
	byRootServerVersions: {
		[version: string]: number;
	};
}

export interface Tally {
	knownTotal: number;
	meetingsCount: number;
	groupsCount: number;
	areasCount: number;
	regionsCount: number;
	zonesCount: number;
	serversCount: number;
	serviceBodiesCount: number;
	filteredRoots: Root[];
	roots: AggregatorRoot[];
	reports: Reports;
}
