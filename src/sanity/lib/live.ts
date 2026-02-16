// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import * as NextSanity from "next-sanity";
import { client } from './client'

const defineLiveCompat = (NextSanity as any).defineLive || ((config: { client: typeof client }) => ({
  sanityFetch: config.client.fetch.bind(config.client),
  SanityLive: () => null,
}));

export const { sanityFetch, SanityLive } = defineLiveCompat({
  client,
});
