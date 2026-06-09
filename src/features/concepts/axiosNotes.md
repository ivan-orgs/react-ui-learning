# Axios and API Communication Notes

Axios is a library that makes HTTP requests simpler than the built-in `fetch`. It automatically parses JSON, handles errors more cleanly, and lets you configure shared behaviour once for all requests.

---

## 1. Why Axios over fetch?

```ts
// fetch — you must manually check for errors and parse JSON every time
const res = await fetch('/api/users');
if (!res.ok) throw new Error('Request failed');
const data = await res.json(); // extra step

// Axios — does both automatically
const { data } = await axios.get('/api/users');
```

Axios also makes it easy to share config (base URL, headers, interceptors) across every request in your app.

---

## 2. Creating an Axios Client

Instead of calling `axios.get(...)` directly everywhere, you create a **configured instance** once and import it across your app.

```ts
// src/shared/api/httpClient.ts
import axios from 'axios';

export const http = axios.create({
  baseURL: 'http://localhost:8080', // all requests start from here
  timeout: 10_000,                 // fail if no response in 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});
```

Now instead of writing the full URL every time, you just write the path:

```ts
http.get('/tasks');      // → GET http://localhost:8080/tasks
http.post('/reviews');   // → POST http://localhost:8080/reviews
```

---

## 3. GET — Fetching Data

`http.get(url, config?)` sends a GET request. Axios puts the response body in `response.data`.

```ts
// Basic GET
const response = await http.get('/tasks');
const tasks = response.data; // the JSON body Spring Boot sent back

// GET with query params — Axios serialises the object to ?status=pending&priority=high
const response = await http.get('/tasks', {
  params: { status: 'pending', priority: 'high' },
});
// → GET /tasks?status=pending&priority=high
```

In this project `fetchTasks` uses this pattern:

```ts
export async function fetchTasks(filters: TaskFilters = {}) {
  const response = await http.get<ApiTaskResponse>('/tasks', { params: filters });
  return response.data;
}
```

The generic `<ApiTaskResponse>` tells TypeScript what shape `response.data` will be.

---

## 4. POST — Sending Data

`http.post(url, body, config?)` sends a POST request with a JSON body.

```ts
// Save a review
const response = await http.post('/reviews', {
  id: 42,
  review: 'approved',
  note: 'Looks good',
});
// Body is automatically serialised to JSON
// Spring Boot receives it as a @RequestBody object
```

---

## 5. Spring Boot API Responses

When Spring Boot returns data, Axios gives you the full response object. The actual data is in `response.data`.

```ts
// Spring Boot sends:
// HTTP 200 OK
// { "rows": [...], "total": 12 }

const response = await http.get('/tasks');

response.status      // 200
response.statusText  // "OK"
response.headers     // response headers
response.data        // { rows: [...], total: 12 }  ← this is what you use
```

If Spring Boot returns an error (e.g. 404, 500), Axios **throws automatically** — unlike `fetch` which only throws on network failure.

```ts
// Spring Boot sends HTTP 404
// Axios throws an AxiosError — no need to check response.ok manually
try {
  const response = await http.get('/tasks/999');
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.log(error.response?.status);  // 404
    console.log(error.response?.data);    // Spring Boot error body
  }
}
```

---

## 6. Request Interceptors — Run Code Before Every Request

An interceptor is a function that runs automatically for every request (or response) — you register it once, it applies everywhere.

A request interceptor is useful for **attaching auth tokens** to every request automatically.

```ts
// Attach the auth token to every outgoing request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // added to every request
  }

  return config; // must return config so the request continues
});
```

Flow:

```
Your code calls http.get('/tasks')
       ↓
Request interceptor runs (adds Authorization header)
       ↓
Request is sent to Spring Boot
```

---

## 7. Response Interceptors — Run Code After Every Response

A response interceptor runs after every response comes back — useful for **handling errors globally** instead of repeating the same catch logic in every component.

```ts
http.interceptors.response.use(
  (response) => {
    return response; // success — just pass the response through
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — redirect to login
      window.location.href = '/login';
    }

    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error); // re-throw so the caller can still catch it
  }
);
```

Flow:

```
Spring Boot responds
       ↓
Response interceptor runs (checks for 401, 500, etc.)
       ↓
Your .then() or await receives the response (or the error is thrown)
```

---

## 8. Auth Headers

There are two ways to set auth headers. The interceptor approach (above) is preferred for real apps — the manual approach is for one-off cases.

```ts
// Option A — per request (manual, not recommended for every call)
http.get('/tasks', {
  headers: { Authorization: `Bearer ${token}` },
});

// Option B — globally via interceptor (recommended)
// Set once → all requests automatically include the header
http.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  return config;
});
```

---

## 9. Loader Coordination

"Loader coordination" means tracking whether a request is in progress so you can show a spinner or disable a button. With React Query this is mostly handled for you via `isLoading` and `isFetching`. But when using Axios directly, you manage it yourself.

```tsx
function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadTasks() {
    setLoading(true);  // show spinner
    setError(null);

    try {
      const response = await http.get('/tasks');
      setTasks(response.data.rows);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false); // hide spinner — whether it succeeded or failed
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>{error}</p>;
  return tasks.map(t => <p key={t.id}>{t.title}</p>);
}
```

> **With React Query** (`useQuery`), you get `isLoading`, `isFetching`, and `isError` for free — no need to manage these manually.

---

## 10. Environment-Aware Behaviour

The base URL of your API is different in development (`localhost:8080`) and production (a real domain). Environment variables let you configure this without changing code.

```ts
// .env.development
VITE_API_BASE_URL=http://localhost:8080

// .env.production
VITE_API_BASE_URL=https://api.myapp.com
```

```ts
// httpClient.ts — reads the right URL for the current environment
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Vite injects this at build time
  timeout: 10_000,
});
```

When you run `npm run dev`, Vite uses `.env.development`. When you build for production, it uses `.env.production`. Your code stays the same.

---

## How It All Fits Together

```
Component calls fetchTasks(filters)
    ↓
fetchTasks calls http.get('/tasks', { params: filters })
    ↓
Request interceptor runs — adds Authorization: Bearer <token>
    ↓
Request goes to Spring Boot at http://localhost:8080/tasks
    ↓
Spring Boot responds with { rows: [...], total: 12 }
    ↓
Response interceptor runs — checks for 401/500
    ↓
Axios returns response.data to fetchTasks
    ↓
React Query caches it and gives it to the component
```

---

## Quick Reference

| Concept | What it does | Code |
|---|---|---|
| `axios.create()` | Create a configured Axios instance | `axios.create({ baseURL, timeout })` |
| `http.get()` | Fetch data from the server | `http.get('/tasks', { params })` |
| `http.post()` | Send data to the server | `http.post('/reviews', body)` |
| `response.data` | The actual response body | `const { data } = await http.get(...)` |
| Request interceptor | Run code before every request (e.g. add token) | `http.interceptors.request.use(fn)` |
| Response interceptor | Run code after every response (e.g. handle 401) | `http.interceptors.response.use(fn, errFn)` |
| Auth header | Send a JWT token with requests | `Authorization: Bearer <token>` |
| Loader state | Track loading/error manually | `setLoading(true)` → `finally { setLoading(false) }` |
| Environment URL | Different base URL per environment | `import.meta.env.VITE_API_BASE_URL` |
