export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Handle contact expert form submission
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
