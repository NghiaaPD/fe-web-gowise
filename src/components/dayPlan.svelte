<script lang="ts">
  import { onMount, tick, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import Map from "ol/Map";
  import View from "ol/View";
  import TileLayer from "ol/layer/Tile";
  import OSM from "ol/source/OSM";
  import VectorLayer from "ol/layer/Vector";
  import VectorSource from "ol/source/Vector";
  import Feature from "ol/Feature";
  import Point from "ol/geom/Point";
  import { fromLonLat } from "ol/proj";
  import { Style, Icon } from "ol/style";

  // Props
  export let dayData: any = {};
  export let dayNumber: number = 1;

  let mapContainer: HTMLDivElement;
  let map: Map | undefined;

  // Color palette (kept as variables for maintainability)
  const COLORS: Record<string, string> = {
    restaurants: "#ff6b6b",
    "tourist attractions": "#4ecdc4",
    parks: "#45b7d1",
    mountains: "#96ceb4",
    default: "#74b9ff",
  };

  function getCategoryColor(category: string): string {
    return COLORS[category] || COLORS.default;
  }

  function formatTime(timeString: string): string {
    return timeString || "";
  }

  function getActivitiesInOrder(dayData: any): any[] {
    const timeOrder = ["morning", "lunch", "afternoon", "dinner"];
    return timeOrder
      .map((period) => ({ period, ...dayData[period] }))
      .filter((activity) => activity && activity.activity);
  }

  // Initialize map with OpenLayers
  async function initMap(): Promise<void> {
    await tick();
    if (!mapContainer) return;

    // Dispose existing map if any
    if (map) {
      map.setTarget(undefined);
      map.dispose();
      map = undefined;
    }

    // Clear any existing content
    mapContainer.innerHTML = "";

    const activities = getActivitiesInOrder(dayData);
    const features: Feature[] = [];

    for (const activity of activities) {
      let lat = activity.coordinates?.latitude;
      let lng = activity.coordinates?.longitude;

      // If no coordinates, try to geocode from location
      if (!lat || !lng) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(activity.location)}`
          );
          const data = await response.json();
          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat);
            lng = parseFloat(data[0].lon);
          }
        } catch (error) {
          console.error("Geocoding failed for", activity.location, error);
          continue;
        }
      }

      if (lat && lng) {
        const feature = new Feature({
          geometry: new Point(fromLonLat([lng, lat])),
          activity: activity,
        });

        const color = getCategoryColor(activity.category);
        feature.setStyle(
          new Style({
            image: new Icon({
              src:
                "data:image/svg+xml;base64," +
                btoa(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" fill="${color}" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
              </svg>
            `),
              scale: 0.8,
            }),
          })
        );

        features.push(feature);
      }
    }

    const vectorSource = new VectorSource({
      features: features,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    map = new Map({
      target: mapContainer,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([105.8342, 21.0278]), // Default to Hanoi
        zoom: 12,
      }),
    });

    // Fit view to features if any
    if (features.length > 0) {
      const extent = vectorSource.getExtent();
      map.getView().fit(extent, { padding: [20, 20, 20, 20], maxZoom: 15 });
    } else {
      // No locations, show placeholder
      mapContainer.innerHTML = `
        <div class=\"map-placeholder\">
          <div class=\"map-card\">
            <svg width=\"56\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
              <path d=\"M3 7v13l6-2 6 2 6-4V3l-6 2-6-2L3 7z\" stroke=\"#9fbfdc\" stroke-width=\"0.8\" fill=\"#e6f2fb\"/>
              <circle cx=\"8\" cy=\"9\" r=\"1.6\" fill=\"#ff6b6b\"/>
              <circle cx=\"16\" cy=\"11\" r=\"1.2\" fill=\"#4ecdc4\"/>
            </svg>
            <div class=\"map-text\">
              <div class=\"map-title\">No locations to display</div>
              <div class=\"map-sub\">Add activities with locations to see the map</div>
            </div>
          </div>
        </div>
      `;
      return;
    }
  }

  // re-init when data changes
  $: if (dayData) {
    initMap();
  }

  onDestroy(() => {
    if (map) {
      map.dispose();
    }
  });
</script>

