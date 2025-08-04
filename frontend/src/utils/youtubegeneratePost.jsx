"use server";

export async function generatePost(data) {
  try {
    const response = await fetch("http://localhost:8000/generate/youtube", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.detail || "Failed to generate post");
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    throw new Error(`API Error: ${error.message}`);
  }
}
