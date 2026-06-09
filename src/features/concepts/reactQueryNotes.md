# React Query notes

## Why was React Query created?

React itself is good at managing client state.

Client state is data that belongs mainly to the browser UI.

Examples:

- Theme
- Modal open or closed
- Selected tab
- Form values

But modern apps also spend a lot of time managing server state.

Server state is data that lives outside React, usually in an API, database, or backend service.

Examples:

- Users
- Orders
- Products
- Transactions
- Notifications

## Why is server state difficult?

Server state is harder than normal client state because it:

- Lives on the server
- Can become stale
- May be needed by multiple components
- Needs synchronization between the UI and backend

For example, one component may show a list of products, another component may show a product count, and another page may show product details. If the backend data changes, the UI needs a reliable way to fetch, cache, refresh, and share that data.

## What problem does TanStack Query solve?

TanStack Query, also called React Query, helps manage server state.

It gives React apps tools for:

- Fetching server data
- Caching server data
- Reusing cached data across components
- Refetching stale data
- Tracking loading and error states
- Keeping UI data synchronized with backend data

In this project, `useTasks`, `useTask`, and `useColumnarTasks` use TanStack Query to fetch data from the Spring Boot backend and share cached results between the queue page and task detail page.

## Before vs. After React Query (An Example)

Imagine you want to show a list of blog posts fetched from a server.

### Before

```tsx
function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;
  return posts.map(post => <p key={post.id}>{post.title}</p>);
}
```

You must manually wire up loading, error, and the fetch itself every time.

### After

```tsx
function PostList() {
  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(res => res.json()),
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong.</p>;
  return posts.map(post => <p key={post.id}>{post.title}</p>);
}
```

React Query automatically handles loading, errors, caching, and refetching. The component just describes *what* data it needs.

---

## How It All Fits Together

Here is the mental model before diving into individual concepts.

```
Component calls useQuery
    → React Query checks its cache (QueryCache)
    → Cache hit? Return data immediately
    → Cache miss or stale? Call queryFn to fetch
    → Store result in cache under queryKey
    → Component re-renders with fresh data
```

Every concept below is just one part of this flow.

---

## Query Key

The query key is the name React Query uses to store and look up cached data.
Think of it like a label on a jar — same label means same data.

```tsx
// All posts
useQuery({ queryKey: ['posts'], queryFn: fetchPosts });

// A specific post by id
useQuery({ queryKey: ['posts', 42], queryFn: () => fetchPost(42) });

// Posts filtered by category
useQuery({ queryKey: ['posts', { category: 'tech' }], queryFn: () => fetchPosts('tech') });
```

If the key changes, React Query treats it as a different query and fetches fresh data automatically.

---

## QueryClient and QueryCache

**QueryCache** is where React Query stores all fetched data in memory.

**QueryClient** is the object you use to interact with that cache — you can read it, clear it, or tell it to refetch.

You create one at the top of your app and share it with all components via a Provider:

```tsx
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyApp />
    </QueryClientProvider>
  );
}
```

Every `useQuery` call inside `<MyApp />` shares the same cache through this provider.

---

## Typical Lifecycle of a Query

1. Component mounts → `useQuery` runs → `isLoading: true`
2. `queryFn` fires → data comes back → stored in cache → `isLoading: false`, `data` is set
3. Component unmounts → data stays in cache for a while (stale time)
4. Component mounts again → cache hit → data returned instantly, refetch happens in background
5. If refetch returns new data → component re-renders with updated data

---

## Caching and Request Deduplication

If two components on the same page both ask for the same data, React Query fetches it **once** and shares the result.

```tsx
// Component A
const { data } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });

// Component B — same key, same cache, no second network request
const { data } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
```

This is called **request deduplication**. The data lives in the QueryCache, not inside any one component.

---

## Automatic Retries

If a fetch fails, React Query retries it automatically (3 times by default) before giving up and setting `isError: true`.

```tsx
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  retry: 2, // override: retry only twice
});
```

You do not need try/catch or manual retry logic in your components.

---

## Background Refetching

React Query considers cached data "stale" after a short time. When the user comes back to the page (switches tabs and returns), it silently refetches in the background and updates the UI if the data changed.

```tsx
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 30_000,       // data is fresh for 30 seconds, no refetch during this time
  refetchOnWindowFocus: true, // refetch when user returns to tab (default: true)
});
```

The user sees the old data instantly, then gets the update a moment later — no loading spinner needed.

---

## Mutation

`useQuery` is for reading data. `useMutation` is for writing — creating, updating, or deleting.

```tsx
const addPost = useMutation({
  mutationFn: (newPost) => fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(newPost),
  }),
});

// Call it from a button click
<button onClick={() => addPost.mutate({ title: 'Hello world' })}>
  Add Post
</button>
```

---

## Invalidation

After a mutation succeeds, the cached data is out of date. You tell React Query to throw away the old cache and refetch by **invalidating** the query key.

```tsx
const queryClient = useQueryClient();

const addPost = useMutation({
  mutationFn: (newPost) => fetch('/api/posts', { method: 'POST', body: JSON.stringify(newPost) }),
  onSuccess: () => {
    // Throw away cached posts and refetch fresh list
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});
```

This is the typical pattern: mutate → invalidate → React Query refetches → UI updates.

---

## Pagination

For paginated data, pass the current page in the query key. When the page changes, React Query fetches that page automatically.

```tsx
const [page, setPage] = useState(1);

const { data } = useQuery({
  queryKey: ['posts', page],
  queryFn: () => fetchPosts(page),
});

<button onClick={() => setPage(p => p + 1)}>Next page</button>
```

For a smoother experience, `keepPreviousData: true` keeps the old page visible while the new one loads.

---

## Prefetching

Prefetching lets you load data before the user navigates to a page — so it feels instant when they arrive.

```tsx
// On hover, preload the post detail page
<a
  onMouseEnter={() =>
    queryClient.prefetchQuery({
      queryKey: ['posts', post.id],
      queryFn: () => fetchPost(post.id),
    })
  }
  href={`/posts/${post.id}`}
>
  {post.title}
</a>
```

When the user clicks, the data is already in the cache and the page renders without a loading state.

