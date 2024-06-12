<script lang="ts">
	import { displayTallyTable } from '$lib/services';
	import { currentView, meetingData } from '$lib/store';
	import type { MeetingLocations } from '$lib/types';
	import { onMount } from 'svelte';
	import { Loader } from '@googlemaps/js-api-loader';

	let meetings: MeetingLocations[] = [];
	let calculatedMarkers: { matched: boolean; matches: MeetingLocations[]; object: MeetingLocations; coords: google.maps.Point | null }[] = [];
	let inDraw = false;
	let whatADrag = false;
	const m_icon_image_single = 'images/NAMarkerB.png';
	const m_icon_image_multi = 'images/NAMarkerR.png';
	meetingData.subscribe((value) => {
		meetings = value;
	});

	let map: google.maps.Map;
	let mapElement: HTMLElement;
	let mapMarkers: google.maps.Marker[] = [];

	const showTable = () => {
		displayTallyTable();
		currentView.set('default');
	};

	const setUpMapControls = (map: google.maps.Map) => {
		const centerControlDiv = document.createElement('div');
		centerControlDiv.id = 'centerControlDiv';
		centerControlDiv.className = 'centerControlDiv';

		const toggleButton = document.createElement('input');
		toggleButton.type = 'button';
		toggleButton.value = 'Show Table Display';
		toggleButton.className = 'showTableButton';
		toggleButton.addEventListener('click', showTable);
		centerControlDiv.appendChild(toggleButton);

		map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
	};

	const initMap = async (map: google.maps.Map) => {
		setUpMapControls(map);
		google.maps.event.addListener(map, 'zoom_changed', () => recalculateOverlaps());
		google.maps.event.addListener(map, 'bounds_changed', () => displayMeetingMarkers());
		google.maps.event.addListener(map, 'dragstart', () => {
			whatADrag = true;
		});
		google.maps.event.addListener(map, 'idle', () => handleIdle());
	};

	const handleIdle = () => {
		if (map && map.getBounds()) {
			if (whatADrag) {
				whatADrag = false;
				displayMeetingMarkers();
			}
		}

		whatADrag = false;
	};

	const sFromLatLngToPixel = (inLatLng: google.maps.LatLng) => {
		let ret = null;

		if (map) {
			const latLngBounds = map.getBounds();
			if (latLngBounds) {
				const div = map.getDiv();
				if (div) {
					const pixelWidth = div.offsetWidth;
					const pixelHeight = div.offsetHeight;
					const northWestCorner = new google.maps.LatLng(latLngBounds.getNorthEast().lat(), latLngBounds.getSouthWest().lng());
					const lngWidth = latLngBounds.getNorthEast().lng() - latLngBounds.getSouthWest().lng();
					const latHeight = latLngBounds.getNorthEast().lat() - latLngBounds.getSouthWest().lat();

					const pixelsPerDegree = pixelWidth > pixelHeight ? pixelWidth / lngWidth : pixelHeight / latHeight;

					const offsetVert = northWestCorner.lat() - inLatLng.lat();
					const offsetHoriz = inLatLng.lng() - northWestCorner.lng();

					ret = new google.maps.Point(Math.round(offsetHoriz * pixelsPerDegree), Math.round(offsetVert * pixelsPerDegree));
				}
			}
		}

		return ret;
	};

	const sMapOverlappingMarkers = (meetings: MeetingLocations[]) => {
		const tolerance = 10; // This is how many pixels we allow.
		const tmp: { matched: boolean; matches: MeetingLocations[]; object: MeetingLocations; coords: google.maps.Point | null }[] = [];

		meetings.forEach((meeting, c) => {
			tmp[c] = {
				matched: false,
				matches: [],
				object: meeting,
				coords: sFromLatLngToPixel(new google.maps.LatLng(meeting.latitude, meeting.longitude))
			};
		});

		tmp.forEach((meeting) => {
			if (!meeting.matched) {
				meeting.matched = true;
				meeting.matches = [meeting.object];

				tmp.forEach((innerMeeting) => {
					if (!innerMeeting.matched && meeting && innerMeeting) {
						const outerCoords = meeting.coords;
						const innerCoords = innerMeeting.coords;

						if (outerCoords && innerCoords) {
							const xmin = outerCoords.x - tolerance;
							const xmax = outerCoords.x + tolerance;
							const ymin = outerCoords.y - tolerance;
							const ymax = outerCoords.y + tolerance;

							// We have an overlap.
							if (innerCoords.x >= xmin && innerCoords.x <= xmax && innerCoords.y >= ymin && innerCoords.y <= ymax) {
								meeting.matches?.push(innerMeeting.object);
								innerMeeting.matched = true;
							}
						}
					}
				});
			}
		});

		return tmp.filter((meeting) => meeting.matches);
	};

	const displayMeetingMarkers = () => {
		if (map && map.getBounds()) {
			if (!calculatedMarkers.length) {
				calculatedMarkers = sMapOverlappingMarkers(meetings);
			}

			while (mapMarkers.length) {
				mapMarkers.pop()?.setMap(null);
			}

			if (!whatADrag && !inDraw) {
				calculatedMarkers.forEach((objectItem) => {
					const marker = displayMeetingMarkerInResults(objectItem.matches);
					if (marker) {
						mapMarkers.push(marker);
					}
				});
			}
		}
	};

	const displayMeetingMarkerInResults = (inMtgObjArray: MeetingLocations[]) => {
		if (inMtgObjArray && inMtgObjArray.length) {
			const bounds = map.getBounds();
			const mainPoint = new google.maps.LatLng(inMtgObjArray[0].latitude, inMtgObjArray[0].longitude);

			if (bounds && bounds.contains(mainPoint)) {
				const displayedImage = inMtgObjArray.length === 1 ? m_icon_image_single : m_icon_image_multi;
				const newMarker = new google.maps.Marker({
					position: mainPoint,
					map: map,
					icon: displayedImage
				});

				return newMarker;
			}
		}

		return null;
	};

	const recalculateOverlaps = () => {
		if (map && map.getBounds()) {
			calculatedMarkers = [];
			displayMeetingMarkers();
		}
	};

	onMount(async () => {
		const thing = 'QUl6YVN5QzRkMWNqX2ZRbVR1SDVJbTZoSkJXelRVWjNxZ2wzQjZF';
		const loader = new Loader({
			apiKey: window.atob(thing),
			version: 'quarterly',
			libraries: ['places', 'marker']
		});

		const { Map } = await loader.importLibrary('maps');
		await google.maps.importLibrary('marker');

		mapElement = document.getElementById('map') as HTMLElement;

		if (mapElement) {
			map = new Map(mapElement, {
				center: { lat: 0, lng: 0 },
				zoom: 3,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
				zoomControl: true,
				mapTypeControl: true,
				scaleControl: true,
				mapId: 'sdle',
				gestureHandling: 'greedy'
			});

			await initMap(map);
		}
	});
</script>

<div id="map" style="height: 500px;"></div>
