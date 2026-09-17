export async function fetchAniList(query: string, variables: Record<string, any> = {}) {
  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables
    }),
    next: { revalidate: 3600 } // cache for 1 hour to prevent hitting rate limits
  });

  const json = await response.json();
  if (json.errors) {
    console.error('AniList GraphQL Errors:', json.errors);
    throw new Error('Failed to fetch from AniList');
  }
  return json.data;
}
