type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string | FormData;
  headers?: Record<string, string>;
};

const fetcher = async (url: string, options: RequestOptions) => {
  if (!options.headers) {
    options.headers = {
      "Content-Type": "application/json",
    };
  }

  return fetch(url, {
    ...options,
  }).then(async (res) => {
    if (!res.ok) {
      const r = res.json();
      throw r;
    }

    if (res.status === 204) {
      return null;
    }

    return res.json();
  });
};

export default fetcher;
