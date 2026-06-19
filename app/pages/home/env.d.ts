// Ambient type for the live-data virtual module supplied by campaign-data-plugin.
declare module 'virtual:campaign-data' {
  import type { TimelineData } from '../../components/charts/_common/types.js';
  const data: TimelineData | null;
  export default data;
}