<div class="day-plan-container" aria-label="Day plan for day {dayNumber}">
  <!-- Left Side - Schedule -->
  <div class="schedule-section">
    <div class="day-header">
      <h2 class="day-title">Day {dayNumber}</h2>
      <span class="day-activities-count" aria-live="polite"
        >{getActivitiesInOrder(dayData).length} activities</span
      >
    </div>
    <div class="activities-list">
      {#each getActivitiesInOrder(dayData) as activity (activity.activity)}
        <div
          class="activity-card"
          tabindex="0"
          role="button"
          aria-label="{activity.period || 'activity'}: {activity.activity}"
          style="--accent: {getCategoryColor(
            activity.category
          )}; border-left-color: var(--accent)"
          in:fade={{ duration: 220 }}
        >
          <div class="activity-main">
            <div class="left">
              <span
                class="activity-category-icon"
                style="background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0.02)); border-color: var(--accent);"
                aria-hidden="true"
              >
                <!-- Inline SVG variants per category -->
                {#if activity.category === "restaurants"}
                  <!-- lucide utensils SVG provided by user, stroke uses currentColor so it follows --accent -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    aria-hidden="true"
                    focusable="false"
                    style="color: var(--accent);"
                  >
                    <path
                      d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      fill="none"
                    />
                    <path
                      d="M7 2v20"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      fill="none"
                    />
                    <path
                      d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      fill="none"
                    />
                  </svg>
                {:else if activity.category === "tourist attractions"}
                  <!-- camera -->
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="6"
                      width="18"
                      height="13"
                      rx="2"
                      fill="var(--accent)"
                      opacity="0.14"
                    ></rect>
                    <path
                      d="M7 6l1.5-2h7L18 6"
                      fill="none"
                      stroke="var(--accent)"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <circle cx="12" cy="12.5" r="3" fill="var(--accent)"
                    ></circle>
                    <circle cx="12" cy="12.5" r="1.4" fill="#fff"></circle>
                  </svg>
                {:else if activity.category === "parks"}
                  <!-- tree -->
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3c-2 2-4 2-6 5 2 0 1 2 1 2H6c0 1 2 1 2 2H8c0 1 3 1 4 1s4 0 4-1h-1c0-1 2-1 2-2h-1s-1-2 1-2c-2-3-4-3-6-5z"
                      fill="var(--accent)"
                    ></path>
                    <rect x="11" y="17" width="2" height="4" fill="#7a5230"
                    ></rect>
                  </svg>
                {:else if activity.category === "mountains"}
                  <!-- lucide mountain-snow SVG provided by user, using currentColor so it follows --accent -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    aria-hidden="true"
                    focusable="false"
                    style="color: var(--accent);"
                  >
                    <path
                      d="m8 3 4 8 5-5 5 15H2L8 3z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      fill="none"
                    />
                    <path
                      d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      fill="none"
                    />
                  </svg>
                {:else}
                  <!-- lucide map-pin SVG provided by user, using currentColor so it follows --accent -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    aria-hidden="true"
                    focusable="false"
                    style="color: var(--accent);"
                  >
                    <path
                      d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      fill="none"
                    />
                    <circle
                      cx="12"
                      cy="10"
                      r="3"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                  </svg>
                {/if}
              </span>
            </div>
            <div class="content">
              <div class="title-row">
                <div class="title">{activity.activity || ""}</div>
                <div class="activity-period">
                  {activity.period
                    ? activity.period.charAt(0).toUpperCase() +
                      activity.period.slice(1)
                    : ""}
                </div>
              </div>
              <div class="meta">
                <div class="meta-item">
                  <span class="icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                        fill="#64748b"
                      ></path>
                    </svg>
                  </span>
                  <span class="meta-text">{activity.location || ""}</span>
                </div>
                <div class="meta-item">
                  <span class="icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="#64748b"
                        stroke-width="1.2"
                        fill="none"
                      ></circle>
                      <path
                        d="M12 7v5l3 1"
                        stroke="#64748b"
                        stroke-width="1.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        fill="none"
                      ></path>
                    </svg>
                  </span>
                  <span class="meta-text">{formatTime(activity.time)}</span>
                </div>
                {#if activity.rating}
                  <div class="meta-item rating">
                    <span class="icon small">
                      <svg
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 .587l3.668 7.431L23.2 9.75l-5.6 5.458L18.336 24 12 19.897 5.664 24l.736-8.792L.8 9.75l7.532-1.732L12 .587z"
                          fill="#f97316"
                        ></path>
                      </svg>
                    </span>
                    <span class="meta-text highlight">{activity.rating}/5</span>
                  </div>
                {/if}
              </div>
              <div class="activity-category">
                {activity.category || "Unknown"}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Right Side - Map -->
  <div class="map-section">
    <div class="map-header">
      <h3 class="map-title">Locations Map</h3>
      <div class="map-legend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: #ff6b6b;"></div>
          <span>Restaurants</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #4ecdc4;"></div>
          <span>Attractions</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #45b7d1;"></div>
          <span>Parks</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #96ceb4;"></div>
          <span>Mountains</span>
        </div>
      </div>
    </div>

    <div class="map-container" bind:this={mapContainer}>
      <!-- Map will be initialized here -->
    </div>
  </div>
</div>

<style>
  .day-plan-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    width: 100%;
    min-height: 560px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(2, 6, 23, 0.06);
    overflow: hidden;
  }

  /* Left Side - Schedule */
  .schedule-section {
    padding: 28px;
    overflow-y: auto;
    border-right: 1px solid #eef2f6;
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  }

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f4f6f8;
  }

  .day-title {
    font-size: 1.7rem;
    font-weight: 700;
    color: #16324f;
    margin: 0;
  }

  .day-activities-count {
    background: rgba(14, 165, 233, 0.08); /* soft light */
    color: #0ea5e9; /* sky-500 */
    padding: 6px 12px;
    border-radius: 9999px;
    font-size: 0.84rem;
    font-weight: 600;
  }

  .activities-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-right: 8px;
  }

  .activity-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 12px;
    padding: 14px;
    border-left: 4px solid var(--accent, #0ea5e9);
    transition:
      transform 220ms ease,
      box-shadow 220ms ease,
      border-color 220ms ease;
    outline: none;
  }

  .activity-card:focus {
    box-shadow: 0 6px 28px rgba(16, 24, 40, 0.08);
    transform: translateY(-4px);
  }

  .activity-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 24, 40, 0.06);
  }

  .activity-main {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .activity-category-icon {
    width: 46px;
    height: 46px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: white;
    border: 2px solid rgba(0, 0, 0, 0.03);
    flex-shrink: 0;
  }

  /* ensure svg icons scale */
  .activity-category-icon :global(svg),
  .icon :global(svg) {
    width: 22px;
    height: 22px;
    display: block;
  }

  .content {
    flex: 1;
  }

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .title {
    font-weight: 700;
    color: #102a43;
    font-size: 1.02rem;
    line-height: 1.25;
  }

  .activity-period {
    background: rgba(2, 6, 23, 0.04);
    color: #123;
    padding: 6px 10px;
    border-radius: 9999px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .meta {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    gap: 8px;
    align-items: center;
    color: #475569;
    font-size: 0.875rem;
  }

  .meta-item .icon :global(svg) {
    width: 14px;
    height: 14px;
  }

  .meta-item.rating .small :global(svg) {
    width: 12px;
    height: 12px;
  }

  .meta-text {
    color: #475569;
    font-size: 0.88rem;
  }

  .highlight {
    color: #f97316;
    font-weight: 700;
  }

  .activity-category {
    margin-top: 8px;
    font-size: 0.8rem;
    color: #6b7280;
    font-style: italic;
  }

  /* Right Side - Map */
  .map-section {
    display: flex;
    flex-direction: column;
    background: #fafbfc;
  }

  .map-header {
    padding: 22px 22px 14px 22px;
    border-bottom: 1px solid #eef2f6;
    background: linear-gradient(180deg, #ffffff, #fbfdff);
  }

  .map-title {
    font-size: 1.12rem;
    font-weight: 700;
    color: #16324f;
    margin: 0 0 12px 0;
  }

  .map-legend {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #475569;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(16, 24, 40, 0.06);
  }

  .map-container {
    flex: 1;
    padding: 22px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  }

  :global(.map-placeholder) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.map-card) {
    display: flex;
    gap: 14px;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #f6f9fc, #ffffff);
    border: 1px solid #eef4fb;
    padding: 30px;
    border-radius: 10px;
    width: 100%;
    max-width: 620px;
    height: 320px;
    color: #6b7280;
    box-shadow: 0 6px 20px rgba(16, 24, 40, 0.04);
  }

  .map-title {
    font-weight: 700;
    color: #1f2937;
  }
  :global(.map-text) {
    text-align: left;
  }
  :global(.map-sub) {
    font-size: 0.86rem;
    color: #94a3b8;
    margin-top: 6px;
  }

  /* Responsive Design */
  @media (max-width: 920px) {
    .day-plan-container {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    .schedule-section {
      border-right: none;
      border-bottom: 1px solid #eef2f6;
    }
    :global(.map-card) {
      height: 260px;
    }
  }

  @media (max-width: 480px) {
    .schedule-section,
    .map-header {
      padding: 16px;
    }
    .day-title {
      font-size: 1.3rem;
    }
    .activity-category-icon {
      width: 40px;
      height: 40px;
    }
    :global(.map-card) {
      padding: 18px;
      height: 220px;
    }
  }
</style>
