type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: "string" | Record<string, unknown>;
};

export const apiRequest = async <T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = "GET", body } = options;
  const headers = {
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status !== 200) {
    // JSONのエラーメッセージをパース（なければstatusText）
    let message = res.statusText;
    try {
      const data = await res.json();
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // JSONでなければ無視
    }

    throw new HttpError(res.status, message);
  }

  const data = await res.json();
  return data.data;
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}
